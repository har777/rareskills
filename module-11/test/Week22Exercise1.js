const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("Week22Exercise1", function () {
  async function deployToken() {
    const [deployer] = await ethers.getSigners();

    const Week22Exercise1 = await ethers.getContractFactory("DoubleTake");
    const week22Exercise1 = await Week22Exercise1.deploy();
    await week22Exercise1.deployed();

    return { deployer, week22Exercise1 };
  }

  describe("Exploit", function () {
    it("Exploit worked", async function () {
      const { week22Exercise1 } = await loadFixture(deployToken);

      expect(await week22Exercise1.something()).to.equal(false);

      expect(await week22Exercise1.something()).to.equal(true);
    });
  });
});
