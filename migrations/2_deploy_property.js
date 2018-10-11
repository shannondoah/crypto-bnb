var Property = artifacts.require("./Property.sol");
var PropertyToken = artifacts.require("./PropertyToken.sol");
var PropertyRegistry = artifacts.require("./PropertyRegistry.sol");

module.exports = function(deployer) {
    deployer.deploy(Property);
    deployer.deploy(PropertyToken);
    deployer.deploy(PropertyRegistry, 0,0);
};
