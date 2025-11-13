// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script} from "forge-std/Script.sol";
import {BlockRider} from "../src/BlockRider.sol";

contract CounterScript is Script {
    BlockRider public blockRider;

    function setUp() public {}

    function run() public {
        uint256 privateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(privateKey);

        blockRider = new BlockRider();

        vm.stopBroadcast();
    }
}
