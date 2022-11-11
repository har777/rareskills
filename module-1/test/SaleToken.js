const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("SaleToken", function () {
  async function deploySaleToken() {
    const [deployer, user1, user2] = await ethers.getSigners();

    const SaleToken = await ethers.getContractFactory("SaleToken");
    const saleToken = await SaleToken.deploy();

    return { deployer, user1, user2, saleToken };
  }

  describe("Buying", function () {
    it("Buy SaleToken at correct rate", async function () {
      const { user1, saleToken } = await loadFixture(deploySaleToken);

      await saleToken.connect(user1).buy(user1.address, {
        value: ethers.utils.parseEther("1"),
      });

      expect(await saleToken.provider.getBalance(saleToken.address)).to.equal(
        ethers.utils.parseEther("1")
      );
      expect(await saleToken.balanceOf(user1.address)).to.equal(
        10_000n * 10n ** 18n
      );
    });
  });

  describe("Withdrawing", function () {
    it("Withdraw all ether collected by SaleToken", async function () {
      const { deployer, user1, user2, saleToken } = await loadFixture(
        deploySaleToken
      );

      await saleToken.connect(user1).buy(user1.address, {
        value: ethers.utils.parseEther("1"),
      });
      await saleToken.connect(deployer).withdraw(user2.address);

      expect(await saleToken.provider.getBalance(user2.address)).to.equal(
        ethers.utils.parseEther("10001")
      );
    });
  });
});
