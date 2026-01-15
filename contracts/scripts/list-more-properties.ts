import { ethers } from "hardhat";
import fs from "fs";

async function main() {
    const addresses = JSON.parse(fs.readFileSync("deployed_addresses.json", "utf8"));
    const realEstateAddress = addresses.RealEstate;

    console.log(`Listing properties on RealEstate at ${realEstateAddress}...`);

    const RealEstate = await ethers.getContractFactory("RealEstate");
    const realEstate = RealEstate.attach(realEstateAddress);

    // Property 2
    console.log("Listing 'Sunny Villa'...");
    const tx1 = await realEstate.listProperty(
        "Sunny Villa",
        "Miami, FL",
        "Beautiful vacation home near the beach",
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=400",
        ethers.parseEther("0.1"), // 0.1 MNT
        200 // 200 Shares
    );
    await tx1.wait();
    console.log("Sunny Villa listed.");

    // Property 3
    console.log("Listing 'Mountain Cabin'...");
    const tx2 = await realEstate.listProperty(
        "Mountain Cabin",
        "Aspen, CO",
        "Cozy winter retreat for skiing enthusiasts",
        "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=400",
        ethers.parseEther("0.08"), // 0.08 MNT
        150 // 150 Shares
    );
    await tx2.wait();
    console.log("Mountain Cabin listed.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
