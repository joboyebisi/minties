// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SavingsCircle
 * @notice Manages group savings circles with yield on locked funds
 */
contract SavingsCircle is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdc;
    
    struct Member {
        address memberAddress;
        uint256 totalContributed;
        uint256 totalWithdrawn;
        bool isActive;
        uint256 joinedAt;
    }

    struct Circle {
        address creator;
        uint256 targetAmount;          // Weekly target per member
        uint256 lockPeriod;            // Lock period in seconds
        uint256 yieldPercentage;       // Yield percentage (basis points, e.g., 500 = 5%)
        uint256 totalContributed;      // Total contributed by all members
        uint256 lockedAmount;          // Amount currently locked for yield
        uint256 lockStartTime;         // When the current lock period started
        uint256 lockEndTime;           // When the current lock period ends
        uint256 cycleNumber;           // Current cycle number
        bool isActive;
        address[] members;
        mapping(address => Member) memberData;
        mapping(uint256 => uint256) cycleContributions; // cycle => total contributions
    }

    mapping(bytes32 => Circle) public circles;
    mapping(address => bytes32[]) public userCircles; // User's circle IDs
    
    uint256 public totalCircles;
    uint256 public constant BASIS_POINTS = 10000;
    
    // Yield provider (could be a DeFi protocol address)
    address public yieldProvider;
    
    event CircleCreated(
        bytes32 indexed circleId,
        address indexed creator,
        uint256 targetAmount,
        uint256 lockPeriod,
        uint256 yieldPercentage
    );
    
    event MemberJoined(
        bytes32 indexed circleId,
        address indexed member
    );
    
    event ContributionMade(
        bytes32 indexed circleId,
        address indexed member,
        uint256 amount,
        uint256 cycleNumber
    );
    
    event FundsLocked(
        bytes32 indexed circleId,
        uint256 amount,
        uint256 lockEndTime
    );
    
    event FundsUnlocked(
        bytes32 indexed circleId,
        uint256 amount,
        uint256 yieldEarned
    );
    
    event Withdrawal(
        bytes32 indexed circleId,
        address indexed member,
        uint256 amount
    );

    constructor(address _usdc, address _yieldProvider) Ownable(msg.sender) {
        require(_usdc != address(0), "Invalid USDC address");
        usdc = IERC20(_usdc);
        yieldProvider = _yieldProvider;
    }

    /**
     * @notice Create a new savings circle
     * @param circleId Unique identifier for the circle
     * @param targetAmount Weekly target amount per member (in USDC, 6 decimals)
     * @param lockPeriod Lock period in seconds
     * @param yieldPercentage Yield percentage in basis points (e.g., 500 = 5%)
     */
    function createCircle(
        bytes32 circleId,
        uint256 targetAmount,
        uint256 lockPeriod,
        uint256 yieldPercentage
    ) external {
        require(circles[circleId].creator == address(0), "Circle ID already exists");
        require(targetAmount > 0, "Target amount must be greater than 0");
        require(lockPeriod > 0, "Lock period must be greater than 0");
        require(yieldPercentage <= BASIS_POINTS, "Yield percentage too high");

        Circle storage circle = circles[circleId];
        circle.creator = msg.sender;
        circle.targetAmount = targetAmount;
        circle.lockPeriod = lockPeriod;
        circle.yieldPercentage = yieldPercentage;
        circle.isActive = true;
        circle.members.push(msg.sender);
        circle.memberData[msg.sender] = Member({
            memberAddress: msg.sender,
            totalContributed: 0,
            totalWithdrawn: 0,
            isActive: true,
            joinedAt: block.timestamp
        });

        userCircles[msg.sender].push(circleId);
        totalCircles++;

        emit CircleCreated(circleId, msg.sender, targetAmount, lockPeriod, yieldPercentage);
        emit MemberJoined(circleId, msg.sender);
    }

    /**
     * @notice Join an existing savings circle
     * @param circleId The circle identifier
     */
    function joinCircle(bytes32 circleId) external {
        Circle storage circle = circles[circleId];
        require(circle.creator != address(0), "Circle does not exist");
        require(circle.isActive, "Circle is not active");
        require(!circle.memberData[msg.sender].isActive, "Already a member");

        circle.members.push(msg.sender);
        circle.memberData[msg.sender] = Member({
            memberAddress: msg.sender,
            totalContributed: 0,
            totalWithdrawn: 0,
            isActive: true,
            joinedAt: block.timestamp
        });

        emit MemberJoined(circleId, msg.sender);
    }

    /**
     * @notice Contribute to the savings circle
     * @param circleId The circle identifier
     * @param amount Amount to contribute (in USDC, 6 decimals)
     */
    function contribute(bytes32 circleId, uint256 amount) external nonReentrant {
        Circle storage circle = circles[circleId];
        require(circle.isActive, "Circle is not active");
        require(circle.memberData[msg.sender].isActive, "Not a member");
        require(amount > 0, "Amount must be greater than 0");

        // Transfer USDC from contributor
        usdc.safeTransferFrom(msg.sender, address(this), amount);

        // Update member data
        circle.memberData[msg.sender].totalContributed += amount;
        circle.totalContributed += amount;
        circle.cycleContributions[circle.cycleNumber] += amount;

        emit ContributionMade(circleId, msg.sender, amount, circle.cycleNumber);
    }

    /**
     * @notice Lock funds for yield generation
     * @param circleId The circle identifier
     * @param amount Amount to lock (must be <= available balance)
     */
    function lockFunds(bytes32 circleId, uint256 amount) external nonReentrant {
        Circle storage circle = circles[circleId];
        require(circle.creator == msg.sender || msg.sender == owner(), "Not authorized");
        require(circle.isActive, "Circle is not active");
        require(amount > 0, "Amount must be greater than 0");
        
        uint256 availableBalance = usdc.balanceOf(address(this));
        require(amount <= availableBalance, "Insufficient balance");

        // If there's an existing lock, it must be expired
        if (circle.lockEndTime > 0) {
            require(block.timestamp >= circle.lockEndTime, "Previous lock not expired");
        }

        // Transfer to yield provider (in a real implementation, this would interact with a DeFi protocol)
        // For now, we'll just track it
        circle.lockedAmount = amount;
        circle.lockStartTime = block.timestamp;
        circle.lockEndTime = block.timestamp + circle.lockPeriod;

        emit FundsLocked(circleId, amount, circle.lockEndTime);
    }

    /**
     * @notice Unlock funds after lock period with yield
     * @param circleId The circle identifier
     */
    function unlockFunds(bytes32 circleId) external nonReentrant {
        Circle storage circle = circles[circleId];
        require(circle.creator == msg.sender || msg.sender == owner(), "Not authorized");
        require(circle.lockedAmount > 0, "No locked funds");
        require(block.timestamp >= circle.lockEndTime, "Lock period not expired");

        uint256 lockedAmount = circle.lockedAmount;
        uint256 yieldEarned = (lockedAmount * circle.yieldPercentage) / BASIS_POINTS;
        uint256 totalAmount = lockedAmount + yieldEarned;

        // In a real implementation, this would withdraw from the yield provider
        // For now, we assume the yield is already in the contract
        // In production, you'd need to integrate with a yield protocol like Aave, Compound, etc.

        circle.lockedAmount = 0;
        circle.lockStartTime = 0;
        circle.lockEndTime = 0;
        circle.cycleNumber++;

        emit FundsUnlocked(circleId, lockedAmount, yieldEarned);
    }

    /**
     * @notice Withdraw funds from the circle
     * @param circleId The circle identifier
     * @param amount Amount to withdraw
     */
    function withdraw(bytes32 circleId, uint256 amount) external nonReentrant {
        Circle storage circle = circles[circleId];
        require(circle.memberData[msg.sender].isActive, "Not a member");
        require(amount > 0, "Amount must be greater than 0");

        // Calculate available balance (excluding locked funds)
        uint256 availableBalance = usdc.balanceOf(address(this)) - circle.lockedAmount;
        require(amount <= availableBalance, "Insufficient available balance");

        // Update member data
        circle.memberData[msg.sender].totalWithdrawn += amount;
        circle.totalContributed -= amount;

        // Transfer USDC to member
        usdc.safeTransfer(msg.sender, amount);

        emit Withdrawal(circleId, msg.sender, amount);
    }

    /**
     * @notice Get circle details
     * @param circleId The circle identifier
     */
    function getCircle(bytes32 circleId) external view returns (
        address creator,
        uint256 targetAmount,
        uint256 lockPeriod,
        uint256 yieldPercentage,
        uint256 totalContributed,
        uint256 lockedAmount,
        uint256 lockEndTime,
        uint256 cycleNumber,
        bool isActive,
        uint256 memberCount
    ) {
        Circle storage circle = circles[circleId];
        return (
            circle.creator,
            circle.targetAmount,
            circle.lockPeriod,
            circle.yieldPercentage,
            circle.totalContributed,
            circle.lockedAmount,
            circle.lockEndTime,
            circle.cycleNumber,
            circle.isActive,
            circle.members.length
        );
    }

    /**
     * @notice Get member details
     * @param circleId The circle identifier
     * @param member The member address
     */
    function getMember(bytes32 circleId, address member) external view returns (
        uint256 totalContributed,
        uint256 totalWithdrawn,
        bool isActive,
        uint256 joinedAt
    ) {
        Member storage memberData = circles[circleId].memberData[member];
        return (
            memberData.totalContributed,
            memberData.totalWithdrawn,
            memberData.isActive,
            memberData.joinedAt
        );
    }

    /**
     * @notice Get all members of a circle
     * @param circleId The circle identifier
     */
    function getMembers(bytes32 circleId) external view returns (address[] memory) {
        return circles[circleId].members;
    }

    /**
     * @notice Set yield provider address
     * @param _yieldProvider New yield provider address
     */
    function setYieldProvider(address _yieldProvider) external onlyOwner {
        require(_yieldProvider != address(0), "Invalid address");
        yieldProvider = _yieldProvider;
    }
}

