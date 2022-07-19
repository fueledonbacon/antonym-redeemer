/*
Crafted with love by
Fueled on Bacon
https://fueledonbacon.com
*/
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

import "./erc1155/ERC1155Tradable.sol";
import "./VerifySignature.sol";

interface IAntonym {
    function ownerOf(uint256) external returns (address);
}
/**
 * @title Materia
 */
contract Materia is ERC1155Tradable {

    uint256 private constant MAX_MATERIA = 100;
    uint256 private constant MAX_PRIMA_MATERIA = 5;

    uint256 private _start;
    uint256 private _end;
    uint256 private _royaltyBasisPoints;

    bool private _allowMinting = true;

    address private _royaltyAddress;

    address private _signer;
    address private _antonym;
    bytes32 private _merkleRoot;
    bytes4 private constant _INTERFACE_ID_ERC2981 = 0x2a55205a;

    mapping(uint256 => uint256) public isAntonymTokenUsed;
    mapping(uint256 => uint256) public isAntonym1of1TokenUsed;

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
        uint256 start,
        uint256 end,
        bytes32 merkleRoot,
        address signer,
        address antonym
    ) ERC1155Tradable(_name, _symbol, _metadataURI) {
        require(start > block.timestamp, "Start cannot be in the past");
        require(end > start, "Wrong end deadline");
        require(signer != address(0), "Wrong signer");
        require(merkleRoot != "", "Wrong MerkleRoot");
        require(antonym != address(0), "Wrong NFT");
        _start = start;
        _end = end;
        _signer = signer;
        _merkleRoot = merkleRoot;
        _antonym = antonym;
    }

    /// @notice mints tokens and 1of1 tokens
    /// @param antonymTokenIds array of Antonym regular token Ids
    /// @param antonym1of1TokensIds array of Antonym 1of1 token Ids
    /// @param antonymSignature signature of Antonym regular token Ids, send 0x0 if antonymTokenIds is empty array
    /// @param antonym1of1Signature signature of Antonym 1of1 token Ids, send 0x0 if antonym1of1TokensIds is empty array
    /// @param proof merkle proof of Antonym 1of1 token Ids, send '[]' if antonym1of1TokensIds is empty array
    /// @param leaves merkle leaves of Antonym 1of1 token Ids, send '[]' if antonym1of1TokensIds is empty array
    /// @param proofFlag merkle proof flags of Antonym 1of1 token Ids, send '[]' if antonym1of1TokensIds is empty array
    function mint(
        uint256[] memory antonymTokenIds, 
        uint256[] memory antonym1of1TokensIds, 
        bytes memory antonymSignature,
        bytes memory antonym1of1Signature,
        bytes32[] calldata proof,
        bytes32[] memory leaves,
        bool[] memory proofFlag
    ) external canMint {
        address account = _msgSender();
        uint256 tokenIdsLength = uint256(antonymTokenIds.length);
        if(tokenIdsLength > 0) {
            require(tokenSupply[1] + tokenIdsLength <= MAX_MATERIA, "Amount Materia exceeded");
            require(_verifySignature(account, antonymTokenIds, antonymSignature), "Wrong Materia Signature");
            for(uint256 t; t < tokenIdsLength; t++) {
                uint256 antonymTokenId = antonymTokenIds[t];
                require(isAntonymTokenUsed[antonymTokenId] == 0, "Token already used");
                require(IAntonym(_antonym).ownerOf(antonymTokenId) == account, "Not token owner");
                isAntonymTokenUsed[antonymTokenId] = 1;
            }
            _mintTokens(account, 1, tokenIdsLength);
        }
        uint256 tokenIds1of1Length = uint256(antonym1of1TokensIds.length);
        if(tokenIds1of1Length > 0) {
            require(_exists(1), "A Materia should be created first");
            require(tokenSupply[2] + tokenIds1of1Length <= MAX_PRIMA_MATERIA, "Amount Prima Materia exceeded");
            require(_verifySignature(account, antonym1of1TokensIds, antonym1of1Signature), "Wrong Prima Signature");
            for(uint256 t; t < tokenIds1of1Length; t++) {
                uint256 antonym10f1TokenId = antonym1of1TokensIds[t];
                require(isAntonym1of1TokenUsed[antonym10f1TokenId] == 0, "Prima Token already used");
                require(IAntonym(_antonym).ownerOf(antonym10f1TokenId) == account, "Not Prima token owner");
                require(_verifyMerkle(proof, proofFlag, leaves), "Invalid merkle proof");
                isAntonym1of1TokenUsed[antonym10f1TokenId] = 1;
            }
            _mintTokens(account, 2, tokenIds1of1Length);
        }
    }

    function _mintTokens(address to, uint8 tokenId, uint256 quantity) private {
        if (!_exists(tokenId)) {
            _create(to, quantity);
        } else {
            _mint(to, tokenId, quantity);
        }
    }

    /**Private and Internal Functions */
    function _verifyMerkle(bytes32[] memory proof, bool[] memory proofFlag, bytes32[] memory leaves) private view returns (bool) {
        return MerkleProof.multiProofVerify(proof, proofFlag, _merkleRoot, leaves);
    }

    function _verifySignature(address account, uint256[] memory tokenIds, bytes memory signature) private view returns (bool) {
        return VerifySignature._verify(_signer, account, tokenIds, signature); 
    }

    function messageHash(address account, uint256[] memory tokenIds) public pure returns (bytes32) {
        return VerifySignature._getMessageHash(account, tokenIds);
    }

    /** OnlyOwner Functions */
    function allowMinting(bool allow) external onlyOwner {
        _allowMinting = allow;
    }

    function setSigner(address signer) external onlyOwner {
        require(signer != address(0), "Wrong signer");
        _signer = signer;
    }

    function setDeadline(uint256 end) external onlyOwner {
        require(end > _start && end > block.timestamp, "Wrong end deadline");
        _end = end;
    }

    function setRoyaltyAddress(address royaltyAddress) external onlyOwner {
        _royaltyAddress = royaltyAddress;
    }

    function setRoyaltyRate(uint256 royaltyBasisPoints) external onlyOwner {
        _royaltyBasisPoints = royaltyBasisPoints;
    }

    ///@notice mints batches of materia and prima materia after minting deadline is over
    ///@param to the batch tokens receiver
    ///@param amountMateria amount to mint
    ///@param amountPrimaMateria amount of prima materia to mint
    function mintBatchMateria(address to, uint256 amountMateria, uint256 amountPrimaMateria) external onlyOwner {
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

    function royaltyInfo(uint256 _tokenId, uint256 _salePrice)
        external
        view
        returns (address receiver, uint256 royaltyAmount)
    {
        require(_exists(_tokenId), "INVALID_TOKENID");
        return (_royaltyAddress, (_salePrice * _royaltyBasisPoints) / 10000);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC1155Tradable)
        returns (bool)
    {
        if (interfaceId == _INTERFACE_ID_ERC2981) {
            return true;
        }
        return super.supportsInterface(interfaceId);
    }



    /********************************************* */
}
