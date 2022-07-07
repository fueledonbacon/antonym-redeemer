
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0; 

import "@openzeppelin/contracts/utils/Strings.sol";

import './erc1155/ERC1155Tradable.sol';

 
/**
 * @title Materia
 */
contract Materia is ERC1155Tradable {

    // gas optimization we pack these in a 256 bits slot
    uint16 private constant _MAX_MATERIA_SUPPLY_CAP = 10000;
    uint16 private constant _MAX_PRIMA_MATERIA_SUPPLY_CAP = 52;
    uint16 private _mintedMateria;
    uint16 private _mintedPrimaMateria;
    uint64 private _start;
    uint64 private _end;

    bool private _allowMinting;

    mapping(uint256 => bool) private isAntonymTokenUsed;

    constructor(
    string memory _name,
    string memory _symbol,
    string memory _metadataURI
  ) ERC1155Tradable(_name, _symbol, _metadataURI) {
    
  }

  function mintMateria() external {
    if(_mintedMateria == 0) {
        //TODO: create and mint the first token
    }
  }

  function mintPrimaMateria() external {
    if(_mintedPrimaMateria == 0) {
        //TODO: create and mint the first token
    }
  }

  function getAmountMinted(uint8 tokenId) external view returns (uint16) {
    //TODO: return amount minted if tokenId 1 = Materia, tokenId2 = PrimaMateria
  }


}
