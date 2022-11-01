import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("BondingCurveToken", function () {
  async function deployBondingCurveToken() {
    const [deployer, user1, user2] = await ethers.getSigners();

    const BondingCurveToken = await ethers.getContractFactory(
      "BondingCurveToken"
    );
    const bondingCurveToken = await BondingCurveToken.deploy(10);

    return { deployer, user1, user2, bondingCurveToken };
  }

  describe("getMarketCapForSupply", function () {
    it("first token costs 10", async function () {
      const { bondingCurveToken } = await loadFixture(deployBondingCurveToken);
      expect(await bondingCurveToken.getMarketCapForSupply(1)).to.equal(10);
    });

    it("first 5 tokens cost 60", async function () {
      const { bondingCurveToken } = await loadFixture(deployBondingCurveToken);
      expect(await bondingCurveToken.getMarketCapForSupply(5)).to.equal(60);
    });

    it("tokens 7 to 10 cost 70", async function () {
      const { bondingCurveToken } = await loadFixture(deployBondingCurveToken);
      const marketCapForFirstTenTokens: any =
        await bondingCurveToken.getMarketCapForSupply(10);
      const marketCapForFirstSixTokens: any =
        await bondingCurveToken.getMarketCapForSupply(6);
      expect(marketCapForFirstTenTokens - marketCapForFirstSixTokens).to.equal(
        70
      );
    });
  });

  describe("getNumOfTokensToMint", function () {
    it("10 wei buys 1 token at 0 supply", async function () {
      const { bondingCurveToken } = await loadFixture(deployBondingCurveToken);
      const [quantity, _] = await bondingCurveToken.getNumOfTokensToMint(10, 0);
      expect(quantity).to.equal(1);
    });

    it("70 wei buys 5 tokens at 0 supply", async function () {
      const { bondingCurveToken } = await loadFixture(deployBondingCurveToken);
      const [quantity, _] = await bondingCurveToken.getNumOfTokensToMint(70, 0);
      expect(quantity).to.equal(5);
    });

    it("50 wei buys 3 tokens at 5 supply", async function () {
      const { bondingCurveToken } = await loadFixture(deployBondingCurveToken);
      const [quantity, _] = await bondingCurveToken.getNumOfTokensToMint(50, 5);
      expect(quantity).to.equal(3);
    });

    it("65 wei buys 3 tokens at 5 supply", async function () {
      const { bondingCurveToken } = await loadFixture(deployBondingCurveToken);
      const [quantity, _] = await bondingCurveToken.getNumOfTokensToMint(65, 5);
      expect(quantity).to.equal(3);
    });

    it("66 wei buys 4 tokens at 5 supply", async function () {
      const { bondingCurveToken } = await loadFixture(deployBondingCurveToken);
      const [quantity, _] = await bondingCurveToken.getNumOfTokensToMint(66, 5);
      expect(quantity).to.equal(4);
    });
  });

  describe("buy", function () {
    it("buying allocates tokens and refunds extra amount", async function () {
      const { user1, user2, bondingCurveToken } = await loadFixture(
        deployBondingCurveToken
      );

      // first 5 tokens will cost 60 wei exactly
      // no refund is necessary
      const user1BeforeTx1Balance = await bondingCurveToken.provider.getBalance(
        user1.address
      );
      const buyTx1 = await bondingCurveToken.connect(user1).buy({ value: 60 });
      const buyTx1Receipt = await buyTx1.wait();
      const weiSpentByBuyTx1 = buyTx1Receipt.gasUsed.mul(
        buyTx1Receipt.effectiveGasPrice
      );
      const user1AfterTx1Balance = await bondingCurveToken.provider.getBalance(
        user1.address
      );
      expect(user1AfterTx1Balance).to.equal(
        user1BeforeTx1Balance.sub(weiSpentByBuyTx1.add(60))
      );
      expect(await bondingCurveToken.balanceOf(user1.address)).to.equal(5);

      // the next 5 tokens will cost 85 wei exactly
      // the user will attempt to buy with 90 wei and expect a 5 wei refund
      const user2BeforeTx2Balance = await bondingCurveToken.provider.getBalance(
        user2.address
      );
      const buyTx2 = await bondingCurveToken.connect(user2).buy({ value: 90 });
      const buyTx2Receipt = await buyTx2.wait();
      const weiSpentByBuyTx2 = buyTx2Receipt.gasUsed.mul(
        buyTx2Receipt.effectiveGasPrice
      );
      const user2AfterTx2Balance = await bondingCurveToken.provider.getBalance(
        user2.address
      );
      expect(user2AfterTx2Balance).to.equal(
        user2BeforeTx2Balance.sub(weiSpentByBuyTx2.add(90)).add(5)
      );
      expect(await bondingCurveToken.balanceOf(user2.address)).to.equal(5);
    });
  });

  describe("sell", function () {
    it("selling returns amount back to user and captures fees", async function () {
      const { user1, user2, bondingCurveToken } = await loadFixture(
        deployBondingCurveToken
      );

      await bondingCurveToken.connect(user1).buy({ value: 60 });
      await bondingCurveToken.connect(user2).buy({ value: 85 });

      const user1BeforeTx1Balance = await bondingCurveToken.provider.getBalance(
        user1.address
      );
      const sellTx1 = await bondingCurveToken.connect(user1).sell(4);
      const sellTx1Receipt = await sellTx1.wait();
      const weiSpentBySellTx1 = sellTx1Receipt.gasUsed.mul(
        sellTx1Receipt.effectiveGasPrice
      );
      const user1AfterTx1Balance = await bondingCurveToken.provider.getBalance(
        user1.address
      );
      expect(user1AfterTx1Balance).to.equal(
        user1BeforeTx1Balance.sub(weiSpentBySellTx1).add(63)
      );
      expect(await bondingCurveToken.collectedFees()).to.equal(7);
      expect(await bondingCurveToken.balanceOf(user1.address)).to.equal(1);
    });
  });

  describe("withdrawFees", function () {
    it("admin can withdraw collected fees", async function () {
      const { deployer, user1, bondingCurveToken } = await loadFixture(
        deployBondingCurveToken
      );
      await bondingCurveToken.connect(user1).buy({ value: 60 });
      await bondingCurveToken.connect(user1).sell(5);

      expect(await bondingCurveToken.collectedFees()).to.equal(6);
      const currentUser1Balance = await bondingCurveToken.provider.getBalance(
        user1.address
      );

      await bondingCurveToken.connect(deployer).withdrawFees(user1.address, 5);
      expect(await bondingCurveToken.collectedFees()).to.equal(1);
      expect(
        await bondingCurveToken.provider.getBalance(user1.address)
      ).to.equal(currentUser1Balance.add(5));
    });
  });
});
