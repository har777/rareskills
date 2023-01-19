const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("Damn Vulnerable DeFi - Side entrance", function () {
  let deployer, attacker;

  const ETHER_IN_POOL = ethers.utils.parseEther("1000");

  before(async function () {
    /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
    [deployer, attacker] = await ethers.getSigners();

    const SideEntranceLenderPoolFactory = await ethers.getContractFactory(
      "SideEntranceLenderPool",
      deployer
    );
    const SideEntranceLenderPoolExploit = await ethers.getContractFactory(
      "SideEntranceLenderPoolExploit",
      deployer
    );

    this.pool = await SideEntranceLenderPoolFactory.deploy();
    this.exploit = await SideEntranceLenderPoolExploit.deploy(
      this.pool.address
    );

    await this.pool.deposit({ value: ETHER_IN_POOL });

    this.attackerInitialEthBalance = await ethers.provider.getBalance(
      attacker.address
    );

    expect(await ethers.provider.getBalance(this.pool.address)).to.equal(
      ETHER_IN_POOL
    );
  });

  it("Exploit", async function () {
    /** CODE YOUR EXPLOIT HERE */
    await this.exploit.exploit(attacker.address);
  });

  after(async function () {
    /** SUCCESS CONDITIONS */
    expect(await ethers.provider.getBalance(this.pool.address)).to.be.equal(
      "0"
    );

    // Not checking exactly how much is the final balance of the attacker,
    // because it'll depend on how much gas the attacker spends in the attack
    // If there were no gas costs, it would be balance before attack + ETHER_IN_POOL
    expect(await ethers.provider.getBalance(attacker.address)).to.be.gt(
      this.attackerInitialEthBalance
    );
  });
});

// https://www.damnvulnerabledefi.xyz/challenges/4.html

// Solution:
// Another fun exploit. The flashLoan method only checks if the
// total ETH in the pool is same at the end. It doesn't check
// if the balances value of the borrower is the same. The pool
// also allows ETH you deposited into the pool to be withdrawn.
// So the exploit works like this:
// 1. write an exploit contract which implements IFlashLoanEtherReceiver
//    and can receive ETH
// 2. in the execute method called by the pool, deposit all ETH borrowed
//    back into the pool
// 3. call the flashLoan method borrowing all the ETH in the pool
//    followed by calling the withdraw method followed by sending
//    the withdrawn ETH to the attacker address we want the final ETH to reach
// 4. this causes the exploit contract to first borrow all the ETH and then deposit
//    it back into the pool because the flashLoan triggers the execute method.
//    The execute method deposits the borrowed ETH and updates the balances of the exploit
//    contract. Now all the ETH in the pool is withdrawable by the exploit contract. Hence
//    the following method calls like withdraw work as expected draining the pool.
