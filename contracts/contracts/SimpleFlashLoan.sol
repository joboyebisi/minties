// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Interfaces for Aave V3
interface IPool {
    function flashLoanSimple(
        address receiverAddress,
        address asset,
        uint256 amount,
        bytes calldata params,
        uint16 referralCode
    ) external;
}

interface IFlashLoanSimpleReceiver {
    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external returns (bool);
}

// Adapting Aave's base contract simplified
abstract contract FlashLoanSimpleReceiverBase is IFlashLoanSimpleReceiver {
    IPool public immutable POOL;

    constructor(address _addressProvider) {
        // For simplicity in this hackathon demo, we pass the Pool address directly or the provider.
        // On Sepolia, PoolAddressesProvider is 0x012bAC54348C0E635dCAc9D5FB99f06F24136C9A
        // But we usually interact with the POOL directly.
        // Let's passed the POOL address directly for simplicity if possible, or Provider.
        // Actually standard is Provider -> getPool. 
        // We will just store the POOL address for direct interaction to save code size for demo.
        POOL = IPool(_addressProvider); 
    }
}

contract SimpleFlashLoan is FlashLoanSimpleReceiverBase {
    address payable owner;

    event FlashLoanRequested(address token, uint256 amount);
    event FlashLoanExecuted(address token, uint256 amount, uint256 premium);

    // Sepolia Aave V3 Pool Address: 0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951
    constructor(address _poolAddress)
        FlashLoanSimpleReceiverBase(_poolAddress)
    {
        owner = payable(msg.sender);
    }

    function fn_RequestFlashLoan(address _token, uint256 _amount) public {
        address receiverAddress = address(this);
        address asset = _token;
        uint256 amount = _amount;
        bytes memory params = "";
        uint16 referralCode = 0;

        emit FlashLoanRequested(_token, _amount);

        POOL.flashLoanSimple(
            receiverAddress,
            asset,
            amount,
            params,
            referralCode
        );
    }
    
    // This function is called after your contract has received the flash loaned amount
    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        
        // Logic goes here (Arbitrage, etc.)
        // For demo: we just check we have the funds
        
        uint256 totalAmount = amount + premium;
        
        // Ensure we have enough to pay back (User must fund contract with premium beforehand for this demo)
        // Or we use the borrowed funds (if profitable). 
        // Here we assume contract has premium or we fail.
        IERC20(asset).approve(address(POOL), totalAmount);
        
        emit FlashLoanExecuted(asset, amount, premium);

        return true;
    }

    // Allow contract to receive ETH/funds for fees
    receive() external payable {}
    
    // Emergency withdraw
    function withdraw(address _token) external {
        require(msg.sender == owner, "Only owner");
        IERC20 token = IERC20(_token);
        token.transfer(owner, token.balanceOf(address(this)));
    }
}
