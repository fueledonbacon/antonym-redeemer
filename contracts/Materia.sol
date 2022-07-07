// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

import "./erc1155/ERC1155Tradable.sol";
import "./FashionNFT.sol";

/**
 * @title Materia
 */
contract Materia is ERC1155Tradable {

    using SignatureChecker for address;

    // gas optimization we pack these in a 256 bits slot
    uint64 private _start;
    uint64 private _end;

    bytes32 private _merkleRoot;
    address private _signer;
    address private _antonym;

    bool private _allowMinting;

    mapping(uint256 => bool) private isAntonymTokenUsed;
    mapping(uint256 => bool) private isAntonym1on1TokenUsed;

    modifier canMint() {
        require(_allowMinting, "Minting is Paused");
        require(_start >= block.timestamp, "Minting not yet started");
        require(_end < block.timestamp, "Minting already ended");
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
        require(!isAntonymTokenUsed[antonymTokenId], "Token already used");
        address account = _msgSender();
        require(Antonym(_antonym).ownerOf(antonymTokenId) == account, "Not token owner");
        require(_verifySignature(account, antonymTokenId, signature), "Wrong signature");
        if (!_exists(1)) {
            _create(account, 1);
        } else {
            _mint(account, 1, 1);
        }
    }

    //TODO: set metadata verification
    function mintPrimaMateria(uint256 antonymTokenId, bytes memory signature, bytes32[] calldata proof) external canMint {
        require(!isAntonym1on1TokenUsed[antonymTokenId], "Token already used");
        address account = _msgSender();
        require(Antonym(_antonym).ownerOf(antonymTokenId) == account, "Not token owner");
        require(_verifySignature(account, antonymTokenId, signature), "Wrong signature");
        bytes32 leaf = keccak256(abi.encodePacked(antonymTokenId));
        require(_verifyMerkle(leaf, proof), "Invalid merkle proof");
        if (!_exists(2)) {
            _create(account, 1);
        } else {
            _mint(account, 2, 1);
        }
    }

    function getAmountMinted(uint8 tokenId) external view returns (uint16) {
        require(tokenId > 0 && tokenId <= 2, "Wrong token id");
        return tokenSupply[tokenId]; 
    }

    /**Private and Internal Functions */
    function _verifyMerkle(bytes32 leaf, bytes32[] memory proof) private view returns (bool) {
        return MerkleProof.verify(proof, _merkleRoot, leaf);
    }

    function _verifySignature(address account, uint256 tokenId, bytes memory signature) private view returns (bool) {
        bytes32 hashedValue = keccak256(abi.encodePacked(account, tokenId));
        return _signer.isValidSignatureNow(hashedValue, signature);

    }

    /** OnlyOwner Functions */
    function setAllowMinting(bool allow) external onlyOwner {
        _allowMinting = allow;
    }

    function setSigner(address signer) external onlyOwner {
        require(signer != address(0), "Wrong signer");
        _signer = signer;
    }

    function setStart(uint64 start) external onlyOwner {
        require(start > block.timestamp, "Start cannot be in the past");
        require(_end > start, "Start is greater than end");
        _start = start;
    }

    function setDeadline(uint64 end) external onlyOwner {
        require(end > _start && end > block.timestamp, "Wrong end deadline");
        _end = end;
    }

    function mintBatch(address to) external onlyOwner {
        require(_allowMinting, "Minting is Paused");
        require(_end < block.timestamp, "Deadline not yet over");
        uint16 amountMateriaMinted = tokenSupply[1];
        uint256 amountMateriaToMint = 10000 - amountMateriaMinted;
        uint256 amountPrimaMateriaMinted = tokenSupply[2];
        uint256 amountPrimaMateriaToMint = 52 - amountPrimaMateriaMinted;

        uint256[] memory tokenIds = new uint256[](2);
        tokenIds[0] = 1;
        tokenIds[1] = 2;

        uint256[] memory amounts = new uint256[](2);
        amounts[0] = amountMateriaToMint;
        amounts[1] = amountPrimaMateriaToMint;

        _batchMint(to, tokenIds, amounts);

    }

    /********************************************* */
}
