const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("Ethernaut - Three", function () {
  async function deployContract() {
    const [deployer] = await ethers.getSigners();

    const EthernautThreeCoinFlip = await ethers.getContractFactory(
      "EthernautThreeCoinFlip"
    );
    const ethernautThreeCoinFlip = await EthernautThreeCoinFlip.deploy();
    await ethernautThreeCoinFlip.deployed();

    const EthernautThreeCoinFlipExploit = await ethers.getContractFactory(
      "EthernautThreeCoinFlipExploit"
    );
    const ethernautThreeCoinFlipExploit =
      await EthernautThreeCoinFlipExploit.deploy(
        ethernautThreeCoinFlip.address
      );
    await ethernautThreeCoinFlipExploit.deployed();

    return { deployer, ethernautThreeCoinFlip, ethernautThreeCoinFlipExploit };
  }

  describe("Exploit", function () {
    it("User can predict flips 10 times in a row", async function () {
      const {
        deployer,
        ethernautThreeCoinFlip,
        ethernautThreeCoinFlipExploit,
      } = await loadFixture(deployContract);

      expect(await ethernautThreeCoinFlip.consecutiveWins()).to.equal(0);

      for (let i = 0; i < 10; i++) {
        await ethernautThreeCoinFlipExploit.connect(deployer).exploit();
      }

      expect(await ethernautThreeCoinFlip.consecutiveWins()).to.equal(10);
    });
  });
});
