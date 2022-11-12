// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

contract BondingCurveToken is ERC20Capped, AccessControl {
    /*
    This contract implements a linear bonding curve.
    If the supply goes up by 1, the buy price of the next token becomes prevPrice + 1
    */

    uint256 public constant SUPPLY_CAP = 22_000_000e18;

    // BASE_PRICE represents the price of the first token
    // This is in wei
    uint256 private immutable BASE_PRICE;

    // Withdrawable fees collected when users sell the token
    // This is in wei
    uint256 public collectedFees;

    constructor(
        uint256 basePrice
    ) ERC20("BondingCurveToken", "BCT") ERC20Capped(SUPPLY_CAP) {
        require(basePrice <= 1e77, "basePrice too high");
        BASE_PRICE = basePrice;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    // Given a supply, returns the total market cap for those tokens
    // We take the area of the new supply, subtract the area of the supply at 0
    // and further subtract a value which will smooth out the result
    // aka (no more price increments for supply going up a decimal point)
    // Public just because its interesting to play around with
    function getMarketCapForSupply(
        uint256 supply
    ) public view returns (uint256 marketCap) {
        marketCap = ((((supply + BASE_PRICE) ** 2) / 2) -
            ((BASE_PRICE * BASE_PRICE) / 2) -
            (supply / 2));
    }

    // Given an amount and the current supply,
    // returns the max number of tokens that can be minted for that amount
    // amount is in wei
    // Solves quadratic equation:
    // ax2 + bx + c = 0, where
    // a, b and c are real numbers and
    // a ≠ 0
    // using
    // (-b ± (b ** 2 - 4 * a * c) ** 0.5) / (2 * a)
    // Public just because its interesting to play around with
    function getNumOfTokensToMint(
        uint256 amount,
        uint256 currentSupply
    ) public view returns (uint256 numOfTokens, uint256 newSupply) {
        uint256 a = 1;
        uint256 b = (2 * BASE_PRICE) - 1;
        uint256 c = ((currentSupply ** 2) +
            (((2 * BASE_PRICE) - 1) * currentSupply) +
            (2 * amount));

        uint256 numeratorLeftSide = b;
        uint256 numeratorRightSide = Math.sqrt(b ** 2 + (4 * a * c));

        uint256 denominator = 2 * a;

        newSupply = (numeratorRightSide - numeratorLeftSide) / denominator;
        numOfTokens = newSupply - currentSupply;
    }

    // Lets a user buy tokens in exchange for wei
    function buy() external payable {
        address user = _msgSender();
        uint256 currentSupply = totalSupply();

        uint256 amount = msg.value;
        (uint256 numOfTokens, uint256 newSupply) = getNumOfTokensToMint(
            amount,
            currentSupply
        );
        require(numOfTokens > 0, "Amount not enough to buy a token");

        // The user might have sent an amount which is
        // more than the amount required for the tokens we are minting
        uint256 amountUsed = getMarketCapForSupply(newSupply) -
            getMarketCapForSupply(currentSupply);
        uint256 extraAmount = amount - amountUsed;

        // Mint the tokens
        _mint(user, numOfTokens);

        // Refund extra amount back to the user
        if (extraAmount > 0) {
            (bool success, ) = payable(user).call{value: extraAmount}("");
            require(success, "Refund of extra wei during buy failed");
        }
    }

    // Lets a user sell tokens owned by them and get wei back
    function sell(uint256 quantity) external {
        address user = _msgSender();
        require(quantity <= balanceOf(user), "quantity higher than balance");

        uint256 currentSupply = totalSupply();

        // Market cap of sold tokens is the difference between
        // current market cap and market cap after the tokens are sold
        uint256 saleProceeds = getMarketCapForSupply(currentSupply) -
            getMarketCapForSupply(currentSupply - quantity);

        // Return all wei from sold tokens to the user if it's less than 10
        // We wont be collecting fees in that scenario
        uint256 userProceeds = saleProceeds;

        // Else take a 10% cut as fees
        if (saleProceeds > 9) {
            userProceeds = (9 * saleProceeds) / 10;
            collectedFees += (saleProceeds - userProceeds);
        }

        // Burn the tokens
        _burn(user, quantity);

        // Send the users proceeds from the sale back
        (bool success, ) = payable(user).call{value: userProceeds}("");
        require(success, "Sell user proceeds transfer back failed");
    }

    // Given a address and an amount to withdraw,
    // sends that amount to the address from the collected fees
    // feesToWithdraw is in wei
    function withdrawFees(
        address payable to,
        uint256 feesToWithdraw
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(to != address(0), "to cannot be a zero address");
        require(
            feesToWithdraw <= collectedFees,
            "feesToWithdraw > collectedFees"
        );
        collectedFees = collectedFees - feesToWithdraw;
        (bool success, ) = to.call{value: feesToWithdraw}("");
        require(success, "Fees withdraw failed");
    }
}
