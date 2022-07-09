/*
Crafted with love by
Fueled on Bacon
https://fueledonbacon.com
*/
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

import "../erc1155/ERC1155Tradable.sol";
import "../FashionNFT.sol";
import "./VerifySignatureMock.sol";
/**
 * @title Materia
 */
contract MateriaMock is ERC1155Tradable {

    uint16 private constant MAX_MATERIA = 100;
    uint16 private constant MAX_PRIMA_MATERIA = 5;

    // gas optimization we pack these in a 256 bits slot
    uint64 private _start;
    uint64 private _end;

    bytes32 private _merkleRoot;
    address private _signer;
    address private _antonym;

    bool private _allowMinting = true;

    mapping(uint256 => bool) private isAntonymTokenUsed;
    mapping(uint256 => bool) private isAntonym1on1TokenUsed;

    modifier canMint() {
        require(_allowMinting, "Minting is Paused");
        require(_start <= block.timestamp, "Minting not yet started");
        require(_end > block.timestamp, "Minting already ended");
        _;
    }

    constructor(
        string memory _name,    
        string memory _symbol,
        string memory _metadataURI,
        uint64 start,
        uint64 end,
        bytes32 merkleRoot,
        address signer,
        address antonym
    ) ERC1155Tradable(_name, _symbol, _metadataURI) {
        require(start > block.timestamp, "Start cannot be in the past");
        require(end > start && end > block.timestamp, "Wrong end deadline");
        require(signer != address(0), "Wrong signer");
        require(merkleRoot != "", "Wrong MerkleRoot");
        require(antonym != address(0), "Wrong NFT");
        _start = start;
        _end = end;
        _signer = signer;
        _merkleRoot = merkleRoot;
        _antonym = antonym;
    }

    //TODO: set metadata verification
    function mintMateria(uint256 antonymTokenId, bytes memory signature) external canMint {
        require(tokenSupply[1] + 1 <= MAX_MATERIA, "Amount Materia exceeded");
        require(!isAntonymTokenUsed[antonymTokenId], "Token already used");
        address account = _msgSender();
        require(Antonym(_antonym).ownerOf(antonymTokenId) == account, "Not token owner");
        require(_verifySignature(account, antonymTokenId, signature), "Wrong signature");
        isAntonymTokenUsed[antonymTokenId] = true;
        if (!_exists(1)) {
            _create(account, 1);
        } else {
            _mint(account, 1, 1);
        }
    }

    //TODO: set metadata verification
    function mintPrimaMateria(uint256 antonymTokenId, bytes memory signature, bytes32[] calldata proof) external canMint {
        require(tokenSupply[2] + 1 <= MAX_PRIMA_MATERIA, "Amount Prima Materia exceeded");
        require(!isAntonym1on1TokenUsed[antonymTokenId], "Token already used");
        address account = _msgSender();
        require(Antonym(_antonym).ownerOf(antonymTokenId) == account, "Not token owner");
        require(_verifySignature(account, antonymTokenId, signature), "Wrong signature");
        require(_exists(1), "A Materia should be created first");
        bytes32 leaf = keccak256(abi.encodePacked(antonymTokenId));
        require(_verifyMerkle(leaf, proof), "Invalid merkle proof");
        isAntonym1on1TokenUsed[antonymTokenId] = true;
        if (!_exists(2)) {
            _create(account, 1);
        } else {
            _mint(account, 2, 1);
        }
    }

    /**Private and Internal Functions */
    function _verifyMerkle(bytes32 leaf, bytes32[] memory proof) private view returns (bool) {
        return MerkleProof.verify(proof, _merkleRoot, leaf);
    }

    function _verifySignature(address account, uint256 tokenId, bytes memory signature) private view returns (bool) {
        return VerifySignatureMock.verify(_signer, account, tokenId, signature);
    }

    function messageHash(address account, uint256 tokenId) public pure returns (bytes32) {
        return VerifySignatureMock.getMessageHash(account, tokenId);
    }

    /** OnlyOwner Functions */
    function allowMinting(bool allow) external onlyOwner {
        _allowMinting = allow;
    }

    function setSigner(address signer) external onlyOwner {
        require(signer != address(0), "Wrong signer");
        _signer = signer;
    }

    function setDeadline(uint64 end) external onlyOwner {
        require(end > _start && end > block.timestamp, "Wrong end deadline");
        _end = end;
    }

    function mintBatchMateria(address to, uint16 amountMateria, uint16 amountPrimaMateria) external onlyOwner {
        require(_allowMinting, "Minting is Paused");
        require(_end < block.timestamp, "Deadline not yet over");
        require(tokenSupply[1] + amountMateria <= MAX_MATERIA, "Amount Materia exceeded");
        require(tokenSupply[2] + amountPrimaMateria <= MAX_PRIMA_MATERIA, "Amount Prima Materia exceeded");

        uint256[] memory tokenIds = new uint256[](2);
        tokenIds[0] = 1;
        tokenIds[1] = 2;

        uint256[] memory amounts = new uint256[](2);
        amounts[0] = amountMateria;
        amounts[1] = amountPrimaMateria;

        _batchMint(to, tokenIds, amounts);
    }



    /********************************************* */
}
