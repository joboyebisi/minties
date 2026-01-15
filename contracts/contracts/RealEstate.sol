// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract RealEstate is Ownable, ReentrancyGuard {
    
    struct Property {
        uint256 id;
        string title;
        string location;
        string description;
        string imageUrl;
        uint256 targetPrice; // Total price in Wei (MNT)
        uint256 totalShares;
        uint256 sharesSold;
        uint256 pricePerShare;
        bool isActive;
        address payable owner; // The actual property seller
    }

    struct Investment {
        uint256 shares;
        uint256 amountPaid;
    }

    uint256 public nextPropertyId;
    mapping(uint256 => Property) public properties;
    // propertyId => investor => Investment
    mapping(uint256 => mapping(address => Investment)) public investments;
    // propertyId => list of investors
    mapping(uint256 => address[]) public propertyInvestors;

    event PropertyListed(uint256 indexed id, string title, uint256 targetPrice, uint256 totalShares);
    event SharePurchased(uint256 indexed id, address indexed investor, uint256 shares, uint256 amount);
    event FundsWithdrawn(uint256 indexed id, address indexed owner, uint256 amount);

    constructor() Ownable(msg.sender) {}

    function listProperty(
        string memory _title,
        string memory _location,
        string memory _description,
        string memory _imageUrl,
        uint256 _targetPrice,
        uint256 _totalShares
    ) external {
        require(_targetPrice > 0, "Price must be > 0");
        require(_totalShares > 0, "Shares must be > 0");

        uint256 pricePerShare = _targetPrice / _totalShares;
        require(pricePerShare > 0, "Price per share too low");

        properties[nextPropertyId] = Property({
            id: nextPropertyId,
            title: _title,
            location: _location,
            description: _description,
            imageUrl: _imageUrl,
            targetPrice: _targetPrice,
            totalShares: _totalShares,
            sharesSold: 0,
            pricePerShare: pricePerShare,
            isActive: true,
            owner: payable(msg.sender)
        });

        emit PropertyListed(nextPropertyId, _title, _targetPrice, _totalShares);
        nextPropertyId++;
    }

    // propertyId => investor => withdrawnYield
    mapping(uint256 => mapping(address => uint256)) public withdrawnYield;
    // propertyId => totalYieldPerShare
    mapping(uint256 => uint256) public totalYieldPerShare;

    event YieldDistributed(uint256 indexed id, uint256 amount);
    event YieldClaimed(uint256 indexed id, address indexed investor, uint256 amount);

    function buyShare(uint256 _propertyId, uint256 _shares) external payable nonReentrant {
        Property storage prop = properties[_propertyId];
        require(prop.isActive, "Property not active");
        require(_shares > 0, "Shares must be > 0");
        require(prop.sharesSold + _shares <= prop.totalShares, "Not enough shares available");

        uint256 cost = prop.pricePerShare * _shares;
        require(msg.value >= cost, "Insufficient funds sent");

        // Record investment
        if (investments[_propertyId][msg.sender].shares == 0) {
            propertyInvestors[_propertyId].push(msg.sender);
            // If buying later, assume they don't get past yield? 
            // Standard Scalable Reward Pattern:
            // rewardDebt = shares * accumulatedYieldPerShare
            // Here we use a simplified version for hackathon:
            // Just track what they HAVE withdrawn. 
            // Logic: pending = (shares * totalYieldPerShare) - withdrawn
            // When buying NEW shares, we must simulate that they 'already withdrew' the past yield for those shares so they don't claim it immediately.
           withdrawnYield[_propertyId][msg.sender] += _shares * totalYieldPerShare[_propertyId];
        } else {
             // Updates debt for new shares
             withdrawnYield[_propertyId][msg.sender] += _shares * totalYieldPerShare[_propertyId];
        }

        investments[_propertyId][msg.sender].shares += _shares;
        investments[_propertyId][msg.sender].amountPaid += cost;
        prop.sharesSold += _shares;

        // Refund excess
        if (msg.value > cost) {
            payable(msg.sender).transfer(msg.value - cost);
        }

        emit SharePurchased(_propertyId, msg.sender, _shares, cost);
    }

    function distributeYield(uint256 _propertyId) external payable nonReentrant {
        // Anyone can deposit yield (usually the manager)
        require(msg.value > 0, "Amount must be > 0");
        Property storage prop = properties[_propertyId];
        require(prop.sharesSold > 0, "No investors yet");

        // Add to global accumulator
        // yieldPerShare = msg.value / sharesSold
        // Note: Precision issues with integer division. Using a multiplier recommended usually? 
        // For Hackathon, let's keep it simple but be aware of dust.
        // Or just store raw balance? No, accumulator is better for O(1) claims.
        // We multiply by 1e18 for precision.
        
        totalYieldPerShare[_propertyId] += (msg.value * 1e18) / prop.sharesSold;
        
        emit YieldDistributed(_propertyId, msg.value);
    }

    function claimYield(uint256 _propertyId) external nonReentrant {
        uint256 shares = investments[_propertyId][msg.sender].shares;
        require(shares > 0, "No shares owned");

        uint256 accYield = totalYieldPerShare[_propertyId];
        uint256 due = (shares * accYield) / 1e18; // Reverse the precision multiplier
        uint256 paid = withdrawnYield[_propertyId][msg.sender] / 1e18; // Retrieve stored debt (also scaled?)
        // Ah, typically: withdrawn stores the 'debt' in scaled format.
        
        // Correct logic:
        // pending = (shares * acc) - debt
        uint256 debt = withdrawnYield[_propertyId][msg.sender];
        uint256 pending = (shares * accYield) - debt;
        pending = pending / 1e18; // Scale down at the end

        require(pending > 0, "No yield due");

        // Update debt
        withdrawnYield[_propertyId][msg.sender] += pending * 1e18;
        
        payable(msg.sender).transfer(pending);
        emit YieldClaimed(_propertyId, msg.sender, pending);
    }

    function sellShare(uint256 _propertyId, uint256 _shares) external nonReentrant {
        Property storage prop = properties[_propertyId];
        require(prop.isActive, "Property not active");
        require(investments[_propertyId][msg.sender].shares >= _shares, "Not enough shares");

        // Calculate current value
        uint256 payout = _shares * prop.pricePerShare;
        require(address(this).balance >= payout, "Contract insufficient liquidity");

        // Update User State
        investments[_propertyId][msg.sender].shares -= _shares;
        
        // Update Prop State
        prop.sharesSold -= _shares;

        // Yield Handling:
        // When selling, they lose claim to future yield. 
        // We reduce their 'debt' proportional to shares sold so remaining calculation holds?
        // Logic: pending = (shares * acc) - debt.
        // If shares drops, pending drops.
        // If we don't adjust debt, 'pending' might become negative (underflow) or incorrect.
        // Standard: debt = debt - (shares_sold * acc)
        uint256 debtToBurn = _shares * totalYieldPerShare[_propertyId];
        if (withdrawnYield[_propertyId][msg.sender] >= debtToBurn) {
            withdrawnYield[_propertyId][msg.sender] -= debtToBurn;
        } else {
             withdrawnYield[_propertyId][msg.sender] = 0; // Should not happen ideally
        }

        payable(msg.sender).transfer(payout);
        emit ShareSold(_propertyId, msg.sender, _shares, payout);
    }

    function updatePrice(uint256 _propertyId, uint256 _newPricePerShare) external onlyOwner {
        properties[_propertyId].pricePerShare = _newPricePerShare;
        // This is a "mark to market" update.
        // In a real system, this affects all future buys/sells.
    }

    // Allow contract to receive funds (for liquidity provider)
    receive() external payable {}

    event ShareSold(uint256 indexed id, address indexed investor, uint256 shares, uint256 payout);

    function getInvestors(uint256 _propertyId) external view returns (address[] memory) {
        return propertyInvestors[_propertyId];
    }
}
