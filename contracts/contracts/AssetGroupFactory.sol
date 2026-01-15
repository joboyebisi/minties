// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AssetGroup.sol";

contract AssetGroupFactory {
    
    event GroupCreated(address indexed groupAddress, uint256 indexed propertyId, address indexed creator);
    
    address public immutable realEstateAddress;

    constructor(address _realEstateAddress) {
        realEstateAddress = _realEstateAddress;
    }

    function createGroup(
        uint256 _propertyId,
        uint256 _targetShares,
        address[] memory _members,
        uint256[] memory _equityBps
    ) external returns (address) {
        // Validation handled in AssetGroup constructor, but checking sum here saves gas on revert
        uint256 total = 0;
        for(uint i=0; i<_equityBps.length; i++) total += _equityBps[i];
        require(total == 10000, "Equity must sum to 100%");

        AssetGroup newGroup = new AssetGroup(
            realEstateAddress,
            _propertyId,
            _targetShares,
            _members,
            _equityBps
        );

        emit GroupCreated(address(newGroup), _propertyId, msg.sender);
        return address(newGroup);
    }
}
