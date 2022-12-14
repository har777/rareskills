const {
  loadFixture,
  time,
} = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("Forge", function () {
  const ONE_MIN = 60;

  async function deployForge() {
    const [deployer, user1, user2] = await ethers.getSigners();

    const ForgeableNFT = await ethers.getContractFactory("ForgeableNFT");
    const forgeableNFT = await ForgeableNFT.deploy();
    await forgeableNFT.deployed();

    const Forge = await ethers.getContractFactory("Forge");
    const forge = await Forge.deploy(forgeableNFT.address);
    await forge.deployed();

    await forgeableNFT
      .connect(deployer)
      .grantRole(
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE")),
        forge.address
      );

    await forgeableNFT.connect(user1).setApprovalForAll(forge.address, true);
    await forgeableNFT.connect(user2).setApprovalForAll(forge.address, true);

    return { deployer, user1, user2, forgeableNFT, forge };
  }

  describe("Minting", function () {
    it("Forge allows mint of token 0, 1, 2", async function () {
      const { user1, forge, forgeableNFT } = await loadFixture(deployForge);

      for (let id = 0; id < 3; id++) {
        expect(await forgeableNFT.balanceOf(user1.address, id)).to.equal(0);
        await forge.connect(user1).mint(id);
        expect(await forgeableNFT.balanceOf(user1.address, id)).to.equal(1);
        await time.increase(ONE_MIN);
      }
    });

    it("isMintInCooldown", async function () {
      const { user1, forge } = await loadFixture(deployForge);

      await forge.connect(user1).mint(0);
      expect(await forge.connect(user1).isMintInCooldown()).to.equal(true);
      await time.increase(ONE_MIN - 1);
      expect(await forge.connect(user1).isMintInCooldown()).to.equal(true);
      await time.increase(1);
      expect(await forge.connect(user1).isMintInCooldown()).to.equal(true);
      await time.increase(1);
      expect(await forge.connect(user1).isMintInCooldown()).to.equal(false);
      await time.increase(1);
      expect(await forge.connect(user1).isMintInCooldown()).to.equal(false);
    });
  });

  describe("Burning", function () {
    it("Forge allows burn of tokens 3, 4, 5, 6", async function () {
      const { user1, forgeableNFT, forge } = await loadFixture(deployForge);

      // Mint 3 quantities if tokens 0, 1, 2
      for (let id = 0; id < 3; id++) {
        for (let iter = 0; iter < 3; iter++) {
          await forge.connect(user1).mint(id);
          await time.increase(ONE_MIN);
        }
      }

      // Forge 1 quantity of tokens 3, 4, 5, 6
      for (let id = 3; id < 7; id++) {
        await forge.connect(user1).forge(id);
      }

      // Check balances
      for (let id = 0; id < 7; id++) {
        const expectedBalance = id < 3 ? 0 : 1;
        expect(await forgeableNFT.balanceOf(user1.address, id)).to.equal(
          expectedBalance
        );
      }

      // Destroy 1 quantity of tokens 3, 4, 5, 6
      for (let id = 3; id < 7; id++) {
        await forge.connect(user1).burn(id);
      }

      // Check balances
      for (let id = 0; id < 7; id++) {
        expect(await forgeableNFT.balanceOf(user1.address, id)).to.equal(0);
      }
    });
  });

  describe("Trading", function () {
    it("Forge allows trading of any token 0, 1, 2, 3, 4, 5, 6 for token 0, 1, 2", async function () {
      const { user1, forgeableNFT, forge } = await loadFixture(deployForge);

      // Mint 4 quantities if tokens 0, 1, 2
      for (let id = 0; id < 3; id++) {
        for (let iter = 0; iter < 4; iter++) {
          await forge.connect(user1).mint(id);
          await time.increase(ONE_MIN);
        }
      }

      // Forge 1 quantity of tokens 3, 4, 5, 6
      for (let id = 3; id < 7; id++) {
        await forge.connect(user1).forge(id);
      }

      // Check balances
      for (let id = 0; id < 7; id++) {
        expect(await forgeableNFT.balanceOf(user1.address, id)).to.equal(1);
      }

      await forge.connect(user1).trade(0, 1);
      await forge.connect(user1).trade(1, 2);
      await forge.connect(user1).trade(2, 0);
      await forge.connect(user1).trade(3, 1);
      await forge.connect(user1).trade(4, 2);
      await forge.connect(user1).trade(5, 0);
      await forge.connect(user1).trade(6, 1);

      expect(await forgeableNFT.balanceOf(user1.address, 0)).to.equal(2);
      expect(await forgeableNFT.balanceOf(user1.address, 1)).to.equal(3);
      expect(await forgeableNFT.balanceOf(user1.address, 2)).to.equal(2);
      expect(await forgeableNFT.balanceOf(user1.address, 3)).to.equal(0);
      expect(await forgeableNFT.balanceOf(user1.address, 4)).to.equal(0);
      expect(await forgeableNFT.balanceOf(user1.address, 5)).to.equal(0);
      expect(await forgeableNFT.balanceOf(user1.address, 6)).to.equal(0);
    });
  });

  describe("Forging", function () {
    it("Forge allows forging of tokens 3, 4, 5, 6", async function () {
      const { user1, forgeableNFT, forge } = await loadFixture(deployForge);

      // Mint 3 quantities if tokens 0, 1, 2
      for (let id = 0; id < 3; id++) {
        for (let iter = 0; iter < 3; iter++) {
          await forge.connect(user1).mint(id);
          await time.increase(ONE_MIN);
        }
      }

      // Forge 1 quantity of tokens 3, 4, 5, 6
      for (let id = 3; id < 7; id++) {
        await forge.connect(user1).forge(id);
      }

      // Check balances
      for (let id = 0; id < 7; id++) {
        const expectedBalance = id < 3 ? 0 : 1;
        expect(await forgeableNFT.balanceOf(user1.address, id)).to.equal(
          expectedBalance
        );
      }
    });
  });

  describe("reverts", function () {
    it("Forge disallows mint of token 3, 4, 5, 6", async function () {
      const { user1, forge, forgeableNFT } = await loadFixture(deployForge);

      for (let id = 3; id < 7; id++) {
        expect(await forgeableNFT.balanceOf(user1.address, id)).to.equal(0);
        await expect(
          forge.connect(user1).mint(id)
        ).to.be.revertedWithCustomError(forge, "InvalidId");
        expect(await forgeableNFT.balanceOf(user1.address, id)).to.equal(0);
        await time.increase(ONE_MIN);
      }
    });

    it("Forge disallows consecutive mints within 60 seconds", async function () {
      const { user1, forge } = await loadFixture(deployForge);
      await forge.connect(user1).mint(0);
      await expect(forge.connect(user1).mint(0)).to.be.revertedWithCustomError(
        forge,
        "InCooldown"
      );
    });

    it("Forge disallows burn of token 0, 1, 2", async function () {
      const { user1, forge } = await loadFixture(deployForge);

      for (let id = 0; id < 3; id++) {
        await expect(
          forge.connect(user1).burn(id)
        ).to.be.revertedWithCustomError(forge, "InvalidId");
      }
      await expect(forge.connect(user1).burn(7)).to.be.revertedWithCustomError(
        forge,
        "InvalidId"
      );
    });

    it("Forge disallows trade to get a new token of 3, 4, 5, 6", async function () {
      const { user1, forge } = await loadFixture(deployForge);

      for (let id = 3; id < 7; id++) {
        await expect(
          forge.connect(user1).trade(0, id)
        ).to.be.revertedWithCustomError(forge, "InvalidId");
      }
    });

    it("Forge disallows forge of token 0, 1, 2", async function () {
      const { user1, forge } = await loadFixture(deployForge);

      for (let id = 0; id < 3; id++) {
        await expect(
          forge.connect(user1).forge(id)
        ).to.be.revertedWithCustomError(forge, "InvalidId");
      }
      await expect(forge.connect(user1).forge(7)).to.be.revertedWithCustomError(
        forge,
        "InvalidId"
      );
    });
  });
});
