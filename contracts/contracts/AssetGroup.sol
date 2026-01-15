// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IRealEstate {
    function buyShare(uint256 _propertyId, uint256 _shares) external payable;
    function claimYield(uint256 _propertyId) external;
    function properties(uint256 _propertyId) external view returns (
        uint256 id,
        string memory title,
        string memory location,
        string memory description,
        string memory imageUrl,
        uint256 targetPrice,
        uint256 totalShares,
        uint256 sharesSold,
        uint256 pricePerShare,
        bool isActive,
        address payable owner
    );
}

contract AssetGroup is ReentrancyGuard {
    
    // Immutable State
    uint256 public propertyId;
    uint256 public targetShares;
    uint256 public totalCost;
    address[] public members;
    mapping(address => uint256) public equityBps; // Basis points (100 = 1%)
    mapping(address => uint256) public contributed;
    bool public isPurchased;
    uint256 public totalContributed;
    address public factory;
    
    IRealEstate public realEstateContract;

    // Yield Tracking
    uint256 public totalYieldReceived;
    mapping(address => uint256) public withdrawnYield;

    event Contribution(address indexed member, uint256 amount);
    event AssetPurchased(uint256 propertyId);
    event YieldReceived(uint256 amount);
    event YieldClaimed(address indexed member, uint256 amount);

    constructor(
        address _realEstateAddress,
        uint256 _propertyId,
        uint256 _targetShares,
        address[] memory _members,
        uint256[] memory _equityBps
    ) {
        realEstateContract = IRealEstate(_realEstateAddress);
        factory = msg.sender;
        propertyId = _propertyId;
        targetShares = _targetShares;
        members = _members;

        (, , , , , , , , uint256 pricePerShare, , ) = realEstateContract.properties(_propertyId);
        totalCost = pricePerShare * _targetShares;

        for (uint i = 0; i < _members.length; i++) {
            equityBps[_members[i]] = _equityBps[i];
        }
    }

    // 1. Contribute (Deposit)
    function contribute() external payable nonReentrant {
        require(!isPurchased, "Already purchased");
        require(equityBps[msg.sender] > 0, "Not a member");
        
        uint256 required = (totalCost * equityBps[msg.sender]) / 10000;
        require(contributed[msg.sender] + msg.value <= required, "Over contribution");

        contributed[msg.sender] += msg.value;
        totalContributed += msg.value;

        emit Contribution(msg.sender, msg.value);

        // Auto-purchase if full?
        if (totalContributed >= totalCost) {
            _purchaseAsset();
        }
    }

    function _purchaseAsset() internal {
        require(!isPurchased, "Already purchased");
        isPurchased = true;
        realEstateContract.buyShare{value: totalCost}(propertyId, targetShares);
        emit AssetPurchased(propertyId);
    }

    // 2. Claim Yield (Pull from Real Estate, then push to member?)
    // Member calls this to get their share
    function claimMyYield() external nonReentrant {
        require(isPurchased, "Asset not owned");
        
        // 1. Pull latest yield from RealEstate to this contract
        uint256 balBefore = address(this).balance;
        try realEstateContract.claimYield(propertyId) {} catch {} 
        uint256 balAfter = address(this).balance;
        if (balAfter > balBefore) {
            totalYieldReceived += (balAfter - balBefore);
            emit YieldReceived(balAfter - balBefore);
        }

        // 2. Calculate Member Share
        // Total Share = TotalYieldReceived * equityBps / 10000
        uint256 memberTotalShare = (totalYieldReceived * equityBps[msg.sender]) / 10000;
        uint256 debt = withdrawnYield[msg.sender];
        uint256 pending = 0;
        
        if (memberTotalShare > debt) {
            pending = memberTotalShare - debt;
        }

        require(pending > 0, "No yield due");

        withdrawnYield[msg.sender] += pending;
        payable(msg.sender).transfer(pending);
        
        emit YieldClaimed(msg.sender, pending);
    }

    // Receive ETH (yield)
    receive() external payable {}
}
