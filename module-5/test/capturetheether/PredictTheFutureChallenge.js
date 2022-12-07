const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("Capture The Ether - PredictTheFutureChallenge", function () {
  async function deployContract() {
    const PredictTheFutureChallenge = await ethers.getContractFactory(
      "PredictTheFutureChallenge"
    );
    const predictTheFutureChallenge = await PredictTheFutureChallenge.deploy({
      value: ethers.constants.WeiPerEther,
    });
    await predictTheFutureChallenge.deployed();

    const PredictTheFutureChallengeExploiter = await ethers.getContractFactory(
      "PredictTheFutureChallengeExploiter"
    );
    const predictTheFutureChallengeExploiter =
      await PredictTheFutureChallengeExploiter.deploy(
        predictTheFutureChallenge.address,
        { value: ethers.constants.WeiPerEther }
      );
    await predictTheFutureChallengeExploiter.deployed();

    return { predictTheFutureChallenge, predictTheFutureChallengeExploiter };
  }

  describe("Exploit", function () {
    it("Successful prediction", async function () {
      const { predictTheFutureChallenge, predictTheFutureChallengeExploiter } =
        await loadFixture(deployContract);

      expect(await predictTheFutureChallenge.isComplete()).to.equal(false);

      await predictTheFutureChallengeExploiter.setGuess();

      while (true) {
        await ethers.provider.send("evm_mine");
        await predictTheFutureChallengeExploiter.exploit();
        if (await predictTheFutureChallenge.isComplete()) {
          break;
        }
      }

      expect(await predictTheFutureChallenge.isComplete()).to.equal(true);
    });
  });
});
