const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("Ethernaut - Eleven", function () {
  async function deployContracts() {
    const EthernautElevenElevator = await ethers.getContractFactory(
      "EthernautElevenElevator"
    );
    const ethernautElevenElevator = await EthernautElevenElevator.deploy();
    await ethernautElevenElevator.deployed();

    const EthernautElevenBuilding = await ethers.getContractFactory(
      "EthernautElevenBuilding"
    );
    const ethernautElevenBuilding = await EthernautElevenBuilding.deploy(
      ethernautElevenElevator.address
    );
    await ethernautElevenBuilding.deployed();

    return { ethernautElevenElevator, ethernautElevenBuilding };
  }

  describe("Exploit", function () {
    it("Elevator takes you to top floor", async function () {
      const { ethernautElevenElevator, ethernautElevenBuilding } =
        await loadFixture(deployContracts);

      expect(await ethernautElevenElevator.top()).to.equal(false);
      expect(await ethernautElevenElevator.floor()).to.equal(0);

      await ethernautElevenBuilding.goTo(101);

      expect(await ethernautElevenElevator.top()).to.equal(true);
      expect(await ethernautElevenElevator.floor()).to.equal(101);
    });
  });
});
