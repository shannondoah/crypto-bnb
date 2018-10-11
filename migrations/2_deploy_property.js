var Property = artifacts.require("./Property.sol");
var PropertyRegistry = artifacts.require("./PropertyRegistry.sol");
var PropertyToken = artifacts.require("./PropertyToken.sol");

module.exports = function(deployer) {
    deployer.deploy(Property);
    deployer.deploy(PropertyToken);
    deployer.deploy(PropertyRegistry, Property.address, 0);
};
