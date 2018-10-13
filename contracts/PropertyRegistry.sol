pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/token/ERC721/ERC721Basic.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';

contract PropertyRegistry {
  ERC20 propertyToken;
  ERC721Basic public property;
  mapping(uint256 => Data) public stayData;

  struct Data {
    uint256 price;
    uint256 stays;
    address occupant;
    address[] requested;
    address[] approved;
    mapping (address => Request) requests;
  }

  struct Request {
    uint256 checkIn;
    uint256 checkOut;
    bool approved;
  }

  event Registered(uint256 indexed _tokenId);
  event Approved(uint256 indexed _tokenId);
  event Rejected(uint indexed _tokenId);
  event Requested(uint256 indexed _tokenId);
  event CheckIn(uint256 indexed _tokenId);
  event CheckOut(uint256 indexed _tokenId);

  constructor(address _property, address _propertyToken) public {
    property = ERC721Basic(_property);
    propertyToken = ERC20(_propertyToken);
  }

  modifier onlyOwner(uint256 _tokenId) {
    require(property.ownerOf(_tokenId) == msg.sender, "No non-owners allowed!");
    _;
  }

  modifier requestApproved(uint256 _tokenId) {
    require(stayData[_tokenId].requests[msg.sender].approved, "Request not approved for this sender");
    _;
  }

  function getRequesters(uint256 _tokenId) view public returns(address[]) {
    return stayData[_tokenId].requested;
  }

  function getRequest(uint256 _tokenId, address _requester) view public returns(uint256, uint256, bool) {
    return (stayData[_tokenId].requests[_requester].checkIn, stayData[_tokenId].requests[_requester].checkOut, stayData[_tokenId].requests[_requester].approved);
  }

  function registerProperty(uint256 _tokenId, uint256 _price) external onlyOwner(_tokenId) {
    stayData[_tokenId] = Data(_price, 0, address(0), new address[](0), new address[](0));

    emit Registered(_tokenId);
  }

  function request(uint256 _tokenId, uint256 _checkIn, uint256 _checkOut) external {
    require(stayData[_tokenId].price > 0, "Property must be registered");
    // STRETCH require(_checkIn > now, "Check-in must be at least 1 day in the future");
    require(_checkOut > _checkIn, "Check out time must be after check-in");


    stayData[_tokenId].requests[msg.sender] = Request(_checkIn, _checkOut, false);
    stayData[_tokenId].requested.push(msg.sender);
    emit Requested(_tokenId);
  }

  function approveRequest(uint256 _tokenId, address _requester, bool _approved) external onlyOwner(_tokenId) {
    if(_approved) {
      stayData[_tokenId].requests[_requester].approved = true;
      stayData[_tokenId].approved.push(_requester);

      emit Approved(_tokenId);
    } else {
      delete stayData[_tokenId].requests[_requester];
      // Delete from requested array?
      emit Rejected(_tokenId);
    }
    // STRETCH should not be able to approve a check-in request for which the start time is now in the past
  }

  function checkIn(uint256 _tokenId) external requestApproved(_tokenId) {
    require(now >= stayData[_tokenId].requests[msg.sender].checkIn, "Check-in has not yet begun");
    require(propertyToken.transferFrom(msg.sender, this, stayData[_tokenId].price));

    stayData[_tokenId].occupant = msg.sender;
    stayData[_tokenId].stays++;

    emit CheckIn(_tokenId);
  }

  function checkOut(uint256 _tokenId) external {
    require(stayData[_tokenId].occupant == msg.sender, "Sender must be current occupant");
    require(propertyToken.transfer(property.ownerOf(_tokenId), stayData[_tokenId].price));
    // require(now < stayData[_tokenId].checkOut);
    // STRETCH implement some kind of late checkout to penalize occupant

    delete stayData[_tokenId].requests[msg.sender];
    // Delete from requested & approved arrays?
    stayData[_tokenId].occupant = address(0);

    emit CheckOut(_tokenId);
  }

}
