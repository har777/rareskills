const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("NFTStaker", function () {
  const PER_SECOND_TOKEN_REWARD = (10n * 10n ** 18n) / 86400n;

  async function deployStaking() {
    const [deployer, user1, user2] = await ethers.getSigners();

    const TOKEN = await ethers.getContractFactory("RewardToken");
    const token = await TOKEN.deploy();
    await token.deployed();

    const NFT = await ethers.getContractFactory("RewardNFT");
    const nft = await NFT.deploy();
    await nft.deployed();

    const STAKER = await ethers.getContractFactory("NFTStaker");
    const staker = await STAKER.deploy(token.address, nft.address);
    await staker.deployed();

    await token
      .connect(deployer)
      .grantRole(
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE")),
        staker.address
      );

    return { deployer, user1, user2, token, nft, staker };
  }

  describe("Staking", function () {
    it("getTotalClaimableTokens handles both claimable tokens and unclaimed tokens", async function () {
      const { user1, nft, staker } = await loadFixture(deployStaking);
      await nft.connect(user1).safeMint();
      await nft.connect(user1).safeMint();

      await nft
        .connect(user1)
        ["safeTransferFrom(address,address,uint256)"](
          user1.address,
          staker.address,
          0
        );
      await time.increase(86400);
      expect(await staker.connect(user1).getTotalClaimableTokens()).to.equal(
        10n * 10n ** 18n
      );

      await nft
        .connect(user1)
        ["safeTransferFrom(address,address,uint256)"](
          user1.address,
          staker.address,
          1
        );
      await time.increase(43200);
      expect(await staker.connect(user1).getTotalClaimableTokens()).to.equal(
        20n * 10n ** 18n + PER_SECOND_TOKEN_REWARD
      );
    });
  });

  it("safeTransfer to stakler contract automatically starts staking", async function () {
    const { user1, nft, staker } = await loadFixture(deployStaking);
    await nft.connect(user1).safeMint();

    await nft
      .connect(user1)
      ["safeTransferFrom(address,address,uint256)"](
        user1.address,
        staker.address,
        0
      );
    expect(await nft.ownerOf(0)).to.equal(staker.address);
    await time.increase(1);
    expect(await staker.connect(user1).getTotalClaimableTokens()).to.equal(
      PER_SECOND_TOKEN_REWARD
    );
  });

  it("claimTokens mints tokens", async function () {
    const { user1, user2, nft, token, staker } = await loadFixture(
      deployStaking
    );
    await nft.connect(user1).safeMint();
    await nft.connect(user1).safeMint();
    await nft.connect(user2).safeMint();

    await nft
      .connect(user1)
      ["safeTransferFrom(address,address,uint256)"](
        user1.address,
        staker.address,
        0
      );
    await nft
      .connect(user2)
      ["safeTransferFrom(address,address,uint256)"](
        user2.address,
        staker.address,
        2
      );
    await time.increase(86400 - 1);
    expect(await staker.connect(user1).getTotalClaimableTokens()).to.equal(
      10n * 10n ** 18n
    );

    await nft
      .connect(user1)
      ["safeTransferFrom(address,address,uint256)"](
        user1.address,
        staker.address,
        1
      );
    await time.increase(43200);
    expect(await staker.connect(user1).getTotalClaimableTokens()).to.equal(
      20n * 10n ** 18n + PER_SECOND_TOKEN_REWARD
    );

    await staker.connect(user1).claimTokens();
    expect(await nft.ownerOf(0)).to.equal(staker.address);
    expect(await nft.ownerOf(1)).to.equal(staker.address);
    expect(await nft.ownerOf(2)).to.equal(staker.address);
    expect(await token.balanceOf(user1.address)).to.equal(
      20n * 10n ** 18n + PER_SECOND_TOKEN_REWARD * 3n + 1n
    );
  });

  it("withdrawNFT works", async function () {
    const { user1, user2, nft, staker } = await loadFixture(deployStaking);
    await nft.connect(user1).safeMint();
    await nft.connect(user1).safeMint();
    await nft.connect(user2).safeMint();

    await nft
      .connect(user1)
      ["safeTransferFrom(address,address,uint256)"](
        user1.address,
        staker.address,
        0
      );
    await nft
      .connect(user2)
      ["safeTransferFrom(address,address,uint256)"](
        user2.address,
        staker.address,
        2
      );
    await time.increase(86400 - 1);
    expect(await staker.connect(user1).getTotalClaimableTokens()).to.equal(
      10n * 10n ** 18n
    );

    await nft
      .connect(user1)
      ["safeTransferFrom(address,address,uint256)"](
        user1.address,
        staker.address,
        1
      );
    await time.increase(43200);
    expect(await staker.connect(user1).getTotalClaimableTokens()).to.equal(
      20n * 10n ** 18n + PER_SECOND_TOKEN_REWARD
    );

    await staker.connect(user1).withdrawNFT(1);

    expect(await nft.ownerOf(0)).to.equal(staker.address);
    expect(await nft.ownerOf(1)).to.equal(user1.address);
    expect(await nft.ownerOf(2)).to.equal(staker.address);

    expect(await staker.connect(user1).getTotalClaimableTokens()).to.equal(
      20n * 10n ** 18n + PER_SECOND_TOKEN_REWARD * 3n + 1n
    );
  });
});
