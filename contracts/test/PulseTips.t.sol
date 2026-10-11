// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {PulseTips} from "../src/PulseTips.sol";

contract PulseTipsTest is Test {
    PulseTips internal tips;

    address internal creator = address(0xC0FFEE);
    address internal alice = address(0xA11CE);
    address internal bob = address(0xB0B);

    uint256 internal constant ONE = 1 ether;

    function setUp() public {
        tips = new PulseTips();
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
    }

    function test_FirstTipGoesEntirelyToCreator() public {
        uint256 before = creator.balance;
        vm.prank(alice);
        tips.tip{value: ONE}(1, creator);
        assertEq(creator.balance - before, ONE, "creator should get full first tip");
    }

    function test_SecondTipSplitsSeventyThirty() public {
        vm.prank(alice);
        tips.tip{value: ONE}(1, creator);

        uint256 creatorBefore = creator.balance;
        vm.prank(bob);
        tips.tip{value: ONE}(1, creator);

        assertEq(creator.balance - creatorBefore, (ONE * 7000) / 10000, "creator gets 70%");
        assertEq(tips.pending(1, alice), (ONE * 3000) / 10000, "alice accrues 30%");
        assertEq(tips.pending(1, bob), 0, "bob has no pending yet");
    }

    function test_ClaimTransfersBackerRewards() public {
        vm.prank(alice);
        tips.tip{value: ONE}(1, creator);
        vm.prank(bob);
        tips.tip{value: ONE}(1, creator);

        uint256 before = alice.balance;
        vm.prank(alice);
        tips.claim(1);
        assertEq(alice.balance - before, (ONE * 3000) / 10000, "alice withdraws 30%");
        assertEq(tips.pending(1, alice), 0, "nothing left pending");
    }

    function test_EarlyBackersEarnMoreShares() public {
        vm.prank(alice);
        tips.tip{value: ONE}(1, creator);
        vm.prank(bob);
        tips.tip{value: ONE}(1, creator);

        assertGt(tips.sharesOf(1, alice), tips.sharesOf(1, bob), "earlier tip = more shares");
    }

    function test_AccRewardSplitProRata() public {
        vm.prank(alice);
        tips.tip{value: 1 ether}(1, creator);

        vm.prank(bob);
        tips.tip{value: 9 ether}(1, creator);

        // Snapshot rewards accrued so far, then a third tipper contributes the
        // 30% that alice + bob split pro-rata.
        uint256 alicePendingBefore = tips.pending(1, alice);
        uint256 bobPendingBefore = tips.pending(1, bob);

        uint256 aliceShare = tips.sharesOf(1, alice);
        uint256 bobShare = tips.sharesOf(1, bob);
        uint256 total = aliceShare + bobShare;

        vm.prank(creator);
        vm.deal(creator, 100 ether);
        tips.tip{value: 10 ether}(1, creator);

        uint256 backerCut = (10 ether * 3000) / 10000;
        assertApproxEqAbs(
            tips.pending(1, alice) - alicePendingBefore,
            (backerCut * aliceShare) / total,
            2,
            "alice pro-rata reward"
        );
        assertApproxEqAbs(
            tips.pending(1, bob) - bobPendingBefore,
            (backerCut * bobShare) / total,
            2,
            "bob pro-rata reward"
        );
    }

    function test_RevertOnZeroValue() public {
        vm.prank(alice);
        vm.expectRevert(PulseTips.NoValue.selector);
        tips.tip{value: 0}(1, creator);
    }

    function test_RevertClaimWhenNothing() public {
        vm.prank(alice);
        vm.expectRevert(PulseTips.NothingToClaim.selector);
        tips.claim(1);
    }
}
