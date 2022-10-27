// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

error WithdrawFailed(address payable account, uint256 amount);

contract SaleToken is ERC20Capped, AccessControl {
    uint256 private constant SUPPLY_CAP = 22_000_000 * (10**18);
    uint256 private constant TOKENS_PER_WAI = 10_000;

    constructor() ERC20("SaleToken", "SLT") ERC20Capped(SUPPLY_CAP) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function buy(address to) external payable {
        uint256 tokens = TOKENS_PER_WAI * msg.value;
        _mint(to, tokens);
    }

    function withdraw(address payable to)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        uint256 amount = address(this).balance;
        (bool success, ) = to.call{value: amount}("");
        if (!success) {
            revert WithdrawFailed(to, amount);
        }
    }
}
