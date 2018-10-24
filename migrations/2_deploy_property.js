var Property = artifacts.require("./Property.sol");
var PropertyToken = artifacts.require("./PropertyToken.sol");
var PropertyRegistry = artifacts.require("./PropertyRegistry.sol");

module.exports = async (deployer) => {
    await deployer.deploy(Property);
    await deployer.deploy(PropertyToken);
    await deployer.deploy(PropertyRegistry, Property.address, PropertyToken.address);
};
