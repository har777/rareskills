pragma solidity 0.8.18;

import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";

contract Exchange {
    struct PermitSig {
        address owner;
        address spender;
        uint256 value;
        uint256 deadline;
        uint8 v;
        bytes32 r;
        bytes32 s;
    }

    struct Order {
        address buyAddress;
        uint256 buyQuantity;
        address sellAddress;
        uint256 sellQuantity;
        PermitSig permitSig;
    }

    ERC20Permit private immutable tokenA;
    ERC20Permit private immutable tokenB;

    constructor(ERC20Permit _tokenA, ERC20Permit _tokenB) {
        tokenA = _tokenA;
        tokenB = _tokenB;
    }

    function executeOrders(Order[] calldata orders) external {
        uint256 tokenAInExchangeControl;
        uint256 tokenBInExchangeControl;

        uint256 iter;
        uint256 ordersCount = orders.length;

        while (iter < ordersCount) {
            Order calldata order = orders[iter];

            require(order.permitSig.spender == address(this));
            require(order.sellQuantity == order.permitSig.value);
            require(
                order.buyAddress == address(tokenA) ||
                    order.buyAddress == address(tokenB)
            );
            require(
                order.sellAddress == address(tokenA) ||
                    order.sellAddress == address(tokenB)
            );

            if (order.sellAddress == address(tokenA)) {
                tokenA.permit(
                    order.permitSig.owner,
                    order.permitSig.spender,
                    order.permitSig.value,
                    order.permitSig.deadline,
                    order.permitSig.v,
                    order.permitSig.r,
                    order.permitSig.s
                );
                tokenA.transferFrom(
                    order.permitSig.owner,
                    address(this),
                    order.sellQuantity
                );
                unchecked {
                    tokenAInExchangeControl += order.sellQuantity;
                }
            } else {
                tokenB.permit(
                    order.permitSig.owner,
                    order.permitSig.spender,
                    order.permitSig.value,
                    order.permitSig.deadline,
                    order.permitSig.v,
                    order.permitSig.r,
                    order.permitSig.s
                );
                tokenB.transferFrom(
                    order.permitSig.owner,
                    address(this),
                    order.sellQuantity
                );
                unchecked {
                    tokenBInExchangeControl += order.sellQuantity;
                }
            }

            unchecked {
                ++iter;
            }
        }

        iter = 0;
        while (iter < ordersCount) {
            Order calldata order = orders[iter];

            if (order.buyAddress == address(tokenA)) {
                tokenAInExchangeControl -= order.buyQuantity;
                tokenA.transfer(order.permitSig.owner, order.buyQuantity);
            } else {
                tokenBInExchangeControl -= order.buyQuantity;
                tokenB.transfer(order.permitSig.owner, order.buyQuantity);
            }

            unchecked {
                ++iter;
            }
        }

        require(tokenAInExchangeControl == 0 && tokenBInExchangeControl == 0);
    }
}
