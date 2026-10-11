// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title PostRegistry
/// @notice On-chain registry of Pulse posts. Each post is identified by a
///         bytes32 id (derived from the application-side MongoDB id) and is
///         owned by the wallet that registered it.
contract PostRegistry {
    struct Post {
        address creator;
        string metadataUri;
        uint256 createdAt;
        bool active;
    }

    mapping(bytes32 => Post) private _posts;

    event PostRegistered(
        bytes32 indexed postId,
        address indexed creator,
        string metadataUri
    );
    event PostDeactivated(bytes32 indexed postId);

    error AlreadyRegistered(bytes32 postId);
    error NotRegistered(bytes32 postId);
    error NotCreator(bytes32 postId);

    function registerPost(
        bytes32 postId,
        string calldata metadataUri
    ) external {
        if (_posts[postId].creator != address(0)) {
            revert AlreadyRegistered(postId);
        }
        _posts[postId] = Post({
            creator: msg.sender,
            metadataUri: metadataUri,
            createdAt: block.timestamp,
            active: true
        });
        emit PostRegistered(postId, msg.sender, metadataUri);
    }

    function deactivatePost(bytes32 postId) external {
        Post storage post = _posts[postId];
        if (post.creator == address(0)) revert NotRegistered(postId);
        if (post.creator != msg.sender) revert NotCreator(postId);
        post.active = false;
        emit PostDeactivated(postId);
    }

    function getPost(bytes32 postId) external view returns (Post memory) {
        Post memory post = _posts[postId];
        if (post.creator == address(0)) revert NotRegistered(postId);
        return post;
    }

    function isRegistered(bytes32 postId) external view returns (bool) {
        return _posts[postId].creator != address(0);
    }

    function creatorOf(bytes32 postId) external view returns (address) {
        return _posts[postId].creator;
    }
}
