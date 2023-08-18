const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("Clones", function () {
  async function deployContracts() {
    const [deployer] = await ethers.getSigners();

    const NormalFactory = await ethers.getContractFactory("NormalFactory");
    const normalFactory = await NormalFactory.deploy();
    await normalFactory.deployed();

    const CloneFactory = await ethers.getContractFactory("CloneFactory");
    const cloneFactory = await CloneFactory.deploy();
    await cloneFactory.deployed();

    return { normalFactory, cloneFactory, deployer };
  }

  describe("Normal vs Clone", function () {
    it("Compare createToken costs", async function () {
      const { normalFactory, cloneFactory, deployer } = await loadFixture(
        deployContracts
      );

      const name = "Test";
      const symbol = "TST";
      const supply = 100_000;
      const owner = deployer.address;

      await normalFactory.createToken(name, symbol, supply, owner);
      await cloneFactory.createToken(name, symbol, supply, owner);
    });
  });
});
