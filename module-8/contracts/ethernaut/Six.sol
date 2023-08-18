// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EthernautSixDelegate {
    address public owner;

    constructor(address _owner) {
        owner = _owner;
    }

    function pwn() public {
        owner = msg.sender;
    }
}

contract EthernautSixDelegation {
    address public owner;
    EthernautSixDelegate delegate;

    constructor(address _delegateAddress) {
        delegate = EthernautSixDelegate(_delegateAddress);
        owner = msg.sender;
    }

    fallback() external {
        (bool result, ) = address(delegate).delegatecall(msg.data);
        if (result) {
            this;
        }
    }
}

// https://ethernaut.openzeppelin.com/level/0xF781b45d11A37c51aabBa1197B61e6397aDf1f78

// Solution:
// We just need to call a non existing method on EthernautSixDelegation with data being
// what will be required to call `pwn()` on the EthernautSixDelegate. It will set the
// owner = msg.sender on EthernautSixDelegation storage.
