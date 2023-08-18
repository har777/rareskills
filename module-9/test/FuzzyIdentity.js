const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { utils } = require("ethers");

describe("Capture The Ether - FuzzyIdentityChallenge", function () {
  async function deployContract() {
    const [deployer] = await ethers.getSigners();

    const FuzzyIdentityChallenge = await ethers.getContractFactory(
      "FuzzyIdentityChallenge"
    );
    const fuzzyIdentityChallenge = await FuzzyIdentityChallenge.deploy();
    await fuzzyIdentityChallenge.deployed();

    const Create2Factory = await ethers.getContractFactory("Create2Factory");
    const create2Factory = await Create2Factory.deploy();
    await create2Factory.deployed();

    const bytecode = await create2Factory.getBytecode();

    const hashedBytecode = utils.keccak256(bytecode);
    let salt = 0;
    for (; salt > -1; salt++) {
      const fuzzyIdentityChallengeExploitAddress = utils.getCreate2Address(
        create2Factory.address,
        utils.hexZeroPad(salt, 32),
        hashedBytecode
      );
      if (salt % 100_000 === 0) {
        console.log(
          "Prospective: ",
          fuzzyIdentityChallengeExploitAddress,
          salt
        );
      }
      if (
        fuzzyIdentityChallengeExploitAddress.toLowerCase().includes("badc0de")
      ) {
        console.log("**************************************************");
        console.log("FOUND: ", fuzzyIdentityChallengeExploitAddress, salt);
        console.log("**************************************************");
        break;
      }
    }
    // eg. found salt=7642246 for deployer factory address: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
    // Time taken: ~3min

    await create2Factory.deploy(salt);
    const fuzzyIdentityChallengeExploitAddress =
      await create2Factory.getAddress(bytecode, salt);

    const FuzzyIdentityChallengeExploit = await ethers.getContractFactory(
      "FuzzyIdentityChallengeExploit"
    );
    const fuzzyIdentityChallengeExploit = FuzzyIdentityChallengeExploit.attach(
      fuzzyIdentityChallengeExploitAddress
    );

    return {
      deployer,
      fuzzyIdentityChallenge,
      fuzzyIdentityChallengeExploit,
    };
  }

  describe("Exploit", function () {
    it("Successful authenticate", async function () {
      const { fuzzyIdentityChallenge, fuzzyIdentityChallengeExploit } =
        await loadFixture(deployContract);

      expect(await fuzzyIdentityChallenge.isComplete()).to.equal(false);
      await fuzzyIdentityChallengeExploit.exploit(
        fuzzyIdentityChallenge.address
      );
      expect(await fuzzyIdentityChallenge.isComplete()).to.equal(true);
    });
  });
});
