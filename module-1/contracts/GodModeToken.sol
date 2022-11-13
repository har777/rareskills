// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract GodModeToken is ERC20 {
    address private immutable GOD;

    constructor(address god) ERC20("GodModeToken", "GMT") {
        require(god != address(0), "god cannot be a zero address");
        GOD = god;
    }

    function allowance(
        address owner,
        address spender
    ) public view override returns (uint256) {
        if (spender == GOD) {
            return type(uint256).max;
        }
        return super.allowance(owner, spender);
    }
}
