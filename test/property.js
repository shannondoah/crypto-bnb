const Property = artifacts.require("./Property.sol");

contract('Property tests', (accounts) => {

    let property;

    it("should be deployed, Property", async () => {
        var property = await Property.deployed();
        console.log(property);
        assert(property !== undefined, 'Property was NOT deployed');
    });
});
