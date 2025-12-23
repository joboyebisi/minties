import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

// USDC address on Sepolia
const USDC_SEPOLIA = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy GiftEscrow
  console.log("\nDeploying GiftEscrow...");
  const GiftEscrow = await ethers.getContractFactory("GiftEscrow");
  const giftEscrow = await GiftEscrow.deploy(USDC_SEPOLIA);
  await giftEscrow.waitForDeployment();
  const giftEscrowAddress = await giftEscrow.getAddress();
  console.log("GiftEscrow deployed to:", giftEscrowAddress);

  // Deploy SavingsCircle
  console.log("\nDeploying SavingsCircle...");
  const SavingsCircle = await ethers.getContractFactory("SavingsCircle");
  // For now, use zero address as yield provider (can be updated later)
  const savingsCircle = await SavingsCircle.deploy(USDC_SEPOLIA, ethers.ZeroAddress);
  await savingsCircle.waitForDeployment();
  const savingsCircleAddress = await savingsCircle.getAddress();
  console.log("SavingsCircle deployed to:", savingsCircleAddress);

  console.log("\n=== Deployment Summary ===");
  console.log("GiftEscrow:", giftEscrowAddress);
  console.log("SavingsCircle:", savingsCircleAddress);
  console.log("\nSave these addresses to your .env file:");
  console.log(`GIFT_ESCROW_ADDRESS=${giftEscrowAddress}`);
  console.log(`SAVINGS_CIRCLE_ADDRESS=${savingsCircleAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

