// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

error WithdrawFailed(address payable account, uint256 amount);

contract SaleToken is ERC20Capped, AccessControl {
    uint256 public constant SUPPLY_CAP = 22_000_000e18;

    // the amount of tokens you can buy for a wei
    uint256 public constant TOKENS_PER_WEI = 10_000;

    constructor() ERC20("SaleToken", "SLT") ERC20Capped(SUPPLY_CAP) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function buy(address to) external payable {
        uint256 tokens = TOKENS_PER_WEI * msg.value;
        _mint(to, tokens);
    }

    function withdraw(
        address payable to
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(to != address(0), "to cannot be a zero address");
        uint256 amount = address(this).balance;
        (bool success, ) = to.call{value: amount}("");
        if (!success) {
            revert WithdrawFailed(to, amount);
        }
    }
}
