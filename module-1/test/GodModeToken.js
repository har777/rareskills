const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("GodModeToken", function () {
  async function deployGodModeToken() {
    const [deployer, god, user1, user2] = await ethers.getSigners();

    const GodModeToken = await ethers.getContractFactory("GodModeToken");
    const godModeToken = await GodModeToken.deploy(god.address);

    return { deployer, god, user1, user2, godModeToken };
  }

  describe("God mode", function () {
    it("God has infinite allowance for any address", async function () {
      const { god, user1, user2, godModeToken } = await loadFixture(
        deployGodModeToken
      );

      expect(await godModeToken.allowance(user1.address, god.address)).to.equal(
        ethers.constants.MaxUint256
      );
      expect(await godModeToken.allowance(user2.address, god.address)).to.equal(
        ethers.constants.MaxUint256
      );
    });

    it("Non gods have 0 allowance for any address by default", async function () {
      const { god, user1, user2, godModeToken } = await loadFixture(
        deployGodModeToken
      );

      expect(await godModeToken.allowance(god.address, user1.address)).to.equal(
        0
      );
      expect(
        await godModeToken.allowance(user1.address, user2.address)
      ).to.equal(0);
    });
  });

  describe("reverts", function () {
    it("initialization with god being a zero address", async function () {
      const GodModeToken = await ethers.getContractFactory("GodModeToken");
      await expect(
        GodModeToken.deploy(ethers.constants.AddressZero)
      ).to.be.revertedWith("god cannot be a zero address");
    });
  });
});
