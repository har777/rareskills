// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EthernautTwentyDenial {
    address public partner; // withdrawal partner - pay the gas, split the withdraw
    address public constant owner = address(0xA9E);
    uint timeLastWithdrawn;
    mapping(address => uint) withdrawPartnerBalances; // keep track of partners balances

    function setWithdrawPartner(address _partner) public {
        partner = _partner;
    }

    // withdraw 1% to recipient and 1% to owner
    function withdraw() public {
        uint amountToSend = address(this).balance / 100;
        // perform a call without checking return
        // The recipient can revert, the owner will still get their share
        partner.call{value: amountToSend}("");
        payable(owner).transfer(amountToSend);
        // keep track of last withdrawal time
        timeLastWithdrawn = block.timestamp;
        withdrawPartnerBalances[partner] += amountToSend;
    }

    // allow deposit of funds
    receive() external payable {}

    // convenience function
    function contractBalance() public view returns (uint) {
        return address(this).balance;
    }
}

contract EthernautTwentyBadPartner {
    uint256[] private randomArray;

    receive() external payable {
        // lets try to spend 1M gas here
        for (uint256 idx = 0; idx < 41; idx++) {
            randomArray.push(1);
        }
    }
}

// https://ethernaut.openzeppelin.com/level/0xD0a78dB26AA59694f5Cb536B50ef2fa00155C488

// Solution
// This is a very interesting exploit
// We need to make sure that the owner cant call the withdraw method
// But the only thing we can control is who the partner is
// The withdraw function does send ETH to the partner
// But it uses a call method so us writing a contract to act like a partner
// and reverting on ETH received wont work. The contract doesn't check the
// success bool of this call method.
// The ethernaut problem saying: whilst the contract still has funds, and the transaction is of 1M gas or less
// gives us two hints:
// Reentrancy is not the answer here though we can use it to drain the funds in the contract
// But gas limit of upto 1M shows us the solution
// When a call method happens, the person making the transaction, i.e. the owner has to spend gas to execute
// the logic executed by the partner contract on receiving ETH.
// So if we write a contract which on receiving ETH executes logic which spends more than 1M gas
// and make this contract the partner, the owners withdraw call will fail as it is called with
// a gaslimit < 1M
