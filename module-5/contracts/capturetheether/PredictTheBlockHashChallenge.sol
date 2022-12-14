pragma solidity ^0.4.21;

contract PredictTheBlockHashChallenge {
    address guesser;
    bytes32 guess;
    uint256 settlementBlockNumber;

    function PredictTheBlockHashChallenge() public payable {
        require(msg.value == 1 ether);
    }

    function isComplete() public view returns (bool) {
        return address(this).balance == 0;
    }

    function lockInGuess(bytes32 hash) public payable {
        require(guesser == 0);
        require(msg.value == 1 ether);

        guesser = msg.sender;
        guess = hash;
        settlementBlockNumber = block.number + 1;
    }

    function settle() public {
        require(msg.sender == guesser);
        require(block.number > settlementBlockNumber);

        bytes32 answer = block.blockhash(settlementBlockNumber);

        guesser = 0;
        if (guess == answer) {
            msg.sender.transfer(2 ether);
        }
    }
}

// https://capturetheether.com/challenges/lotteries/predict-the-block-hash/

// Solution
// The trick here lies in the fact that blockhash will return 0 for
// block numbers which are more than 256 blocks older than the current block
// So lock in a guess of 0 as the guess, wait for 256 blocks to be mined and then
// call the settle method. The blockhash will return 0 as the settlementBlockNumber
// is now more than 256 blocks old and your guess of 0 will match.
