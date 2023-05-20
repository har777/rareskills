const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("Week22Exercise1", function () {
  async function deployToken() {
    const [deployer] = await ethers.getSigners();

    const Week22Exercise4 = await ethers.getContractFactory("Week22Exercise4");
    const week22Exercise4 = await Week22Exercise4.deploy();
    await week22Exercise4.deployed();

    return { deployer, week22Exercise4 };
  }

  describe("Exploit", function () {
    it("Exploit worked", async function () {
      const { week22Exercise4 } = await loadFixture(deployToken);

      expect(await week22Exercise4.hacked()).to.equal(false);

      expect(await week22Exercise4.hacked()).to.equal(true);
    });
  });
});
