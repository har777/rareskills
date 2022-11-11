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

  async function getTestHelperBondingCurveToken(
    bondingCurveTokenAddress: string
  ) {
    const [, , , , user4] = await ethers.getSigners();

    const TestHelperBondingCurveToken = await ethers.getContractFactory(
      "TestHelperBondingCurveToken"
    );
    const testHelperBondingCurveToken =
      await TestHelperBondingCurveToken.deploy(bondingCurveTokenAddress);

    await user4.sendTransaction({
      to: testHelperBondingCurveToken.address,
      value: ethers.utils.parseEther("1.0"),
      data: testHelperBondingCurveToken.interface.encodeFunctionData(
        "fundTestHelper"
      ),
    });

    return { testHelperBondingCurveToken };
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

    it("no fees collected if sale proceed is < 10 wei", async function () {
      const [_, user1] = await ethers.getSigners();

      const BondingCurveToken = await ethers.getContractFactory(
        "BondingCurveToken"
      );
      const bondingCurveToken = await BondingCurveToken.deploy(5);

      await bondingCurveToken.connect(user1).buy({ value: 6 });
      await bondingCurveToken.connect(user1).sell(1);
      expect(await bondingCurveToken.collectedFees()).to.equal(0);
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

  describe("reverts", function () {
    it("base price too high", async function () {
      const BondingCurveToken = await ethers.getContractFactory(
        "BondingCurveToken"
      );
      await expect(
        BondingCurveToken.deploy(
          "100000000000000000000000000000000000000000000000000000000000000000000000000001"
        )
      ).to.be.revertedWith("basePrice too high");
    });
  });

  it("wei sent for buying too low to buy any tokens", async function () {
    const { user1, bondingCurveToken } = await loadFixture(
      deployBondingCurveToken
    );
    await expect(
      bondingCurveToken.connect(user1).buy({ value: 1 })
    ).to.be.revertedWith("Amount not enough to buy a token");
  });

  it("buy refund extra wei failed", async function () {
    const { bondingCurveToken } = await loadFixture(deployBondingCurveToken);
    const { testHelperBondingCurveToken } =
      await getTestHelperBondingCurveToken(bondingCurveToken.address);

    await expect(testHelperBondingCurveToken.buy(15)).to.be.revertedWith(
      "Refund of extra wei during buy failed"
    );
  });

  it("sell quantity more than quantity owned", async function () {
    const { user1, bondingCurveToken } = await loadFixture(
      deployBondingCurveToken
    );
    await expect(bondingCurveToken.connect(user1).sell(1)).to.be.revertedWith(
      "quantity higher than balance"
    );
  });

  it("sell sending wei back failed", async function () {
    const { user1, bondingCurveToken } = await loadFixture(
      deployBondingCurveToken
    );

    const { testHelperBondingCurveToken } =
      await getTestHelperBondingCurveToken(bondingCurveToken.address);

    await user1.sendTransaction({
      to: testHelperBondingCurveToken.address,
      value: ethers.utils.parseEther("1.0"),
      data: testHelperBondingCurveToken.interface.encodeFunctionData(
        "fundTestHelper"
      ),
    });

    await testHelperBondingCurveToken.buy(10);
    await expect(testHelperBondingCurveToken.sell(1)).to.be.revertedWith(
      "Sell user proceeds transfer back failed"
    );
  });

  it("withdrawFees called by non-admin", async function () {
    const { user1, bondingCurveToken } = await loadFixture(
      deployBondingCurveToken
    );
    const revertReason = `AccessControl: account ${user1.address.toLowerCase()} is missing role 0x0000000000000000000000000000000000000000000000000000000000000000`;
    await expect(
      bondingCurveToken.connect(user1).withdrawFees(user1.address, 1)
    ).to.be.revertedWith(revertReason);
  });

  it("fees to withdraw more than collectedFees", async function () {
    const { deployer, user1, bondingCurveToken } = await loadFixture(
      deployBondingCurveToken
    );

    await bondingCurveToken.connect(user1).buy({ value: 60 });
    await bondingCurveToken
      .connect(user1)
      .sell(await bondingCurveToken.totalSupply());
    await expect(
      bondingCurveToken
        .connect(deployer)
        .withdrawFees(
          deployer.address,
          (await bondingCurveToken.collectedFees()).add(1)
        )
    ).to.be.revertedWith("feesToWithdraw > collectedFees");
  });

  it("withdrawFees sending wei back failed", async function () {
    const { deployer, user1, bondingCurveToken } = await loadFixture(
      deployBondingCurveToken
    );

    const { testHelperBondingCurveToken } =
      await getTestHelperBondingCurveToken(bondingCurveToken.address);

    await bondingCurveToken.connect(user1).buy({ value: 60 });
    await bondingCurveToken
      .connect(user1)
      .sell(await bondingCurveToken.totalSupply());
    await expect(
      bondingCurveToken
        .connect(deployer)
        .withdrawFees(
          testHelperBondingCurveToken.address,
          await bondingCurveToken.collectedFees()
        )
    ).to.be.revertedWith("Fees withdraw failed");
  });
});
