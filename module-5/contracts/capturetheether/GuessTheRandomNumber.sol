pragma solidity ^0.4.21;

contract GuessTheRandomNumberChallenge {
    uint8 answer;

    function GuessTheRandomNumberChallenge() public payable {
        require(msg.value == 1 ether);
        answer = uint8(keccak256(block.blockhash(block.number - 1), now));
    }

    function isComplete() public view returns (bool) {
        return address(this).balance == 0;
    }

    function guess(uint8 n) public payable {
        require(msg.value == 1 ether);

        if (n == answer) {
            msg.sender.transfer(2 ether);
        }
    }
}

// https://capturetheether.com/challenges/lotteries/guess-the-random-number/

// Solution
// Notice how the answer is calculated and stored in the constructor.
// It just uses blockhash and block.timestamp both of which can be easily queried.
// i.e. after this contract is deployed, you can easily get all the data required
// to calculate this answer by just looking at the deployed and prev block.
// So calculate it and call the guess function with that value.
