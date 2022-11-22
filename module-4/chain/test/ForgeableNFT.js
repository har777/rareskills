const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("ForgeableNFT", function () {
  async function deployForgeableNFT() {
    const [deployer, user1, user2] = await ethers.getSigners();

    const ForgeableNFT = await ethers.getContractFactory("ForgeableNFT");
    const forgeableNFT = await ForgeableNFT.deploy();
    await forgeableNFT.deployed();

    await forgeableNFT
      .connect(deployer)
      .grantRole(
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE")),
        deployer.address
      );

    return { deployer, user1, user2, forgeableNFT };
  }

  describe("Forgeable NFT", function () {
    it("Minter can mint", async function () {
      const { deployer, user1, forgeableNFT } = await loadFixture(
        deployForgeableNFT
      );

      expect(
        await forgeableNFT.connect(deployer).mint(user1.address, 1, 2, "0x")
      ).to.be.ok;
      expect(await forgeableNFT.balanceOf(user1.address, 1)).to.equal(2);
    });

    it("Minter can burn", async function () {
      const { deployer, user1, forgeableNFT } = await loadFixture(
        deployForgeableNFT
      );

      await forgeableNFT.connect(deployer).mint(user1.address, 1, 2, "0x");
      expect(await forgeableNFT.balanceOf(user1.address, 1)).to.equal(2);

      expect(await forgeableNFT.connect(deployer).burn(user1.address, 1, 1)).to
        .be.ok;
      expect(await forgeableNFT.balanceOf(user1.address, 1)).to.equal(1);
    });

    it("Minter can burnBatch", async function () {
      const { deployer, user1, forgeableNFT } = await loadFixture(
        deployForgeableNFT
      );

      await forgeableNFT.connect(deployer).mint(user1.address, 1, 2, "0x");
      expect(await forgeableNFT.balanceOf(user1.address, 1)).to.equal(2);

      await forgeableNFT.connect(deployer).mint(user1.address, 6, 4, "0x");
      expect(await forgeableNFT.balanceOf(user1.address, 6)).to.equal(4);

      expect(
        await forgeableNFT
          .connect(deployer)
          .burnBatch(user1.address, [1, 6], [1, 2])
      ).to.be.ok;
      expect(await forgeableNFT.balanceOf(user1.address, 1)).to.equal(1);
      expect(await forgeableNFT.balanceOf(user1.address, 6)).to.equal(2);
    });

    it("Admin can setURI", async function () {
      const { deployer, forgeableNFT } = await loadFixture(deployForgeableNFT);

      const uri = "https://testUri/{id}.json";
      expect(await forgeableNFT.connect(deployer).setURI(uri)).to.be.ok;
      expect(await forgeableNFT.uri(0)).to.equal(uri);
    });

    it("supportsInterface", async function () {
      const { forgeableNFT } = await loadFixture(deployForgeableNFT);
      expect(await forgeableNFT.supportsInterface("0xd9b67a26")).to.equal(true);
    });
  });

  describe("reverts", function () {
    it("non minter tries to mint", async function () {
      const { user1, forgeableNFT } = await loadFixture(deployForgeableNFT);

      const revertReason = `AccessControl: account ${user1.address.toLowerCase()} is missing role ${ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes("MINTER_ROLE")
      )}`;
      await expect(
        forgeableNFT.connect(user1).mint(user1.address, 1, 2, "0x")
      ).to.be.revertedWith(revertReason);
      expect(await forgeableNFT.balanceOf(user1.address, 1)).to.equal(0);
    });

    it("non minter tries to burn", async function () {
      const { user1, forgeableNFT } = await loadFixture(deployForgeableNFT);

      const revertReason = `AccessControl: account ${user1.address.toLowerCase()} is missing role ${ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes("MINTER_ROLE")
      )}`;
      await expect(
        forgeableNFT.connect(user1).burn(user1.address, 1, 1)
      ).to.be.revertedWith(revertReason);
    });

    it("non minter tries to burnBatch", async function () {
      const { user1, forgeableNFT } = await loadFixture(deployForgeableNFT);

      const revertReason = `AccessControl: account ${user1.address.toLowerCase()} is missing role ${ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes("MINTER_ROLE")
      )}`;
      await expect(
        forgeableNFT.connect(user1).burnBatch(user1.address, [1], [1])
      ).to.be.revertedWith(revertReason);
    });

    it("non admin tries to setUri", async function () {
      const { user1, forgeableNFT } = await loadFixture(deployForgeableNFT);

      const revertReason = `AccessControl: account ${user1.address.toLowerCase()} is missing role 0x0000000000000000000000000000000000000000000000000000000000000000`;
      await expect(
        forgeableNFT.connect(user1).setURI("https://testUri/{id}.json")
      ).to.be.revertedWith(revertReason);
    });
  });
});
