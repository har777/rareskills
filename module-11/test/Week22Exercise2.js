const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("Week22Exercise1", function () {
  async function deployToken() {
    const [deployer] = await ethers.getSigners();

    const Week22Exercise2 = await ethers.getContractFactory("Week22Exercise2");
    const week22Exercise2 = await Week22Exercise2.deploy();
    await week22Exercise2.deployed();

    return { deployer, week22Exercise2 };
  }

  describe("Exploit", function () {
    it("Exploit worked", async function () {
      const { week22Exercise2 } = await loadFixture(deployToken);

      // The expected verifyingAddress has already called the challenge method on Optimism.
      // We can just reuse those parameters here.
      // See: https://optimistic.etherscan.io/tx/0x08e18539b6a2b45c74aa3eb4bc769a173baf87b3373437123c9498d72f02c2e2
      const message = "attack at dawn";
      const signature =
        "0xe5d0b13209c030a26b72ddb84866ae7b32f806d64f28136cb5516ab6ca15d3c438d9e7c79efa063198fda1a5b48e878a954d79372ed71922003f847029bf2e751b";

      expect(await week22Exercise2.used(signature)).to.equal(false);
      await week22Exercise2.challenge(message, signature);
      expect(await week22Exercise2.used(signature)).to.equal(true);
    });
  });
});
