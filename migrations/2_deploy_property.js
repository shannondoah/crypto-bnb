var Property = artifacts.require("./Property.sol");
var PropertyRegistry = artifacts.require("./PropertyRegistry.sol");

module.exports = function(deployer) {
  deployer.deploy(Property);
  deployer.deploy(PropertyRegistry, Property.address);
};
