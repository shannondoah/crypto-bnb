pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/token/ERC721/ERC721Basic.sol';

contract PropertyRegistry {
  ERC721Basic public property;
  mapping(uint256 => Data) public stayData;

  struct Data {
    uint256 price;
    uint256 stays;
    address occupant;
  }

  constructor(address _property) public {
    property = ERC721Basic(_property);
  }

  modifier onlyOwner(uint256 _tokenId) {
    require(property.ownerOf(_tokenId) == msg.sender);
    _;
  }

  function registerProperty(uint256 _tokenId, uint256 _price) external onlyOwner(_tokenId) {
    stayData[_tokenId] = Data(_price, 0, address(0));
  }
}
