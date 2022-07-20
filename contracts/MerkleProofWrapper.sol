
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract MerkleProofWrapper {
    function verify(
        bytes32[] memory proof,
        bytes32 root,
        bytes32 leaf
    ) public pure returns (bool) {
        return MerkleProof.verify(proof, root, leaf);
    }

    function verifyCalldata(
        bytes32[] calldata proof,
        bytes32 root,
        bytes32 leaf
    ) public pure returns (bool) {
        return MerkleProof.verifyCalldata(proof, root, leaf);
    }

    function processProof(bytes32[] memory proof, bytes32 leaf) public pure returns (bytes32) {
        return MerkleProof.processProof(proof, leaf);
    }

    function processProofCalldata(bytes32[] calldata proof, bytes32 leaf) public pure returns (bytes32) {
        return MerkleProof.processProofCalldata(proof, leaf);
    }

    function multiProofVerify(
        uint256[] calldata tokenIds,
        bytes32[] memory proofs,
        bool[] memory proofFlag,
        bytes32 root
    ) public pure returns (bool) {
        uint256 size =  tokenIds.length;
        bytes32[] memory leaves = new bytes32[](size);
        for(uint256 t; t < size; t++) {
            leaves[t] = keccak256(abi.encodePacked(tokenIds[t]));
        } 
        return MerkleProof.multiProofVerify(proofs, proofFlag, root, leaves);
    }


    function getLeaves(
        uint256[] memory tokenIds
    ) public pure returns (bytes32[] memory leaves) {
        leaves = new bytes32[](tokenIds.length);
        for(uint256 t; t < tokenIds.length; t++) {
            uint256 tokenId = tokenIds[t];
            leaves[t] = keccak256(abi.encode(tokenId));
        }
    }

    function multiProofVerifyCalldata(
        bytes32[] calldata proofs,
        bool[] calldata proofFlag,
        bytes32 root,
        bytes32[] memory leaves
    ) public pure returns (bool) {
        return MerkleProof.multiProofVerifyCalldata(proofs, proofFlag, root, leaves);
    }

    function processMultiProof(
        bytes32[] memory proofs,
        bool[] memory proofFlag,
        bytes32[] memory leaves
    ) public pure returns (bytes32) {
        return MerkleProof.processMultiProof(proofs, proofFlag, leaves);
    }

    function processMultiProofCalldata(
        bytes32[] calldata proofs,
        bool[] calldata proofFlag,
        bytes32[] memory leaves
    ) public pure returns (bytes32) {
        return MerkleProof.processMultiProofCalldata(proofs, proofFlag, leaves);
    }
}