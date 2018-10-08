pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";

contract Property is ERC721Token {
  constructor() ERC721Token("Property", "PPT") public { }

  // Requires that the TOKEN owner is performing the action
  modifier onlyOwner(uint256 _tokenId) {
    require(tokenOwner[_tokenId] == msg.sender);
    _;
  }

  // Enables outside caller to create a token
  function createProperty() external {
    _mint(msg.sender, allTokens.length + 1);
  }

  // Saves an endpoint that can return a JSON objet of property data
  function setURI(uint256 _tokenId, string _uri) external onlyOwner(_tokenId) {
    _setTokenURI(_tokenId, _uri);
  }

  // Retrieves property endpoint
  function getURI(uint256 _tokenId) external view returns(string) {
    return tokenURIs[_tokenId];
  }
}
