const { ethers } = require("hardhat");
import * as fs from "fs";

async function main() {
    console.log("Deploying SimpleFlashLoan to Sepolia...");

    // Aave V3 Pool on Sepolia
    const AAVE_POOL_SEPOLIA = "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951";

    const SimpleFlashLoan = await ethers.getContractFactory("SimpleFlashLoan");
    const flashLoan = await SimpleFlashLoan.deploy(AAVE_POOL_SEPOLIA);

    await flashLoan.waitForDeployment();

    const address = await flashLoan.getAddress();
    console.log(`SimpleFlashLoan deployed to: ${address}`);

    // Save address
    const addresses = {
        SimpleFlashLoan: address
    };

    // Read existing addresses if any (optional, but good for append)
    // For now just logging it is enough for the user to copy, but let's try to append to our big json
    // actually let's just output to console clearly.
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
