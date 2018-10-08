const Property = artifacts.require("./Property.sol");

contract('Property tests', (accounts) => {

    let property;
    const alice = accounts[0], bob = accounts[1];

    // To init new property before each test
    // beforeEach(async () => {
    //     property = await Property.new();
    // });

    it("should be deployed, Property", async () => {
        property = await Property.deployed();
        assert(property !== undefined, 'Property was NOT deployed');
    });

    it("should allow alice to create a property", async () => {
        property = await Property.new();
        try {
            await property.createProperty({ from: alice });
            assert(true, "Alice should be able to create a property");
        } catch(e) {
            assert(false, "Alice could not create a property");
        }
    });

    const createToken = async () => {
        property = await Property.new();
        await property.createProperty({ from: alice });
    }

    it("should get a balance of tokens by owner", async () => {
        await createToken();
        bal = await property.balanceOf(alice);
        assert.equal(bal, 1, "Alice should have a balance of 1 token");
    });

    it("should get a zero balance if no tokens are owned", async () => {
        await createToken();
        bal = await property.balanceOf(bob);
        assert.equal(bal, 0, "Bob should not have a balance of tokens");
    });

    it("should have an initial token ID of 1", async () => {
        await createToken();
        first = await property.tokenByIndex(0);
        assert.equal(first, 1, "Initial token id on new contract should be 1");
    });

    it("should increment token IDs by 1", async () => {
        await createToken();
        await property.createProperty({ from: bob });

        firstOwnedBy = await property.ownerOf(1);
        secondOwnedBy = await property.ownerOf(2);

        assert(firstOwnedBy == alice, "Alice should own token with ID 1");
        assert(secondOwnedBy == bob, "Bob should own token with ID 2");
    });

    it("should allow alice to set a URI for her token", async () => {
        await createToken();
        await property.setURI(1, "http://alice-token.com");
        const uri = await property.getURI(1);
        assert.equal(uri, "http://alice-token.com", "Alice could set a URI for her token");
    });

    it("should not allow bob to set a URI for alice's token", async () => {
        await createToken();
        try {
            await property.setURI(1, "http://alice-token.com", {from: bob});
            assert(false, "Bob was able to set a URI for alice's token");
        } catch(e) {
            assert(true, "Bob could not set a URI for alice's token");
        }
    });

});
