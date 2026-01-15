import { ethers } from "hardhat";

async function main() {
    console.log("Starting Minties Deployment...");

    // 1. Deploy RealEstate
    const RealEstate = await ethers.getContractFactory("RealEstate");
    const realEstate = await RealEstate.deploy();
    await realEstate.waitForDeployment();
    const realEstateAddress = await realEstate.getAddress();
    console.log(`RealEstate deployed to: ${realEstateAddress}`);

    // 2. Deploy AssetGroupFactory
    const Factory = await ethers.getContractFactory("AssetGroupFactory");
    const factory = await Factory.deploy(realEstateAddress);
    await factory.waitForDeployment();
    const factoryAddress = await factory.getAddress();
    console.log(`AssetGroupFactory deployed to: ${factoryAddress}`);

    // 3. Setup Demo Data (List Propert)
    console.log("Listing demo property 'Downtown Loft'...");
    const tx = await realEstate.listProperty(
        "Downtown Loft",
        "Manhattan, NY",
        "Luxury loft in the heart of the city",
        "https://example.com/loft.jpg",
        ethers.parseEther("0.05"), // 0.05 MNT Total
        100 // 100 Shares
    );
    await tx.wait();
    console.log("Demo property listed.");

    const fs = require("fs");
    const addresses = {
        RealEstate: realEstateAddress,
        AssetGroupFactory: factoryAddress,
    };
    fs.writeFileSync("deployed_addresses.json", JSON.stringify(addresses, null, 2));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
