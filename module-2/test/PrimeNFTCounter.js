const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("PrimeNFTCounter", function () {
  async function deployCounter() {
    const [deployer, user1, user2] = await ethers.getSigners();

    const EnumerableNFT = await ethers.getContractFactory("EnumerableNFT");
    const enumerableNFT = await EnumerableNFT.deploy();
    await enumerableNFT.deployed();

    const PrimeNFTCounter = await ethers.getContractFactory("PrimeNFTCounter");
    const primeNFTCounter = await PrimeNFTCounter.deploy(enumerableNFT.address);
    await primeNFTCounter.deployed();

    return { deployer, user1, user2, enumerableNFT, primeNFTCounter };
  }

  describe("Prime NFT Counter", function () {
    it("Max supply is 20", async function () {
      const { user1, user2, enumerableNFT } = await loadFixture(deployCounter);

      for (let i = 0; i < 10; i++) {
        await enumerableNFT.connect(user1).safeMint();
      }

      for (let i = 0; i < 10; i++) {
        await enumerableNFT.connect(user2).safeMint();
      }

      await expect(enumerableNFT.connect(user1).safeMint()).to.be.revertedWith(
        "All NFTs already minted"
      );
    });

    it("Prime counter works", async function () {
      const { deployer, user1, user2, enumerableNFT, primeNFTCounter } =
        await loadFixture(deployCounter);

      for (let i = 0; i < 10; i++) {
        await enumerableNFT.connect(user1).safeMint();
      }

      for (let i = 0; i < 10; i++) {
        await enumerableNFT.connect(user2).safeMint();
      }

      expect(await primeNFTCounter.getPrimeNFTCount(deployer.address)).to.equal(
        0
      );
      expect(await primeNFTCounter.getPrimeNFTCount(user1.address)).to.equal(4);
      expect(await primeNFTCounter.getPrimeNFTCount(user2.address)).to.equal(4);
    });

    it("EnumerableNFT supportsInterface", async function () {
      const { enumerableNFT } = await loadFixture(deployCounter);
      expect(await enumerableNFT.supportsInterface("0x80ac58cd")).to.equal(
        true
      );
    });
  });
});
