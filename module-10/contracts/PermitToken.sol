// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";

contract PermitToken is ERC20, Ownable, ERC20Permit {
    constructor() ERC20("PermitToken", "PTK") ERC20Permit("PermitToken") {}

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
