import { ethers } from "hardhat";
import fs from "fs";

async function main() {
    const addresses = JSON.parse(fs.readFileSync("deployed_addresses.json", "utf8"));
    const realEstateAddress = addresses.RealEstate;

    console.log(`Funding RealEstate at ${realEstateAddress}...`);

    const [signer] = await ethers.getSigners();
    console.log(`Sending from: ${signer.address}`);

    const tx = await signer.sendTransaction({
        to: realEstateAddress,
        value: ethers.parseEther("2.0") // Send 2 MNT for liquidity
    });

    await tx.wait();
    console.log("RealEstate funded with 2.0 MNT.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
