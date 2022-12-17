const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("Damn Vulnerable DeFi - Truster", function () {
  let deployer, attacker;

  const TOKENS_IN_POOL = ethers.utils.parseEther("1000000");

  before(async function () {
    /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
    [deployer, attacker] = await ethers.getSigners();

    const DamnValuableToken = await ethers.getContractFactory(
      "DamnValuableToken",
      deployer
    );
    const TrusterLenderPool = await ethers.getContractFactory(
      "TrusterLenderPool",
      deployer
    );
    const TrusterLenderPoolExploit = await ethers.getContractFactory(
      "TrusterLenderPoolExploit",
      deployer
    );

    this.token = await DamnValuableToken.deploy();
    this.pool = await TrusterLenderPool.deploy(this.token.address);
    this.exploit = await TrusterLenderPoolExploit.deploy();

    await this.token.transfer(this.pool.address, TOKENS_IN_POOL);

    expect(await this.token.balanceOf(this.pool.address)).to.equal(
      TOKENS_IN_POOL
    );

    expect(await this.token.balanceOf(attacker.address)).to.equal("0");
  });

  it("Exploit", async function () {
    /** CODE YOUR EXPLOIT HERE  */
    await this.exploit.exploit(
      this.pool.address,
      this.token.address,
      attacker.address
    );
  });

  after(async function () {
    /** SUCCESS CONDITIONS */

    // Attacker has taken all tokens from the pool
    expect(await this.token.balanceOf(attacker.address)).to.equal(
      TOKENS_IN_POOL
    );
    expect(await this.token.balanceOf(this.pool.address)).to.equal("0");
  });
});

// https://www.damnvulnerabledefi.xyz/challenges/3.html

// Solution:
// This is a fun exploit. The exploit lies in the fact that the pool
// does a target.functionCall(data) where both target and data is something
// you can pass in. But the pool does a balance check after that. So what we want
// to do is do some sort of call which grants you the ability to drain the tokens
// from the pool after calling flashLoan. Wait the token is a ERC20 contract
// and hence has an approve call. So the exploit works like this:
// 1. write an exploit contract. We want to do all this in 1 transaction.
// 2. call the flashLoan method with borrowAmount=0,
//    borrower=attacker(any address is fine in this case), target=erc20TokenAddress
//    and data=approve(address(exploitContract),fundsToDrain). Essentially we make the
//    pool call the approve method on the token to grant our exploit contract approval
//    to move all the funds in the pool later via transferMany. As this is only an approval
//    and not an actual transfer, the balance checks towards the end of the flashLoan
//    method passes just fine.
// 3. call the transferFrom method on the token to transfer all the pools funds
//    to the attacker.
