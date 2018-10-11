const PropertyToken = artifacts.require("./PropertyToken.sol");

contract('PropertyToken', (accounts) => {

    let propertyToken;

    it("should assert true", async () => {
        propertyToken = await PropertyToken.deployed();
        assert(propertyToken !== undefined, "Property token is deployed");
    });
});
