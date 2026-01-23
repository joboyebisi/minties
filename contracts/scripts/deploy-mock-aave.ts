import { ethers } from "hardhat";

async function main() {
    console.log("Deploying MockAavePool...");

    const MockAavePool = await ethers.getContractFactory("MockAavePool");
    const pool = await MockAavePool.deploy();

    await pool.waitForDeployment();

    const address = await pool.getAddress();
    console.log(`MockAavePool deployed to: ${address}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
