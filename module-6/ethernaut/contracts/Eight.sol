// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EthernautEightVault {
    bool public locked;
    bytes32 private password;

    constructor(bytes32 _password) {
        locked = true;
        password = _password;
    }

    function unlock(bytes32 _password) public {
        if (password == _password) {
            locked = false;
        }
    }
}

// https://ethernaut.openzeppelin.com/level/0x3A78EE8462BD2e31133de2B8f1f9CBD973D6eDd6

// Solution
// The password variable though private is easily fetchable by querying the chain
// The data exists in storage slot 2. All we need to do is fetch that and call
// unlock with it
