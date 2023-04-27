const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { utils } = require("ethers");
const { ethers } = require("hardhat");

describe("Exchange", function () {
  async function deployToken() {
    const [deployer, user1, user2, user3, user4] = await ethers.getSigners();

    const PermitToken = await ethers.getContractFactory("PermitToken");

    const tokenA = await PermitToken.deploy();
    await tokenA.deployed();

    const tokenB = await PermitToken.deploy();
    await tokenB.deployed();

    const Exchange = await ethers.getContractFactory("Exchange");

    const exchange = await Exchange.deploy(tokenA.address, tokenB.address);
    await exchange.deployed();

    return { deployer, user1, user2, user3, user4, tokenA, tokenB, exchange };
  }

  describe("Exchange", function () {
    it("Check token exchange", async function () {
      async function buildOrder(
        buyAddress,
        buyQuantity,
        sellAddress,
        sellQuantity,
        user
      ) {
        const signer = user;
        const token = sellAddress === tokenA.address ? tokenA : tokenB;
        const value = sellQuantity;
        const spender = exchange.address;
        const deadline = ethers.constants.MaxInt256;
        const { v, r, s } = await getPermitSignature(
          signer,
          token,
          spender,
          value,
          deadline
        );
        return {
          buyAddress,
          buyQuantity,
          sellAddress,
          sellQuantity,
          permitSig: {
            owner: signer.address,
            spender,
            value,
            deadline,
            v,
            r,
            s,
          },
        };
      }

      const { deployer, user1, user2, user3, user4, tokenA, tokenB, exchange } =
        await loadFixture(deployToken);

      await tokenA.connect(deployer).mint(user1.address, 650);
      await tokenA.connect(deployer).mint(user2.address, 1000);
      await tokenA.connect(deployer).mint(user3.address, 2000);
      await tokenA.connect(deployer).mint(user4.address, 0);

      await tokenB.connect(deployer).mint(user1.address, 0);
      await tokenB.connect(deployer).mint(user2.address, 100);
      await tokenB.connect(deployer).mint(user3.address, 200);
      await tokenB.connect(deployer).mint(user4.address, 5000);

      await exchange.executeOrders([
        await buildOrder(tokenB.address, 170, tokenA.address, 600, user1),
        await buildOrder(tokenA.address, 100, tokenB.address, 10, user2),
        await buildOrder(tokenA.address, 300, tokenB.address, 100, user3),
        await buildOrder(tokenA.address, 200, tokenB.address, 60, user4),
      ]);

      expect(await tokenA.balanceOf(user1.address)).to.equal(50);
      expect(await tokenA.balanceOf(user2.address)).to.equal(1100);
      expect(await tokenA.balanceOf(user3.address)).to.equal(2300);
      expect(await tokenA.balanceOf(user4.address)).to.equal(200);

      expect(await tokenB.balanceOf(user1.address)).to.equal(170);
      expect(await tokenB.balanceOf(user2.address)).to.equal(90);
      expect(await tokenB.balanceOf(user3.address)).to.equal(100);
      expect(await tokenB.balanceOf(user4.address)).to.equal(4940);
    });
  });
});

async function getPermitSignature(signer, token, spender, value, deadline) {
  const [nonce, name, version, chainId] = await Promise.all([
    token.nonces(signer.address),
    token.name(),
    "1",
    signer.getChainId(),
  ]);
  return utils.splitSignature(
    await signer._signTypedData(
      {
        name,
        version,
        chainId,
        verifyingContract: token.address,
      },
      {
        Permit: [
          {
            name: "owner",
            type: "address",
          },
          {
            name: "spender",
            type: "address",
          },
          {
            name: "value",
            type: "uint256",
          },
          {
            name: "nonce",
            type: "uint256",
          },
          {
            name: "deadline",
            type: "uint256",
          },
        ],
      },
      {
        owner: signer.address,
        spender,
        value,
        nonce,
        deadline,
      }
    )
  );
}
