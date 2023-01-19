// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

contract EthernautFiveToken {
    mapping(address => uint) balances;
    uint public totalSupply;

    constructor(uint _initialSupply) public {
        balances[msg.sender] = totalSupply = _initialSupply;
    }

    function transfer(address _to, uint _value) public returns (bool) {
        require(balances[msg.sender] - _value >= 0);
        balances[msg.sender] -= _value;
        balances[_to] += _value;
        return true;
    }

    function balanceOf(address _owner) public view returns (uint balance) {
        return balances[_owner];
    }
}

// https://ethernaut.openzeppelin.com/level/0xbF361Efe3FcEc9c0139dEdAEDe1a76539b288935

// Solution:
// Ethernaut deploys the contract with an _initialSupply of 20.
// So us as the msg.sender now has a balance of 20
// This contract uses solidity ^0.6.0 which means there is no arithmetic overflow protection
// So see what happens if you call the transfer function with _to as some random address
// and _value being 21. balances[msg.sender] - _value becomes 20 - 21 which causes an underflow
// and results in 2^256-1 as the value. This means that the require check in line 14 passes
// as 2^256-1 is greater than or equal to 0. And it sets our balance to 2^256-1 in line 15 which is the
// largest possible uint256 value in solidity. Exploited :(
// Also the _to address in the transfer call shouldn't be our address as that would cause
// the underflow caused in line 15 to overflow again in line 16 back to value 20.
