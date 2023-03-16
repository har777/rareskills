// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract Sneaky {
    constructor(bytes memory realSneakyRuntime) {
        assembly {
            return(0xc0, 0x1a1)
        }
    }

    function add1(uint256 x) external view returns (uint256) {
        return x + 1;
    }
}

// runtime bytecode hex: 608060405234801561001057600080fd5b506004361061002b5760003560e01c8063a836572814610030575b600080fd5b61004a600480360381019061004591906100b1565b610060565b60405161005791906100ed565b60405180910390f35b600060028261006f9190610137565b9050919050565b600080fd5b6000819050919050565b61008e8161007b565b811461009957600080fd5b50565b6000813590506100ab81610085565b92915050565b6000602082840312156100c7576100c6610076565b5b60006100d58482850161009c565b91505092915050565b6100e78161007b565b82525050565b600060208201905061010260008301846100de565b92915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60006101428261007b565b915061014d8361007b565b925082820190508082111561016557610164610108565b5b9291505056fea26469706673582212200347e45f643588e7d18fd1cbfeb53a88dc31c552d24024c2cffa6c3b92dce65964736f6c63430008110033
// runtime bytecode length: 0x1a1
contract RealSneaky {
    function add1(uint256 x) external view returns (uint256) {
        return x + 2;
    }
}
