// SPDX-License-Identifier: MIT
pragma solidity 0.8.1;

import {AppStorage, LibAppStorage, XPMerkleDrops} from "./LibAppStorage.sol";
import {MerkleProofLib} from "../libraries/LibMerkle.sol";

library LibXPAllocation {
    event XPDropCreated(bytes32 indexed _propId, bytes32 _merkleRoot, uint8 _propType);
    event XPClaimed(bytes32 indexed _propId, address indexed _claimer, uint256[] _gotchiIds);

    function _createXPDrop(bytes32 _propId, bytes32 _merkleRoot, uint8 _propType) internal {
        AppStorage storage s = LibAppStorage.diamondStorage();
        XPMerkleDrops storage xp = s.xpDrops[_propId];
        xp.root = _merkleRoot;
        xp.propType = _propType;
        emit XPDropCreated(_propId, _merkleRoot, _propType);
    }

    function _claimXPDrop(bytes32 _propId, address _claimer, uint256[] calldata _gotchiIds, bytes32[] calldata _proof) internal {
        //short-circuits
        AppStorage storage s = LibAppStorage.diamondStorage();
        if (_claimer == address(0)) revert("AddressZeroNotAllowed");
        if (_gotchiIds.length == 0) revert("EmptyGotchiList");
        if (s.xpDrops[_propId].propType == 0) revert("NonExistentDrop");
        if (s.xpClaimed[_claimer][_propId]) revert("XPClaimedAlready");
        //drops are unique by their roots
        bytes32 node = keccak256(abi.encodePacked(_claimer, _gotchiIds));
        bytes32 root = s.xpDrops[_propId].root;
        uint8 propType = s.xpDrops[_propId].propType;
        if (!MerkleProofLib.verify(_proof, root, node)) revert("IncorrectProofOrAddress");
        //perform xp allocation
        //amount must give either 10 or 20
        _allocateXPViaDrop(_gotchiIds, propType * 10);
        //record claim onchain
        s.xpClaimed[_claimer][_propId] = true;
        emit XPClaimed(_propId, _claimer, _gotchiIds);
    }

    function _allocateXPViaDrop(uint256[] calldata _tokenIds, uint256 _xpAmount) private {
        //we assume that xp allocation via drops are limited by the tree
        if (_tokenIds.length > 0) {
            AppStorage storage s = LibAppStorage.diamondStorage();
            for (uint256 i; i < _tokenIds.length; i++) {
                s.aavegotchis[_tokenIds[i]].experience += _xpAmount;
            }
        }
    }
}
