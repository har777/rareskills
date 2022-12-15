const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("Ethernaut - Twenty", function () {
  async function deployContracts() {
    const [exploiter, user1, user2] = await ethers.getSigners();

    const EthernautTwentyReentrance = await ethers.getContractFactory(
      "EthernautTwentyReentrance"
    );
    const ethernautTwentyReentrance = await EthernautTwentyReentrance.deploy();
    await ethernautTwentyReentrance.deployed();

    const EthernautTwentyExploit = await ethers.getContractFactory(
      "EthernautTwentyExploit"
    );
    const ethernautTwentyExploit = await EthernautTwentyExploit.deploy(
      ethernautTwentyReentrance.address
    );
    await ethernautTwentyExploit.deployed();

    return {
      exploiter,
      user1,
      user2,
      ethernautTwentyReentrance,
      ethernautTwentyExploit,
    };
  }

  describe("Exploit", function () {
    it("Exploiter can drain everyone's funds", async function () {
      const {
        exploiter,
        user1,
        user2,
        ethernautTwentyReentrance,
        ethernautTwentyExploit,
      } = await loadFixture(deployContracts);

      // user1 and user2 donate 1 ETH and 2 ETH each
      await ethernautTwentyReentrance
        .connect(user1)
        .donate(user1.address, { value: ethers.constants.WeiPerEther });
      await ethernautTwentyReentrance
        .connect(user2)
        .donate(user2.address, {
          value: 2n * BigInt(ethers.constants.WeiPerEther),
        });

      // exploiter donates 1 ETH under ethernautTwentyExploit contracts name
      await ethernautTwentyReentrance
        .connect(exploiter)
        .donate(ethernautTwentyExploit.address, {
          value: ethers.constants.WeiPerEther,
        });

      expect(await ethernautTwentyReentrance.balanceOf(user1.address)).to.equal(
        ethers.constants.WeiPerEther
      );
      expect(await ethernautTwentyReentrance.balanceOf(user2.address)).to.equal(
        2n * BigInt(ethers.constants.WeiPerEther)
      );
      expect(
        await ethernautTwentyReentrance.balanceOf(exploiter.address)
      ).to.equal(0);
      expect(
        await ethernautTwentyReentrance.balanceOf(
          ethernautTwentyExploit.address
        )
      ).to.equal(ethers.constants.WeiPerEther);

      expect(
        await exploiter.provider.getBalance(ethernautTwentyReentrance.address)
      ).to.equal(4n * BigInt(ethers.constants.WeiPerEther));
      expect(
        await exploiter.provider.getBalance(ethernautTwentyExploit.address)
      ).to.equal(0);

      await ethernautTwentyExploit.exploit();

      // Check if all the 4 ETH in the contract now belongs to the exploiter
      expect(
        await exploiter.provider.getBalance(ethernautTwentyReentrance.address)
      ).to.equal(0);
      expect(
        await exploiter.provider.getBalance(ethernautTwentyExploit.address)
      ).to.equal(4n * BigInt(ethers.constants.WeiPerEther));
    });
  });
});
