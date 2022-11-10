import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("SimpleNFT", function () {
  async function deploySimpleNFT() {
    const [deployer, user1, user2] = await ethers.getSigners();

    const SimpleNFT = await ethers.getContractFactory("SimpleNFT");
    const simpleNFT = await SimpleNFT.deploy();
    await simpleNFT.deployed();

    return { deployer, user1, user2, simpleNFT };
  }

  describe("Simple NFT", function () {
    it("Anyone can mint an NFT for free", async function () {
      const { user1, user2, simpleNFT } = await loadFixture(deploySimpleNFT);

      await simpleNFT.connect(user1).mint();
      expect(await simpleNFT.balanceOf(user1.address)).to.equal(1);
      expect(await simpleNFT.ownerOf(0)).to.equal(user1.address);

      await simpleNFT.connect(user2).mint();
      expect(await simpleNFT.balanceOf(user2.address)).to.equal(1);
      expect(await simpleNFT.ownerOf(1)).to.equal(user2.address);
    });

    it("Generated URL is correct", async function () {
      const { user1, user2, simpleNFT } = await loadFixture(deploySimpleNFT);

      await simpleNFT.connect(user1).mint();
      await simpleNFT.connect(user2).mint();

      expect(await simpleNFT.tokenURI(0)).to.equal(
        "ipfs://QmTbZEZiGQhYZQuxo7RCvKz4nVN94nKh1AE6EKS9aahKjQ/0"
      );
      expect(await simpleNFT.tokenURI(1)).to.equal(
        "ipfs://QmTbZEZiGQhYZQuxo7RCvKz4nVN94nKh1AE6EKS9aahKjQ/1"
      );
    });

    it("Max supply is 10", async function () {
      const { user1, simpleNFT } = await loadFixture(deploySimpleNFT);

      for (let i = 0; i < 10; i++) {
        await simpleNFT.connect(user1).mint();
      }

      await expect(simpleNFT.connect(user1).mint()).to.be.revertedWith(
        "All NFTs already minted"
      );
    });
  });
});
