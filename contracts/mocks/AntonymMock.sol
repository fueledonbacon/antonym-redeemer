//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AntonymMock is ERC721A, Ownable {
    using Strings for uint256;

    string private baseURI;

    constructor() ERC721A("Antonym", "ANTONYM") {
        baseURI = "https://antonymnft.s3.us-west-1.amazonaws.com/json/";
    }
    
    /**
     * @notice release reserve
     */
    function releaseReserve(address _account, uint256 _quantity)
        external
    {
        _safeMint(_account, _quantity);
    }

    /**
     * @notice token URI
     */
    function tokenURI(uint256 _tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        require(_exists(_tokenId), "Cannot query non-existent token");
        return string(abi.encodePacked(baseURI, _tokenId.toString()));
    }

  

    /**
     * @notice supports interface
     * @dev overridden for EIP2981 royalties
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721A)
        returns (bool)
    {
        
        return super.supportsInterface(interfaceId);
    }

}