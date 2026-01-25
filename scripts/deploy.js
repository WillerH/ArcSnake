const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const baseUri = process.env.SNAKE_BASE_URI || "https://example.com/metadata/{id}.json";
  const prices = [
    hre.ethers.parseEther("1"),
    hre.ethers.parseEther("5"),
    hre.ethers.parseEther("10"),
    hre.ethers.parseEther("20"),
  ];

  const SnakeNFT = await hre.ethers.getContractFactory("SnakeNFT");
  const contract = await SnakeNFT.deploy(baseUri, prices);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("SnakeNFT deployed to:", address);
  console.log("Explorer:", `https://testnet.arcscan.app/address/${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

