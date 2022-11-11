// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./BondingCurveToken.sol";

contract TestHelperBondingCurveToken {
    BondingCurveToken private bondingCurveToken;

    constructor(address _address) {
        bondingCurveToken = BondingCurveToken(_address);
    }

    function fundTestHelper() external payable {}

    function buy(uint256 weiAmount) external {
        bondingCurveToken.buy{value: weiAmount}();
    }

    function sell(uint256 quantity) public {
        bondingCurveToken.sell(quantity);
    }

    function withdrawFees(address payable to, uint256 feesToWithdraw) external {
        bondingCurveToken.withdrawFees(to, feesToWithdraw);
    }
}
