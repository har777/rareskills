// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EthernautSeventeenRecovery {
    //generate tokens
    function generateToken(string memory _name, uint256 _initialSupply) public {
        new EthernautSeventeenSimpleToken(_name, msg.sender, _initialSupply);
    }
}

contract EthernautSeventeenSimpleToken {
    string public name;
    mapping(address => uint) public balances;

    // constructor
    constructor(string memory _name, address _creator, uint256 _initialSupply) {
        name = _name;
        balances[_creator] = _initialSupply;
    }

    // collect ether in return for tokens
    receive() external payable {
        balances[msg.sender] = msg.value * 10;
    }

    // allow transfers of tokens
    function transfer(address _to, uint _amount) public {
        require(balances[msg.sender] >= _amount);
        balances[msg.sender] = balances[msg.sender] - _amount;
        balances[_to] = _amount;
    }

    // clean up after ourselves
    function destroy(address payable _to) public {
        selfdestruct(_to);
    }
}

// https://ethernaut.openzeppelin.com/level/0x1ca9f1c518ec5681C2B7F97c7385C0164c3A22Fe

// Solution
// There are two aspects to this problem:
// 1. Figuring out the token address as its supposed to be lost
// 2. How to drain the ether stored in the token
// Solving 1 is not hard. The address of a new contract is determenistic and only
// depends on the deployer address(aka the factory) and the nonce.
// Solving 2 is easy too. Notice the token has a unprotected destroy function
// which anyone call call. This function calls selfdestruct and hence anyone can
// drain the token o its ether provided they calculate the address from the step above.
