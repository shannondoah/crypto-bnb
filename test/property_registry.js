const PropertyRegistry = artifacts.require("./PropertyRegistry.sol");
const Property = artifacts.require("./Property.sol");

contract('PropertyRegistry', (accounts) => {

    let property, registry;
    const alice = accounts[0], bob = accounts[1], eve = accounts[3];

    it("should be deployed, PropertyRegistry", async () => {
        var registry = await PropertyRegistry.deployed();
        assert(registry !== undefined, "Property registry is deployed");
    });

    assert.revertError = function(e, message) {
      return this.equal(e.message, `VM Exception while processing transaction: revert${message ? ' ' + message : ''}`);
    }

    const newRegistry = async () => {
        property = await Property.new();
        registry = await PropertyRegistry.new(property.address);
        await property.createProperty();
    }

    const requestBooking = async () => {
        await registry.registerProperty(1, 100);
        await registry.request(1, nextWeek, weekAfterThat, {from: bob});
    }

    const sevenDaysAfter = (time) => {
        return new Date(time + 7 * 24 * 60 * 60 * 1000).getTime();
    }

    const currentTime = Date.now();
    const nextWeek = sevenDaysAfter(currentTime);
    const weekAfterThat = sevenDaysAfter(nextWeek);

    it("should allow alice to register her property", async () => {
        await newRegistry();
        try {
            await registry.registerProperty(1, 100);
            assert(true, "Alice could register her property");
        } catch(e) {
            assert(false, "Alice could not register her property");
        }
    });

    it("should not allow bob to register alice's property", async () => {
        await newRegistry();
        try {
            await registry.registerProperty(1, 100, {from: bob});
            assert(false, "Bob could register Alice's property");
        } catch(e) {
            return assert.revertError(e, "No non-owners allowed!");
        }
    });

    it("should not allow anyone to make a booking request for an unregistered property", async () => {
        await newRegistry();
        try {
            await registry.request(1, nextWeek, weekAfterThat, {from: bob})
            assert(false, "Bob could submit a booking request for an unregistered property.");
        } catch (e) {
            return assert.revertError(e, "Property must be registered");
        }
    });

    it("should allow anyone to make a booking request with valid dates", async () => {
        await newRegistry();
        await registry.registerProperty(1, 100);
        try {
            await registry.request(1, nextWeek, weekAfterThat, {from: bob})
            assert(true, "Bob could submit a booking request.");
        } catch (e) {
            assert(false, "Bob could not submit a booking request.");
        }
    });

    it("should not allow anyone to make a booking request if check out is before check in", async () => {
        await newRegistry();
        await registry.registerProperty(1, 100);
        try {
            await registry.request(1, nextWeek, currentTime, {from: bob})
            assert(false, "Bob could submit a booking request.");
        } catch (e) {
            return assert.revertError(e, "Check out time must be after check-in");
        }
    });

    it("should not allow anyone to make a booking request if there is already a request in progress", async () => {
        await newRegistry();
        await requestBooking();
        try {
            await registry.request(1, nextWeek, weekAfterThat, {from: eve});
            assert(false, "Eve could submit a booking request.");
        } catch (e) {
            return assert.revertError(e, "Property must not have any requests in progress");
        }
    });

    it("should allow alice to approve bob's request", async () => {
        await newRegistry();
        await requestBooking();
        await registry.approveRequest(1, true);
        const request = await registry.requests.call(1);
        assert(request[3] === true, "Alice could approve bob's request.");
    });

    it("should allow alice to reject bob's request", async () => {
        await newRegistry();
        await requestBooking();
        await registry.approveRequest(1, false);
        const request = await registry.requests.call(1);
        assert(request[0].toString() === "0", "Alice rejected bob's request.");
    });

    it("should allow bob to check in if check-in time has begun and the request is approved", async () => {
        await newRegistry();
        await registry.registerProperty(1, 100);
        let lastWeek = new Date(currentTime - 7 * 24 * 60 * 60 * 1000).getTime();
        await registry.request(1, lastWeek, nextWeek, {from: bob})
        await registry.approveRequest(1, true);
        try {
            await registry.checkIn(1, {from: bob});
            assert(true, "Bob could check in");
        } catch(e) {
            console.log(e)
            assert(false, "Bob could not check in");
        }
    });

    it("should not allow bob to check in if check-in time has not begun", async () => {
        await newRegistry();
        await requestBooking();
        await registry.approveRequest(1, true);
        try {
            await registry.checkIn(1, {from: bob});
            assert(false, "Bob could check in");
        } catch(e) {
            return assert.revertError(e, "Check-in has not yet begun");
        }
    });

    it("should not allow bob to check in if the request is not approved", async () => {
        await newRegistry();
        await requestBooking();
        await registry.approveRequest(1, false);
        try {
            await registry.checkIn(1, {from: bob});
            assert(false, "Bob could check in");
        } catch(e) {
            assert(true, "Bob could not check in");
        }
    });

    it("should not allow eve to check in at any time", async () => {
        await newRegistry();
        await requestBooking();
        await registry.approveRequest(1, true);
        // move the clock forward??
        try {
            await registry.checkIn(1, {from: eve});
            assert(false, "Eve could check in");
        } catch(e) {
            assert(true, "Eve could not check in");
        }
    });

    // it("should allow bob to check out", async () => {

    // });

    // it("should not allow eve to check out", async () => {

    // });

    // it("should allow eve to submit a request after bob has checked out", async () => {

    // });

});

