const hre = require("hardhat");

async function main() {
  const ForgeableNFT = await hre.ethers.getContractFactory("ForgeableNFT");
  const forgeableNFT = await ForgeableNFT.deploy();
  await forgeableNFT.deployed();

  const Forge = await hre.ethers.getContractFactory("Forge");
  const forge = await Forge.deploy(forgeableNFT.address);
  await forge.deployed();

  await forgeableNFT.grantRole(
    ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE")),
    forge.address
  );
  await forgeableNFT.setURI(
    "https://gateway.pinata.cloud/ipfs/QmQuLt2abVQsCFNChLuWT6o7SEoBanDi3s8LPx2UAxy21W/{id}.png"
  );

  console.log(`ForgeableNFT ${forgeableNFT.address}`);
  console.log(`Forge ${forge.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
