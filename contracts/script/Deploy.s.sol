// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {PostRegistry} from "../src/PostRegistry.sol";
import {PulseTips} from "../src/PulseTips.sol";

/// @notice Deploys the Pulse contract suite to Monad.
/// @dev Usage:
///   forge script script/Deploy.s.sol:Deploy \
///     --rpc-url $MONAD_RPC_URL --private-key $PRIVATE_KEY --broadcast
contract Deploy is Script {
    function run()
        external
        returns (PostRegistry registry, PulseTips tips)
    {
        vm.startBroadcast();
        registry = new PostRegistry();
        tips = new PulseTips();
        vm.stopBroadcast();
    }
}
