const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Forge", function () {
  async function deployForge() {
    const [deployer, user1, user2] = await ethers.getSigners();

    const ForgeableNFT = await ethers.getContractFactory("ForgeableNFT");
    const forgeableNFT = await ForgeableNFT.deploy();
    await forgeableNFT.deployed();

    const Forge = await ethers.getContractFactory("Forge");
    const forge = await Forge.deploy(forgeableNFT.address);
    await forge.deployed();

    await forgeableNFT
      .connect(deployer)
      .grantRole(
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE")),
        forge.address
      );

    await forgeableNFT.connect(user1).setApprovalForAll(forge.address, true);
    await forgeableNFT.connect(user2).setApprovalForAll(forge.address, true);

    return { deployer, user1, user2, forgeableNFT, forge };
  }
});
