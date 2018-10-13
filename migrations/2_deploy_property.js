var Property = artifacts.require("./Property.sol");
var PropertyRegistry = artifacts.require("./PropertyRegistry.sol");
var PropertyToken = artifacts.require("./PropertyToken.sol");

module.exports = async function(deployer) {
    deployer.deploy(Property).then( () => {
        return deployer.deploy(PropertyToken).then( () => {
            return deployer.deploy(PropertyRegistry, Property.address, PropertyToken.address);
        });
    });
};
