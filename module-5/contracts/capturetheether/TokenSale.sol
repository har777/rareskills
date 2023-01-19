pragma solidity ^0.4.21;

contract CTETokenSaleChallenge {
    mapping(address => uint256) public balanceOf;
    uint256 constant PRICE_PER_TOKEN = 1 ether;

    function CTETokenSaleChallenge(address _player) public payable {
        require(msg.value == 1 ether);
    }

    function isComplete() public view returns (bool) {
        return address(this).balance < 1 ether;
    }

    function buy(uint256 numTokens) public payable {
        require(msg.value == numTokens * PRICE_PER_TOKEN);

        balanceOf[msg.sender] += numTokens;
    }

    function sell(uint256 numTokens) public {
        require(balanceOf[msg.sender] >= numTokens);

        balanceOf[msg.sender] -= numTokens;
        msg.sender.transfer(numTokens * PRICE_PER_TOKEN);
    }
}

// https://capturetheether.com/challenges/math/token-sale/

// Solution
// The max value of a uint256 is 2^256-1. 2^256 overflows
// and becomes 0 because this contract is still on pragma ^0.4.21.
// The buy logic in line 16 does numTokens * PRICE_PER_TOKEN
// Price per token is 1 ether i.e. 10^18 wei.
// So if the user is able to make numTokens * PRICE_PER_TOKEN equal 0
// when calling the buy function with 0 wei, the require check will pass.
// So call the function with numTokens as 2^238. Multiplying with 1 ether,
// the require statement will calculate 2^256 which becomes 0.
// The require check passes and the user is alloted 2^238 tokens.
// Now withdrawing the 1 ether present in the contract is as simple as calling
// sell with the numTokens as 1.
// Exploit done.
