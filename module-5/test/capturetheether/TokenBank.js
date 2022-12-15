const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("Capture The Ether - TokenBank", function () {
  async function deployToken() {
    const TokenBankChallengeExploit = await ethers.getContractFactory(
      "TokenBankChallengeExploit"
    );
    const tokenBankChallengeExploit = await TokenBankChallengeExploit.deploy();
    await tokenBankChallengeExploit.deployed();

    const TokenBankChallenge = await ethers.getContractFactory(
      "TokenBankChallenge"
    );
    const tokenBankChallenge = await TokenBankChallenge.deploy(
      tokenBankChallengeExploit.address
    );
    await tokenBankChallenge.deployed();

    await tokenBankChallengeExploit.setBank(tokenBankChallenge.address);

    return { tokenBankChallengeExploit, tokenBankChallenge };
  }

  describe("Exploit", function () {
    it("Exploit contract player can drain bank token balance", async function () {
      const { tokenBankChallengeExploit, tokenBankChallenge } =
        await loadFixture(deployToken);

      expect(await tokenBankChallenge.isComplete()).to.equal(false);
      await tokenBankChallengeExploit.exploit();
      expect(await tokenBankChallenge.isComplete()).to.equal(true);
    });
  });
});
