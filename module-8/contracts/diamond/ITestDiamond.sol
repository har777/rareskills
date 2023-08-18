// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

interface ITestDiamond {
    function balanceOf(address _address) external view returns (uint256);

    function mint(address _address, uint256 _amount) external returns (bool);

    function tokenURI(uint256 id) external view returns (string memory);
}
