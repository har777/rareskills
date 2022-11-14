# Vertigo results for module-1 and module-2 contracts

# module-1

No issues.

# module-2

```
[+] Survivors
Mutation:
    File: /module-2/contracts/NFTWithStaking/NFTStaker.sol
    Line nr: 78
    Result: Lived
    Original line:
                 staker.nftCount -= 1;

    Mutated line:
                 staker.nftCount += 1;
```

Our tests missed waiting for atleast more than one second to see if withdrawing changed staking token reward calculations. Fixed.
