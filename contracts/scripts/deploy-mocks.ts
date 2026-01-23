import { ethers } from "hardhat";

const fs = require("fs");

async function main() {
    console.log("Starting deployment of Mocks on Mantle Sepolia...");

    // 1. Deploy Mock USDC
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const usdc = await MockUSDC.deploy();
    await usdc.waitForDeployment();
    const usdcAddr = await usdc.getAddress();
    console.log(`MockUSDC deployed to: ${usdcAddr}`);

    // 2. Deploy Mock Aave Pool
    const MockAavePool = await ethers.getContractFactory("MockAavePool");
    const pool = await MockAavePool.deploy();
    await pool.waitForDeployment();
    const poolAddr = await pool.getAddress();
    console.log(`MockAavePool deployed to: ${poolAddr}`);

    // 3. Save to file
    const deployments = {
        mockUsdc: usdcAddr,
        mockAavePool: poolAddr,
        network: "mantleSepolia"
    };
    fs.writeFileSync("deployed-mocks.json", JSON.stringify(deployments, null, 2));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
