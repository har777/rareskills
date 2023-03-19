const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("Diamond proxies", function () {
  async function deployContracts() {
    const [deployer] = await ethers.getSigners();

    const ERC20Facet = await ethers.getContractFactory("ERC20Facet");
    const erc20Facet = await ERC20Facet.deploy();
    await erc20Facet.deployed();

    const ERC721Facet = await ethers.getContractFactory("ERC721Facet");
    const erc721Facet = await ERC721Facet.deploy();
    await erc721Facet.deployed();

    const Diamond = await ethers.getContractFactory("Diamond");
    const diamond = await Diamond.deploy();
    await diamond.deployed();

    return { erc20Facet, erc721Facet, diamond, deployer };
  }

  describe("Diamond proxies work", function () {
    it("Check if diamond delegation works", async function () {
      const { erc20Facet, erc721Facet, diamond, deployer } = await loadFixture(
        deployContracts
      );

      const testDiamond = await ethers.getContractAt(
        "ITestDiamond",
        diamond.address,
        deployer
      );

      await expect(testDiamond.balanceOf(deployer.address)).to.be.reverted;

      await diamond.diamondCut(
        [
          {
            facetAddress: erc20Facet.address,
            action: 0,
            functionSelectors: ["0x70a08231", "0x40c10f19"],
          },
        ],
        diamond.address,
        []
      );

      expect(await testDiamond.balanceOf(deployer.address)).to.equal(0);
      await testDiamond.mint(deployer.address, 10);
      expect(await testDiamond.balanceOf(deployer.address)).to.equal(10);
      expect(await testDiamond.balanceOf(diamond.address)).to.equal(0);

      await diamond.diamondCut(
        [
          {
            facetAddress: erc721Facet.address,
            action: 0,
            functionSelectors: ["0xc87b56dd"],
          },
        ],
        diamond.address,
        []
      );

      expect(await testDiamond.tokenURI(0)).to.equal(
        "https://doesntmatter.com/{id}"
      );

      await diamond.diamondCut(
        [
          {
            facetAddress: erc721Facet.address,
            action: 1,
            functionSelectors: ["0x70a08231"],
          },
        ],
        diamond.address,
        []
      );
      expect(await testDiamond.balanceOf(deployer.address)).to.equal(0);

      await diamond.diamondCut(
        [
          {
            facetAddress: erc721Facet.address,
            action: 2,
            functionSelectors: ["0x70a08231"],
          },
        ],
        diamond.address,
        []
      );
      await expect(testDiamond.balanceOf(deployer.address)).to.be.reverted;
    });
  });
});
