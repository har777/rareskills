// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

error AccountIsSanctioned(address account);

contract SanctionableToken is ERC20Capped, AccessControl {
    mapping(address => bool) private sanctioned;
    uint256 public constant SUPPLY_CAP = 100_000_000e18;

    event Sanctioned(address indexed account);
    event UnSanctioned(address indexed account);

    constructor() ERC20("SanctionableToken", "STK") ERC20Capped(SUPPLY_CAP) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function sanction(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        sanctioned[account] = true;
        emit Sanctioned(account);
    }

    function unSanction(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        sanctioned[account] = false;
        emit UnSanctioned(account);
    }

    function isSanctioned(address account) public view returns (bool) {
        return sanctioned[account];
    }

    modifier whenNotSanctioned(address account) {
        if (isSanctioned(account)) {
            revert AccountIsSanctioned({account: account});
        }
        _;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotSanctioned(from) whenNotSanctioned(to) {
        super._beforeTokenTransfer(from, to, amount);
    }
}
