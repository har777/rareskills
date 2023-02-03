const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("Ethernaut - Eighteen", function () {
  async function deploySolver() {
    const [deployer] = await ethers.getSigners();

    const deployTransaction = await deployer.sendTransaction({
      data: "0x69602a60005260206000f3600052600a6016f3",
    });
    const deployReceipt = await deployTransaction.wait();

    const { contractAddress } = deployReceipt;

    return {
      deployer,
      contractAddress,
    };
  }

  describe("Bytecode!", function () {
    it("Magic number solver works", async function () {
      const { deployer, contractAddress } = await loadFixture(deploySolver);

      const magicNumber = await deployer.call({ to: contractAddress });
      expect(BigInt(magicNumber)).to.equal(42);
    });
  });
});
