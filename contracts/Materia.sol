
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0; 

import "@openzeppelin/contracts/utils/Strings.sol";

import './erc1155/ERC1155Tradable.sol';

 
/**
 * @title Materia
 */
contract Materia is ERC1155Tradable {

    uint256 private constant _MAX_SUPPLY_CAP = 10000;
    uint128 private _start;
    uint128 private _end;
    bool private _allowMinting;

    constructor(
    string memory _name,
    string memory _symbol,
    string memory _metadataURI
  ) ERC1155Tradable(_name, _symbol, _metadataURI) {
    
  }


}

/*
  uint256 private constant _MAX_SUPPLY_CAP = 10000;
  uint128 private _start;
  uint128 private _end;
*/