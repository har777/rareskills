const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("Capture The Ether - GuessTheNewNumberChallenge", function () {
  async function deployContract() {
    const [deployer] = await ethers.getSigners();

    const GuessTheNewNumberChallenge = await ethers.getContractFactory(
      "GuessTheNewNumberChallenge"
    );
    const guessTheNewNumberChallenge = await GuessTheNewNumberChallenge.deploy({
      value: ethers.constants.WeiPerEther,
    });
    await guessTheNewNumberChallenge.deployed();

    const GuessTheNewNumberChallengeExploit = await ethers.getContractFactory(
      "GuessTheNewNumberChallengeExploit"
    );
    const guessTheNewNumberChallengeExploit =
      await GuessTheNewNumberChallengeExploit.deploy(
        guessTheNewNumberChallenge.address
      );
    await guessTheNewNumberChallengeExploit.deployed();

    return {
      deployer,
      guessTheNewNumberChallenge,
      guessTheNewNumberChallengeExploit,
    };
  }

  describe("Exploit", function () {
    it("Successful guess", async function () {
      const { guessTheNewNumberChallenge, guessTheNewNumberChallengeExploit } =
        await loadFixture(deployContract);

      expect(await guessTheNewNumberChallenge.isComplete()).to.equal(false);
      expect(
        await guessTheNewNumberChallengeExploit.provider.getBalance(
          guessTheNewNumberChallengeExploit.address
        )
      ).to.equal(0);
      await guessTheNewNumberChallengeExploit.exploit({
        value: ethers.constants.WeiPerEther,
      });
      expect(
        await guessTheNewNumberChallengeExploit.provider.getBalance(
          guessTheNewNumberChallengeExploit.address
        )
      ).to.equal(2n * 10n ** 18n);
      expect(await guessTheNewNumberChallenge.isComplete()).to.equal(true);
    });
  });
});
