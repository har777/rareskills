const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { utils } = require("ethers");

describe("Capture The Ether - GuessTheSecretNumberChallenge", function () {
  async function deployContract() {
    const [deployer] = await ethers.getSigners();

    const GuessTheSecretNumberChallenge = await ethers.getContractFactory(
      "GuessTheSecretNumberChallenge"
    );
    const guessTheSecretNumberChallenge =
      await GuessTheSecretNumberChallenge.deploy({
        value: ethers.constants.WeiPerEther,
      });
    await guessTheSecretNumberChallenge.deployed();

    return { deployer, guessTheSecretNumberChallenge };
  }

  describe("Exploit", function () {
    it("Successful guess", async function () {
      const { deployer, guessTheSecretNumberChallenge } = await loadFixture(
        deployContract
      );

      expect(await guessTheSecretNumberChallenge.isComplete()).to.equal(false);

      let guess = null;
      for (let possibleAnswer = 0; possibleAnswer < 256; possibleAnswer++) {
        const hash = utils.solidityKeccak256(["uint8"], [possibleAnswer]);
        if (
          hash ===
          "0xdb81b4d58595fbbbb592d3661a34cdca14d7ab379441400cbfa1b78bc447c365"
        ) {
          guess = possibleAnswer;
          break;
        }
      }

      if (guess) {
        await guessTheSecretNumberChallenge
          .connect(deployer)
          .guess(guess, { value: ethers.constants.WeiPerEther });
      }

      expect(await guessTheSecretNumberChallenge.isComplete()).to.equal(true);
    });
  });
});
