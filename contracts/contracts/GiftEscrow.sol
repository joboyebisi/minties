// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title GiftEscrow
 * @notice Manages claimable USDC gifts with various claim conditions
 */
contract GiftEscrow is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdc;
    
    enum GiftType {
        SingleUse,      // Can be claimed once
        MultiUse,       // Can be claimed multiple times
        Scheduled       // Scheduled for future claim
    }

    struct Gift {
        address creator;
        uint256 amount;
        uint256 remainingAmount;
        GiftType giftType;
        uint256 maxClaims;
        uint256 currentClaims;
        uint256 expiryTime;
        bytes32 passwordHash; // 0x0 if no password
        bool isActive;
        mapping(address => bool) claimedBy; // For single-use tracking
    }

    mapping(bytes32 => Gift) public gifts;
    mapping(address => uint256[]) public userGifts; // Creator's gift IDs
    
    uint256 public totalGifts;
    uint256 public totalClaimed;
    
    event GiftCreated(
        bytes32 indexed giftId,
        address indexed creator,
        uint256 amount,
        GiftType giftType,
        uint256 expiryTime
    );
    
    event GiftClaimed(
        bytes32 indexed giftId,
        address indexed claimer,
        uint256 amount
    );
    
    event GiftCancelled(bytes32 indexed giftId);
    event GiftExpired(bytes32 indexed giftId);

    constructor(address _usdc) Ownable(msg.sender) {
        require(_usdc != address(0), "Invalid USDC address");
        usdc = IERC20(_usdc);
    }

    /**
     * @notice Create a new gift
     * @param giftId Unique identifier for the gift
     * @param amount Total amount of USDC to gift
     * @param giftType Type of gift (SingleUse, MultiUse, Scheduled)
     * @param maxClaims Maximum number of claims (for MultiUse)
     * @param expiryTime Unix timestamp when gift expires (0 for no expiry)
     * @param passwordHash Hash of password if password-protected (0x0 for no password)
     */
    function createGift(
        bytes32 giftId,
        uint256 amount,
        GiftType giftType,
        uint256 maxClaims,
        uint256 expiryTime,
        bytes32 passwordHash
    ) external nonReentrant {
        require(gifts[giftId].creator == address(0), "Gift ID already exists");
        require(amount > 0, "Amount must be greater than 0");
        require(
            giftType == GiftType.SingleUse || maxClaims > 0,
            "MultiUse must have maxClaims > 0"
        );

        // Transfer USDC from creator
        usdc.safeTransferFrom(msg.sender, address(this), amount);

        Gift storage gift = gifts[giftId];
        gift.creator = msg.sender;
        gift.amount = amount;
        gift.remainingAmount = amount;
        gift.giftType = giftType;
        gift.maxClaims = maxClaims;
        gift.currentClaims = 0;
        gift.expiryTime = expiryTime;
        gift.passwordHash = passwordHash;
        gift.isActive = true;

        userGifts[msg.sender].push(totalGifts);
        totalGifts++;

        emit GiftCreated(giftId, msg.sender, amount, giftType, expiryTime);
    }

    /**
     * @notice Claim a gift
     * @param giftId The gift identifier
     * @param password Plain text password (empty string if no password)
     */
    function claimGift(
        bytes32 giftId,
        string memory password
    ) external nonReentrant {
        Gift storage gift = gifts[giftId];
        require(gift.creator != address(0), "Gift does not exist");
        require(gift.isActive, "Gift is not active");
        require(gift.remainingAmount > 0, "Gift has no remaining amount");
        
        // Check expiry
        if (gift.expiryTime > 0) {
            require(block.timestamp <= gift.expiryTime, "Gift has expired");
        }

        // Check password if required
        if (gift.passwordHash != bytes32(0)) {
            bytes32 providedHash = keccak256(abi.encodePacked(password));
            require(providedHash == gift.passwordHash, "Invalid password");
        }

        // Check claim eligibility based on type
        if (gift.giftType == GiftType.SingleUse) {
            require(!gift.claimedBy[msg.sender], "Already claimed");
            gift.claimedBy[msg.sender] = true;
        } else if (gift.giftType == GiftType.MultiUse) {
            require(gift.currentClaims < gift.maxClaims, "Max claims reached");
        }

        // Calculate claim amount
        uint256 claimAmount;
        if (gift.giftType == GiftType.SingleUse) {
            claimAmount = gift.amount;
        } else {
            // For MultiUse, split amount equally
            claimAmount = gift.amount / gift.maxClaims;
        }

        require(claimAmount <= gift.remainingAmount, "Insufficient remaining amount");

        // Update gift state
        gift.remainingAmount -= claimAmount;
        gift.currentClaims++;
        
        if (gift.remainingAmount == 0) {
            gift.isActive = false;
        }

        // Transfer USDC to claimer
        usdc.safeTransfer(msg.sender, claimAmount);
        totalClaimed += claimAmount;

        emit GiftClaimed(giftId, msg.sender, claimAmount);
    }

    /**
     * @notice Cancel a gift and refund remaining amount
     * @param giftId The gift identifier
     */
    function cancelGift(bytes32 giftId) external nonReentrant {
        Gift storage gift = gifts[giftId];
        require(gift.creator == msg.sender, "Not the creator");
        require(gift.isActive, "Gift is not active");
        require(gift.remainingAmount > 0, "No remaining amount");

        uint256 refundAmount = gift.remainingAmount;
        gift.remainingAmount = 0;
        gift.isActive = false;

        usdc.safeTransfer(msg.sender, refundAmount);

        emit GiftCancelled(giftId);
    }

    /**
     * @notice Get gift details
     * @param giftId The gift identifier
     */
    function getGift(bytes32 giftId) external view returns (
        address creator,
        uint256 amount,
        uint256 remainingAmount,
        GiftType giftType,
        uint256 maxClaims,
        uint256 currentClaims,
        uint256 expiryTime,
        bool isActive
    ) {
        Gift storage gift = gifts[giftId];
        return (
            gift.creator,
            gift.amount,
            gift.remainingAmount,
            gift.giftType,
            gift.maxClaims,
            gift.currentClaims,
            gift.expiryTime,
            gift.isActive
        );
    }

    /**
     * @notice Check if an address has claimed a gift
     * @param giftId The gift identifier
     * @param claimer The address to check
     */
    function hasClaimed(bytes32 giftId, address claimer) external view returns (bool) {
        return gifts[giftId].claimedBy[claimer];
    }
}

