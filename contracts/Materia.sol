// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Strings.sol";

import "./erc1155/ERC1155Tradable.sol";

/**
 * @title Materia
 */
contract Materia is ERC1155Tradable {
    // gas optimization we pack these in a 256 bits slot
    uint16 private constant _MAX_MATERIA_SUPPLY_CAP = 10000;
    uint16 private constant _MAX_PRIMA_MATERIA_SUPPLY_CAP = 52;
    uint64 private _start;
    uint64 private _end;

    bool private _allowMinting;

    mapping(uint256 => bool) private isAntonymTokenUsed;

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _metadataURI,
        uint64 start,
        uint64 end
    ) ERC1155Tradable(_name, _symbol, _metadataURI) {
        require(start > block.timestamp, "Start cannot be in the past");
        require(end > start && end > block.timestamp, "Wrong end deadline");
        _start = start;
        _end = end;
    }

    //TODO: set metadata verification
    function mintMateria() external {
        require(_allowMinting, "Minting is Paused");
        require(_start >= block.timestamp, "Minting not yet started");
        require(_end < block.timestamp, "Minting already ended");
        if (!_exists(1)) {
            _create(_msgSender(), 1);
        } else {
            require(tokenSupply[1] < _MAX_MATERIA_SUPPLY_CAP, "Materia Reached Max Cap");
            
        }
    }

    //TODO: set metadata verification
    function mintPrimaMateria() external {
        if (!_exists(2)) {
            _create(_msgSender(), 1);
        } else {
            require(
                tokenSupply[2] < _MAX_PRIMA_MATERIA_SUPPLY_CAP,
                "Prima Materia Reached Max Cap"
            );
        }
    }

    function getAmountMinted(uint8 tokenId) external view returns (uint16) {
        //TODO: return amount minted if tokenId 1 = Materia, tokenId2 = PrimaMateria
    }
}
