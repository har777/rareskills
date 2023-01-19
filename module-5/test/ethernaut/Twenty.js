const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("Ethernaut - Twenty", function () {
  async function deployContracts() {
    const [deployer] = await ethers.getSigners();

    const EthernautTwentyDenial = await ethers.getContractFactory(
      "EthernautTwentyDenial"
    );
    const ethernautTwentyDenial = await EthernautTwentyDenial.deploy();
    await ethernautTwentyDenial.deployed();

    const EthernautTwentyBadPartner = await ethers.getContractFactory(
      "EthernautTwentyBadPartner"
    );
    const ethernautTwentyBadPartner = await EthernautTwentyBadPartner.deploy();
    await ethernautTwentyBadPartner.deployed();

    await deployer.sendTransaction({
      to: ethernautTwentyDenial.address,
      value: ethers.utils.parseEther("1.0"),
    });

    return { deployer, ethernautTwentyDenial, ethernautTwentyBadPartner };
  }

  describe("Exploit", function () {
    it("Partner can stop owner from being able to call withdraw", async function () {
      const { deployer, ethernautTwentyDenial, ethernautTwentyBadPartner } =
        await loadFixture(deployContracts);

      // set deployer which is a normal address as initial partner
      await ethernautTwentyDenial.setWithdrawPartner(deployer.address);
      expect(await ethernautTwentyDenial.withdraw({ gasLimit: 1_000_000 })).to
        .be.ok;

      await ethernautTwentyDenial.setWithdrawPartner(
        ethernautTwentyBadPartner.address
      );
      await expect(
        ethernautTwentyDenial.withdraw({ gasLimit: 1_000_000 })
      ).to.be.rejectedWith("Transaction ran out of gas");
    });
  });
});
