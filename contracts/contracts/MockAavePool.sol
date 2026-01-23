// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockAavePool {
    mapping(address => uint256) public liquidityIndex;
    mapping(address => uint256) public currentLiquidityRate;

    event Supply(address indexed reserve, address user, address onBehalfOf, uint256 amount, uint16 referralCode);
    event Withdraw(address indexed reserve, address indexed user, address indexed to, uint256 amount);

    constructor() {
        // Set mock APY ~5% (in Ray 1e27)
        // 5% = 0.05 * 1e27 = 50000000000000000000000000
        currentLiquidityRate[address(0)] = 50000000000000000000000000; 
    }

    function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external {
        // Transfer 'asset' from msg.sender to this contract
        IERC20(asset).transferFrom(msg.sender, address(this), amount);
        emit Supply(asset, msg.sender, onBehalfOf, amount, referralCode);
    }

    function withdraw(address asset, uint256 amount, address to) external returns (uint256) {
        // Transfer 'asset' from this contract to 'to'
        IERC20(asset).transfer(to, amount);
        emit Withdraw(asset, msg.sender, to, amount);
        return amount;
    }

    function getReserveData(address asset) external view returns (
        uint256 configuration,
        uint128 _liquidityIndex,
        uint128 _currentLiquidityRate,
        uint128 variableBorrowIndex,
        uint128 currentVariableBorrowRate,
        uint128 currentStableBorrowRate,
        uint40 lastUpdateTimestamp,
        uint16 id,
        address aTokenAddress,
        address stableDebtTokenAddress,
        address variableDebtTokenAddress,
        address interestRateStrategyAddress,
        uint128 unbacked,
        uint128 isolationModeTotalDebt
    ) {
        return (
            0,
            0,
            uint128(currentLiquidityRate[address(0)]), // Return fixed 5%
            0, 0, 0, 0, 0,
            address(0), address(0), address(0), address(0),
            0, 0
        );
    }
}
