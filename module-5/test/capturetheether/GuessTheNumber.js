const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("Capture The Ether - GuessTheNumberChallenge", function () {
  async function deployToken() {
    const [deployer] = await ethers.getSigners();

    const GuessTheNumberChallenge = await ethers.getContractFactory(
      "GuessTheNumberChallenge"
    );
    const guessTheNumberChallenge = await GuessTheNumberChallenge.deploy({
      value: ethers.constants.WeiPerEther,
    });
    await guessTheNumberChallenge.deployed();

    return { deployer, guessTheNumberChallenge };
  }

  describe("Exploit", function () {
    it("Successful guess", async function () {
      const { deployer, guessTheNumberChallenge } = await loadFixture(
        deployToken
      );

      expect(await guessTheNumberChallenge.isComplete()).to.equal(false);
      await guessTheNumberChallenge
        .connect(deployer)
        .guess(42, { value: ethers.constants.WeiPerEther });
      expect(await guessTheNumberChallenge.isComplete()).to.equal(true);
    });
  });
});
