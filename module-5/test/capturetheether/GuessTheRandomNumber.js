const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { utils } = require("ethers");
const { BigNumber } = require("@ethersproject/bignumber");

describe("Capture The Ether - GuessTheRandomNumberChallenge", function () {
  async function deployContract() {
    const [deployer] = await ethers.getSigners();

    const GuessTheRandomNumberChallenge = await ethers.getContractFactory(
      "GuessTheRandomNumberChallenge"
    );
    const guessTheRandomNumberChallenge =
      await GuessTheRandomNumberChallenge.deploy({
        value: ethers.constants.WeiPerEther,
      });
    const transaction = await guessTheRandomNumberChallenge.deployed();
    const deployTransaction = await transaction.deployTransaction.wait();

    return { deployer, guessTheRandomNumberChallenge, deployTransaction };
  }

  describe("Exploit", function () {
    it("Successful guess", async function () {
      const { deployer, guessTheRandomNumberChallenge, deployTransaction } =
        await loadFixture(deployContract);

      expect(await guessTheRandomNumberChallenge.isComplete()).to.equal(false);

      const blockNumber = deployTransaction.blockNumber;
      const prevBlockNumber = blockNumber - 1;

      const currentBlock =
        await guessTheRandomNumberChallenge.provider.getBlock(blockNumber);
      const prevBlock = await guessTheRandomNumberChallenge.provider.getBlock(
        prevBlockNumber
      );

      const prevBlockHash = prevBlock.hash;
      const blockTimestamp = currentBlock.timestamp;

      const guess = BigNumber.from(
        utils.solidityKeccak256(
          ["bytes32", "uint256"],
          [prevBlockHash, blockTimestamp]
        )
      ).mask(8);

      await guessTheRandomNumberChallenge
        .connect(deployer)
        .guess(guess, { value: ethers.constants.WeiPerEther });
      expect(await guessTheRandomNumberChallenge.isComplete()).to.equal(true);
    });
  });
});
