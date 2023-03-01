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
