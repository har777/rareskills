const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("Week22Exercise1", function () {
  async function deployToken() {
    const [deployer] = await ethers.getSigners();

    const Week22Exercise3 = await ethers.getContractFactory("Week22Exercise3");
    const week22Exercise3 = await Week22Exercise3.deploy();
    await week22Exercise3.deployed();

    return { deployer, week22Exercise3 };
  }

  describe("Exploit", function () {
    it("Exploit worked", async function () {
      const { week22Exercise3 } = await loadFixture(deployToken);

      expect(await week22Exercise3.something()).to.equal(false);

      expect(await week22Exercise3.something()).to.equal(true);
    });
  });
});
