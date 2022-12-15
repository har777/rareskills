pragma solidity ^0.4.21;

contract CTETokenWhaleChallenge {
    address player;

    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    string public name = "Simple ERC20 Token";
    string public symbol = "SET";
    uint8 public decimals = 18;

    function CTETokenWhaleChallenge(address _player) public {
        player = _player;
        totalSupply = 1000;
        balanceOf[player] = 1000;
    }

    function isComplete() public view returns (bool) {
        return balanceOf[player] >= 1000000;
    }

    event Transfer(address indexed from, address indexed to, uint256 value);

    function _transfer(address to, uint256 value) internal {
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;

        emit Transfer(msg.sender, to, value);
    }

    function transfer(address to, uint256 value) public {
        require(balanceOf[msg.sender] >= value);
        require(balanceOf[to] + value >= balanceOf[to]);

        _transfer(to, value);
    }

    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );

    function approve(address spender, uint256 value) public {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
    }

    function transferFrom(address from, address to, uint256 value) public {
        require(balanceOf[from] >= value);
        require(balanceOf[to] + value >= balanceOf[to]);
        require(allowance[from][msg.sender] >= value);

        allowance[from][msg.sender] -= value;
        _transfer(to, value);
    }
}

// https://capturetheether.com/challenges/math/token-whale/

// Solution
// The max value of a uint256 is 2^256-1. 2^256 overflows
// and becomes 0 because this contract is still on pragma ^0.4.21.
// Similarly 0 underflows and becomes 2^256-1 too.
// The exploit is with how transferFrom calls the _transfer method.
// Notice how _transfer reduces the balance from msg.sender not the
// from address which should be the case when called by transferFrom
// So the exploit works as follows:
// 1. Assume there are 2 users: user1 and user2. user1 starts with 1000 tokens
//    and is the player
// 2. First user1 calls transfer(user2, 1000) and transfers all their tokens to user2
// 3. Then user2 calls approve(user1, 1) and gives user1 approval
//    to spend 1 token they hold
// 4. So user1 has 0 tokens, user2 has 1000 tokens and user1 has approval to spend
//    1 token of user2
// 5. Now all user1 has to call is transferFrom(user2, address(0), 1)
// 6. All the require checks pass.
//    1. balance[user2] == 1000 which is > 1
//    2. balanceOf[to] + value >= balanceOf[to] works fine because we used address(0)
//       Any address here works for value 1 as long as the to address doesnt have a balance of 2^256-1
//    3. allowance[from][msg.sender] == 1 which is >= 1
//    4. line: 27 now does balanceOf[msg.sender] -= value
//       but balanceOf[msg.sender] is 0 as msg.sender is user1. value is 1.
//       So 0-1 happens which underflows to 2^256-1 and balance[user1] gets set to this
// Exploit done.
