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

      expect(await week22Exercise2.something()).to.equal(false);

      expect(await week22Exercise2.something()).to.equal(true);
    });
  });
});
