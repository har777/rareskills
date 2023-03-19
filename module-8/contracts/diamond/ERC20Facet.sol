// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./ERC20.sol";

contract ERC20Facet is ERC20 {
    constructor() ERC20("DIAMOND_ERC721_1", "DMER721_1", 20) {}

    function balanceOf(address _address) external view returns (uint256) {
        Storage storage _storage = _getStorage();
        return _storage.balanceOf[_address];
    }

    function mint(address _address, uint256 _amount) external returns (bool) {
        _mint(_address, _amount);
        return true;
    }
}
