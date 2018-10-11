pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol';

contract PropertyToken is MintableToken {
  string public name = "PropertyToken";
  string public symbol = "PPT";
  uint8 public decimals = 2;
  uint public INITIAL_SUPPLY = 1000;

  constructor() public {
    totalSupply_ = INITIAL_SUPPLY;
    balances[msg.sender] = INITIAL_SUPPLY;
  }
}
