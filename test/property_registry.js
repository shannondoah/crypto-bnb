const PropertyRegistry = artifacts.require("./PropertyRegistry.sol");
const Property = artifacts.require("./Property.sol");

contract('PropertyRegistry', (accounts) => {

    let property, registry;
    const alice = accounts[0], bob = accounts[1];

    it("should be deployed, PropertyRegistry", async () => {
        var registry = await PropertyRegistry.deployed();
        assert(registry !== undefined, "Property registry is deployed");
    });

    const newRegistry = async () => {
        property = await Property.new();
        registry = await PropertyRegistry.new(property.address);
    }

    it("should allow alice to register her property", async () => {
        await newRegistry();
        await property.createProperty();
        try {
            await registry.registerProperty(1, 100);
            assert(true, "Alice could register her property");
        } catch(e) {
            assert(false, "Alice could not register her property");
        }
    });

    it("should not allow bob to register alice's property", async () => {
        await newRegistry();
        await property.createProperty();
        try {
            await registry.registerProperty(1, 100, {from: bob});
            assert(false, "Bob could register Alice's property");
        } catch(e) {
            assert(true, "Bob could not register Alice's property");
        }
    });
});

