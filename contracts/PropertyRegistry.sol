pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/token/ERC721/ERC721Basic.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';

contract PropertyRegistry {
  ERC20 propertyToken;
  ERC721Basic public property;
  mapping(uint256 => Data) public stayData;
  mapping(uint256 => Request) public requests;

  struct Data {
    uint256 price;
    uint256 stays;
    address occupant;
  }

  struct Request {
    uint256 checkIn;
    uint256 checkOut;
    address guest;
    bool approved;
  }

  constructor(address _property, address _propertyToken) public {
    property = ERC721Basic(_property);
    propertyToken = ERC20(_propertyToken);
  }

  modifier onlyOwner(uint256 _tokenId) {
    require(property.ownerOf(_tokenId) == msg.sender, "No non-owners allowed!");
    _;
  }

  modifier requestApproved(uint256 _tokenId) {
    require(requests[_tokenId].approved && requests[_tokenId].guest == msg.sender, "Request not approved for this sender");
    _;
  }

  function registerProperty(uint256 _tokenId, uint256 _price) external onlyOwner(_tokenId) {
    stayData[_tokenId] = Data(_price, 0, address(0));
  }

  function request(uint256 _tokenId, uint256 _checkIn, uint256 _checkOut) external {
    require(stayData[_tokenId].price > 0, "Property must be registered");
    require(requests[_tokenId].guest == address(0), "Property must not have any requests in progress");
    // --- require(_checkIn > now, "Check-in must be at least 1 day in the future");
    require(_checkOut > _checkIn, "Check out time must be after check-in");

    requests[_tokenId] = Request(_checkIn, _checkOut, msg.sender, false);
    // --- should be able to put in a new request if an existing request is idle (check in time has passed)
  }

  function approveRequest(uint256 _tokenId, bool _approved) external onlyOwner(_tokenId) {
    if(_approved) {
      requests[_tokenId].approved = true;
    } else {
      delete requests[_tokenId];
    }
    // --- should not be able to approve a check-in request for which the start time is now in the past
  }

  function checkIn(uint256 _tokenId) external requestApproved(_tokenId) {
    require(now >= requests[_tokenId].checkIn, "Check-in has not yet begun");
    // --- stayData[_tokenId].stays++;

    //REQUIRED: transfer tokens to propertyRegistry upon successful check in
    //this == this contract address
    require(propertyToken.transferFrom(msg.sender, this, stayData[_tokenId].price));
    stayData[_tokenId].occupant = requests[_tokenId].guest;
  }

  function checkOut(uint256 _tokenId) external {
    require(stayData[_tokenId].occupant == msg.sender, "Sender must be current occupant");
    // require(now < stayData[_tokenId].checkOut);
    // --- record if checkout is late, penalize occupant

    //REQUIRED: transfer tokens to Alice upon successful check out
    require(propertyToken.transfer(property.ownerOf(_tokenId), stayData[_tokenId].price));

    delete requests[_tokenId];
    stayData[_tokenId].occupant = address(0);
  }

}
