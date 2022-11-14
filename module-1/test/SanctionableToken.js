const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("SanctionableToken", function () {
  async function deploySanctionableToken() {
    const [deployer, user1, user2] = await ethers.getSigners();

    const SanctionableToken = await ethers.getContractFactory(
      "SanctionableToken"
    );
    const sanctionableToken = await SanctionableToken.deploy();

    return { deployer, user1, user2, sanctionableToken };
  }

  describe("Minting and transfers", function () {
    it("Minting works", async function () {
      const { deployer, user1, sanctionableToken } = await loadFixture(
        deploySanctionableToken
      );

      expect(await sanctionableToken.connect(deployer).mint(user1.address, 1))
        .to.be.ok;
      expect(await sanctionableToken.balanceOf(user1.address)).to.equal(1);
    });

    it("Transfers works", async function () {
      const { deployer, user1, sanctionableToken } = await loadFixture(
        deploySanctionableToken
      );

      await sanctionableToken.connect(deployer).mint(user1.address, 1);
      expect(await sanctionableToken.balanceOf(deployer.address)).to.equal(0);
      expect(await sanctionableToken.balanceOf(user1.address)).to.equal(1);
      expect(
        await sanctionableToken.connect(user1).transfer(deployer.address, 1)
      ).to.be.ok;
      expect(await sanctionableToken.balanceOf(deployer.address)).to.equal(1);
      expect(await sanctionableToken.balanceOf(user1.address)).to.equal(0);
    });
  });

  describe("Sanctions", function () {
    it("Sanction a user", async function () {
      const { deployer, user1, sanctionableToken } = await loadFixture(
        deploySanctionableToken
      );

      expect(await sanctionableToken.isSanctioned(user1.address)).to.equal(
        false
      );
      await sanctionableToken.connect(deployer).sanction(user1.address);
      expect(await sanctionableToken.isSanctioned(user1.address)).to.equal(
        true
      );
    });

    it("UnSanction a user", async function () {
      const { deployer, user1, sanctionableToken } = await loadFixture(
        deploySanctionableToken
      );

      expect(await sanctionableToken.isSanctioned(user1.address)).to.equal(
        false
      );
      await sanctionableToken.connect(deployer).sanction(user1.address);
      expect(await sanctionableToken.isSanctioned(user1.address)).to.equal(
        true
      );
      await sanctionableToken.connect(deployer).unSanction(user1.address);
      expect(await sanctionableToken.isSanctioned(user1.address)).to.equal(
        false
      );
    });

    it("Sanctioned user cannot send tokens", async function () {
      const { deployer, user1, user2, sanctionableToken } = await loadFixture(
        deploySanctionableToken
      );

      await sanctionableToken.connect(deployer).sanction(user1.address);

      await expect(sanctionableToken.connect(user1).transfer(user2.address, 1))
        .to.be.revertedWithCustomError(sanctionableToken, "AccountIsSanctioned")
        .withArgs(user1.address);
    });

    it("Sanctioned user cannot receive tokens", async function () {
      const { deployer, user1, user2, sanctionableToken } = await loadFixture(
        deploySanctionableToken
      );

      await sanctionableToken.connect(deployer).sanction(user1.address);

      await expect(sanctionableToken.connect(user2).transfer(user1.address, 1))
        .to.be.revertedWithCustomError(sanctionableToken, "AccountIsSanctioned")
        .withArgs(user1.address);
    });

    it("Sanctioning emits an Event", async function () {
      const { deployer, user1, sanctionableToken } = await loadFixture(
        deploySanctionableToken
      );

      await expect(sanctionableToken.connect(deployer).sanction(user1.address))
        .to.emit(sanctionableToken, "Sanctioned")
        .withArgs(user1.address);
    });

    it("UnSanctioning emits an Event", async function () {
      const { deployer, user1, sanctionableToken } = await loadFixture(
        deploySanctionableToken
      );

      await expect(
        sanctionableToken.connect(deployer).unSanction(user1.address)
      )
        .to.emit(sanctionableToken, "UnSanctioned")
        .withArgs(user1.address);
    });
  });

  describe("reverts", function () {
    it("mint called by non-admin", async function () {
      const { user1, sanctionableToken } = await loadFixture(
        deploySanctionableToken
      );
      const revertReason = `AccessControl: account ${user1.address.toLowerCase()} is missing role 0x0000000000000000000000000000000000000000000000000000000000000000`;
      await expect(
        sanctionableToken.connect(user1).mint(user1.address, 1)
      ).to.be.revertedWith(revertReason);
    });

    it("sanction called by non-admin", async function () {
      const { user1, sanctionableToken } = await loadFixture(
        deploySanctionableToken
      );
      const revertReason = `AccessControl: account ${user1.address.toLowerCase()} is missing role 0x0000000000000000000000000000000000000000000000000000000000000000`;
      await expect(
        sanctionableToken.connect(user1).sanction(user1.address)
      ).to.be.revertedWith(revertReason);
    });

    it("unSanction called by non-admin", async function () {
      const { user1, sanctionableToken } = await loadFixture(
        deploySanctionableToken
      );
      const revertReason = `AccessControl: account ${user1.address.toLowerCase()} is missing role 0x0000000000000000000000000000000000000000000000000000000000000000`;
      await expect(
        sanctionableToken.connect(user1).unSanction(user1.address)
      ).to.be.revertedWith(revertReason);
    });

    it("transfer from a sanctioned user", async function () {
      const { deployer, user1, sanctionableToken } = await loadFixture(
        deploySanctionableToken
      );

      await sanctionableToken.connect(deployer).sanction(user1.address);
      await expect(
        sanctionableToken.connect(user1).transfer(deployer.address, 1)
      )
        .to.be.revertedWithCustomError(sanctionableToken, "AccountIsSanctioned")
        .withArgs(user1.address);
    });

    it("transfer to a sanctioned user", async function () {
      const { deployer, user1, sanctionableToken } = await loadFixture(
        deploySanctionableToken
      );

      await sanctionableToken.connect(deployer).sanction(user1.address);
      await expect(
        sanctionableToken.connect(deployer).transfer(user1.address, 1)
      )
        .to.be.revertedWithCustomError(sanctionableToken, "AccountIsSanctioned")
        .withArgs(user1.address);
    });
  });
});
