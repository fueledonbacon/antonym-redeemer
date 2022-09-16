/*
Crafted with love by
Fueled on Bacon
https://fueledonbacon.com
*/
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IMateria {
    function mintMateria(uint256 antonymTokenId, bytes memory signature) external;
    function mintPrimaMateria(uint256 antonymTokenId, bytes memory signature, bytes32[] calldata proof) external;
}