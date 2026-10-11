// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title PulseTips
/// @notice Escrow + revenue-split tipping for Pulse on Monad.
///
/// When a tip is sent the value is split immediately:
///   - 70% goes to the post creator.
///   - 30% is distributed to earlier supporters of the post, weighted by how
///     early they tipped (a MasterChef-style accumulator).
///
/// Supporters earn "shares" as a function of the amount tipped and the total
/// tipped before them:
///     shares = amount * K / (K + totalTippedBefore)
/// where K = 1e18, so early tips earn more shares than later ones. The 30%
/// backer cut is added to `accRewardPerShare`, and supporters pull their
/// accrued rewards with {claim}.
contract PulseTips {
    uint256 public constant BPS_DENOMINATOR = 10_000;
    uint256 public constant CREATOR_BPS = 7_000; // 70%
    uint256 public constant SHARES_SCALE = 1e18; // K used in the share formula

    struct PostPool {
        address creator;
        uint256 totalShares;
        uint256 totalTipped;
        uint256 accRewardPerShare; // scaled by SHARES_SCALE
    }

    mapping(uint256 => PostPool) private _pools;
    mapping(uint256 => mapping(address => uint256)) public sharesOf;
    mapping(uint256 => mapping(address => uint256)) public rewardDebt;
    mapping(uint256 => mapping(address => uint256)) public claimable;

    uint256 private _locked = 1;

    event Tipped(
        uint256 indexed postId,
        address indexed backer,
        address indexed creator,
        uint256 amount,
        uint256 creatorCut,
        uint256 backerCut,
        uint256 shares
    );
    event Claimed(uint256 indexed postId, address indexed backer, uint256 amount);
    event CreatorRegistered(uint256 indexed postId, address indexed creator);

    error NoValue();
    error CreatorRequired();
    error NothingToClaim();
    error TransferFailed();
    error Reentrant();

    modifier nonReentrant() {
        if (_locked != 1) revert Reentrant();
        _locked = 2;
        _;
        _locked = 1;
    }

    /// @notice Tip a post. The creator is registered on the first tip.
    function tip(uint256 postId, address creator) external payable nonReentrant {
        if (msg.value == 0) revert NoValue();

        PostPool storage pool = _pools[postId];

        if (pool.creator == address(0)) {
            if (creator == address(0)) revert CreatorRequired();
            pool.creator = creator;
            emit CreatorRegistered(postId, creator);
        }

        uint256 amount = msg.value;
        uint256 creatorCut = (amount * CREATOR_BPS) / BPS_DENOMINATOR;
        uint256 backerCut = amount - creatorCut;

        if (pool.totalShares == 0) {
            // No supporters to reward yet — the creator keeps the full tip.
            creatorCut += backerCut;
            backerCut = 0;
        } else if (backerCut > 0) {
            pool.accRewardPerShare +=
                (backerCut * SHARES_SCALE) /
                pool.totalShares;
        }

        // Materialise the sender's accrued rewards before changing shares.
        _sync(postId, msg.sender);

        // Grant new "early-backer" shares to the sender.
        uint256 newShares = (amount * SHARES_SCALE) /
            (SHARES_SCALE + pool.totalTipped);
        pool.totalShares += newShares;
        pool.totalTipped += amount;
        sharesOf[postId][msg.sender] += newShares;

        // Reset the sender's debt so their new shares start from now.
        rewardDebt[postId][msg.sender] =
            (sharesOf[postId][msg.sender] * pool.accRewardPerShare) /
            SHARES_SCALE;

        if (creatorCut > 0) {
            (bool ok, ) = pool.creator.call{value: creatorCut}("");
            if (!ok) revert TransferFailed();
        }

        emit Tipped(
            postId,
            msg.sender,
            pool.creator,
            amount,
            creatorCut,
            backerCut,
            newShares
        );
    }

    /// @notice Withdraw accrued backer rewards for a post.
    function claim(uint256 postId) external nonReentrant {
        _sync(postId, msg.sender);
        uint256 amount = claimable[postId][msg.sender];
        if (amount == 0) revert NothingToClaim();
        claimable[postId][msg.sender] = 0;

        (bool ok, ) = msg.sender.call{value: amount}("");
        if (!ok) revert TransferFailed();

        emit Claimed(postId, msg.sender, amount);
    }

    /// @notice Rewards currently claimable by a supporter.
    function pending(
        uint256 postId,
        address backer
    ) external view returns (uint256) {
        PostPool storage pool = _pools[postId];
        uint256 accrued = (sharesOf[postId][backer] *
            pool.accRewardPerShare) /
            SHARES_SCALE -
            rewardDebt[postId][backer];
        return claimable[postId][backer] + accrued;
    }

    function getPool(
        uint256 postId
    ) external view returns (PostPool memory) {
        return _pools[postId];
    }

    function creatorOf(uint256 postId) external view returns (address) {
        return _pools[postId].creator;
    }

    function _sync(uint256 postId, address user) internal {
        PostPool storage pool = _pools[postId];
        uint256 accrued = (sharesOf[postId][user] * pool.accRewardPerShare) /
            SHARES_SCALE -
            rewardDebt[postId][user];
        if (accrued > 0) {
            claimable[postId][user] += accrued;
        }
        rewardDebt[postId][user] =
            (sharesOf[postId][user] * pool.accRewardPerShare) /
            SHARES_SCALE;
    }
}
