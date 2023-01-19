const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("Ethernaut - Four", function () {
  async function deployToken() {
    const [deployer, exploiter] = await ethers.getSigners();

    const EthernautFourTelephone = await ethers.getContractFactory(
      "EthernautFourTelephone"
    );
    const ethernautFourTelephone = await EthernautFourTelephone.deploy();
    await ethernautFourTelephone.deployed();

    const EthernautFourTelephoneExploit = await ethers.getContractFactory(
      "EthernautFourTelephoneExploit"
    );
    const ethernautFourTelephoneExploit =
      await EthernautFourTelephoneExploit.deploy(
        ethernautFourTelephone.address
      );
    await ethernautFourTelephoneExploit.deployed();

    return {
      deployer,
      exploiter,
      ethernautFourTelephone,
      ethernautFourTelephoneExploit,
    };
  }

  describe("Exploit", function () {
    it("Successfully take over ownership", async function () {
      const {
        deployer,
        exploiter,
        ethernautFourTelephone,
        ethernautFourTelephoneExploit,
      } = await loadFixture(deployToken);

      expect(await ethernautFourTelephone.owner()).to.equal(deployer.address);
      await ethernautFourTelephoneExploit
        .connect(exploiter)
        .exploit(exploiter.address);
      expect(await ethernautFourTelephone.owner()).to.equal(exploiter.address);
    });
  });
});
