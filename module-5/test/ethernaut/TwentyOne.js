const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("Ethernaut - Twenty One", function () {
  async function deployContracts() {
    const EthernautTwentyOneShop = await ethers.getContractFactory(
      "EthernautTwentyOneShop"
    );
    const ethernautTwentyOneShop = await EthernautTwentyOneShop.deploy();
    await ethernautTwentyOneShop.deployed();

    const EthernautTwentyOneBuyer = await ethers.getContractFactory(
      "EthernautTwentyOneBuyer"
    );
    const ethernautTwentyOneBuyer = await EthernautTwentyOneBuyer.deploy(
      ethernautTwentyOneShop.address
    );
    await ethernautTwentyOneBuyer.deployed();

    return { ethernautTwentyOneShop, ethernautTwentyOneBuyer };
  }

  describe("Exploit", function () {
    it("Buyer can buy at 0 price", async function () {
      const { ethernautTwentyOneShop, ethernautTwentyOneBuyer } =
        await loadFixture(deployContracts);

      expect(await ethernautTwentyOneShop.price()).to.equal(100);
      expect(await ethernautTwentyOneShop.isSold()).to.equal(false);

      await ethernautTwentyOneBuyer.buy();

      expect(await ethernautTwentyOneShop.price()).to.equal(0);
      expect(await ethernautTwentyOneShop.isSold()).to.equal(true);
    });
  });
});
