import { ethers } from "hardhat";

async function main() {
    console.log("Deploying RealEstate contract...");

    const RealEstate = await ethers.getContractFactory("RealEstate");
    const realEstate = await RealEstate.deploy();

    await realEstate.waitForDeployment();

    const address = await realEstate.getAddress();
    console.log(`RealEstate deployed to: ${address}`);

    // Listing a demo property
    console.log("Listing demo property 'Downtown Loft'...");
    const tx = await realEstate.listProperty(
        "Downtown Loft",
        "Manhattan, NY",
        "Luxury loft in the heart of the city",
        "https://example.com/loft.jpg",
        ethers.parseEther("0.05"), // Very cheap for hackathon demo relevance (0.05 MNT)
        100 // 100 Shares
    );
    await tx.wait();
    console.log("Demo property listed.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
