const PropertyRegistry = artifacts.require("./PropertyRegistry.sol");

contract('PropertyRegistry', (accounts) => {

    let property;
    const alice = accounts[0], bob = accounts[1];

    it("should be deployed, PropertyRegistry", async () => {
        var propertyRegistry = await PropertyRegistry.deployed();
        assert(propertyRegistry !== undefined, "Property registry is deployed");
    });

    it("should allow alice to register her property", async () => {});

    it("should not allow bob to register alice's property", async () => {});
});

