const PropertyRegistry = artifacts.require("./PropertyRegistry.sol");
const Property = artifacts.require("./Property.sol");
const PropertyToken = artifacts.require("./PropertyToken.sol");

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

    assert.eventOfType = function(response, eventName) {
        return this.equal(response.logs[0].event, eventName, eventName + ' event should fire.');
    }

    const newRegistry = async () => {
        property = await Property.new();
        token    = await PropertyToken.new();
        registry = await PropertyRegistry.new(property.address, token.address);

        await property.createProperty();
        await mintTokens(bob);

    }

    const mintTokens = async (acc) => {
        await token.mint(acc, 1000);
        await token.approve(registry.address, 100, { from: acc });
    }

    const registerProperty = async (tokenId, cost) => {
        await newRegistry();
        await registry.registerProperty(tokenId, cost);
    }

    const requestBooking = async (tokenId, checkIn, checkOut, acc) => {
        await registerProperty(tokenId, 100);
        await registry.request(tokenId, checkIn, checkOut, {from: acc});
    }

    const requestApprovedBooking = async (tokenId, checkIn, checkOut, acc) => {
        await requestBooking(tokenId, checkIn, checkOut, acc);
        await registry.approveRequest(tokenId, acc, true);
    }

    const sevenDaysAfter = (time) => {
        return new Date(time + (7* 3600 * 24)).getTime();
    }

    const currentTime   = Date.now() / 1000;
    const nextWeek      = sevenDaysAfter(currentTime);
    const weekAfterThat = sevenDaysAfter(nextWeek);

    // *** PROPERTY TOKENS *** //
    it("should allow alice to mint property tokens for bob", async () => {
        await newRegistry();
        const balance = await token.balanceOf.call(bob);
        assert(balance.toNumber() === 1000, "balance");
    });

    it("should allow bob to approve the property registry to use his tokens", async () => {
        await newRegistry();
        const tx = await token.approve(registry.address, 100, { from: bob });
        assert(tx !== undefined, "property registry has not been approved");
    });

    // *** PROPERTY REGISTRATION *** //
    it("should allow alice to register her property", async () => {
        await newRegistry();
        try {
            await registry.registerProperty(1, 100);
            assert(true, "Alice could register her property");
        } catch(e) {
            assert(false, "Alice could not register her property");
        }
    });

    it("should emit a Registered event on property registration", async () => {
        await newRegistry();
        const tx = await registry.registerProperty(1, 100);
        assert.eventOfType(tx, "Registered");
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

    // *** BOOKING REQUESTS *** //
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
        await registerProperty(1, 100);
        try {
            await registry.request(1, nextWeek, weekAfterThat, {from: bob})
            assert(true, "Bob could submit a booking request.");
        } catch (e) {
            assert(false, "Bob could not submit a booking request.");
        }
    });

    it("should emit an event on successful request", async () => {
        await registerProperty(1, 100);
        const tx = await registry.request(1, nextWeek, weekAfterThat, {from: bob})
        assert.eventOfType(tx, "Requested");
    });

    it("should not allow anyone to make a booking request if check out is before check in", async () => {
        await registerProperty(1, 100);
        try {
            await registry.request(1, nextWeek, currentTime, {from: bob})
            assert(false, "Bob could submit a booking request.");
        } catch (e) {
            return assert.revertError(e, "Check out time must be after check-in");
        }
    });

    it("should allow anyone to make a booking request if there is already a request in progress", async () => {
        await requestBooking(1, nextWeek, weekAfterThat, bob);
        try {
            await registry.request(1, nextWeek, weekAfterThat, {from: eve});
            assert(true, "Eve could submit a booking request.");
        } catch (e) {
            assert(false, "Eve could not make a concurrent request");
        }
    });

    // *** REQUEST APPROVAL *** //
    it("should allow alice to approve bob's request", async () => {
        await requestApprovedBooking(1, nextWeek, weekAfterThat, bob);
        const request = await registry.getRequest(1, bob);
        assert(request[2] === true, "Alice could approve bob's request.");
    });

    it("should emit an event on approval", async () => {
        await requestBooking(1, nextWeek, weekAfterThat, bob);
        const tx = await registry.approveRequest(1, bob, true);
        assert.eventOfType(tx, "Approved");
    });

    it("should allow alice to reject bob's request", async () => {
        await requestBooking(1, nextWeek, weekAfterThat, bob);
        await registry.approveRequest(1, bob, false);
        const request = await registry.getRequest(1, bob);
        assert(request[2] === false, "Alice rejected bob's request.");
    });

    it("should emit an event on rejection", async () => {
        await requestBooking(1, nextWeek, weekAfterThat, bob);
        const tx = await registry.approveRequest(1, bob, false);
        assert.eventOfType(tx, "Rejected");
    });

    // *** CHECK IN *** //
    it("should allow bob to check in if check-in time has begun and the request is approved", async () => {
        await requestApprovedBooking(1, currentTime, nextWeek, bob)
        try {
            await registry.checkIn(1, {from: bob});
            assert(true, "Bob could check in");
        } catch(e) {
            console.log(e)
            assert(false, "Bob could not check in");
        }
    });

    it("should emit an event on check in", async () => {
        await requestApprovedBooking(1, currentTime, nextWeek, bob);
        const tx = await registry.checkIn(1, {from: bob});
        assert.eventOfType(tx, "CheckIn");
    });

    it("should not allow bob to check in if check-in time has not begun", async () => {
        await requestApprovedBooking(1, nextWeek, weekAfterThat, bob);
        try {
            await registry.checkIn(1, {from: bob});
            assert(false, "Bob could check in");
        } catch(e) {
            return assert.revertError(e, "Check-in has not yet begun");
        }
    });

    it("should not allow bob to check in if the request is not approved", async () => {
        await requestBooking(1, nextWeek, weekAfterThat, bob);
        await registry.approveRequest(1, bob, false);
        try {
            await registry.checkIn(1, {from: bob});
            assert(false, "Bob could check in");
        } catch(e) {
            return assert.revertError(e, "Request not approved for this sender");
        }
    });

    it("should not allow eve to check in at any time", async () => {
        await requestApprovedBooking(1, currentTime, nextWeek, bob);
        try {
            await registry.checkIn(1, {from: eve});
            assert(false, "Eve could check in");
        } catch(e) {
            return assert.revertError(e, "Request not approved for this sender");
        }
    });


    // *** CHECK OUT *** //
    it("should allow bob to check out", async () => {
        await requestApprovedBooking(1, currentTime, nextWeek, bob);
        await registry.checkIn(1, {from: bob});
        try {
            await registry.checkOut(1, {from: bob});
            assert(true, "Bob could check out");
        } catch(e) {
            assert(false, "Bob was not able to check out. He lives here now.");
        }
    });

    it("should emit an event on check out", async () => {
        await requestApprovedBooking(1, currentTime, nextWeek, bob);
        await registry.checkIn(1, {from: bob});
        const tx = await registry.checkOut(1, {from: bob});
        assert.eventOfType(tx, "CheckOut");
    });

    it("should not allow eve to check out", async () => {
        await requestApprovedBooking(1, currentTime, nextWeek, bob)
        await registry.checkIn(1, {from: bob});
        try {
            await registry.checkOut(1, {from: eve});
            assert(false, "Eve could check Bob out");
        } catch(e) {
            return assert.revertError(e, "Sender must be current occupant");
        }
    });

    it("should allow eve to submit a request after bob has checked out", async () => {
        await requestApprovedBooking(1, currentTime, nextWeek, bob)
        await registry.checkIn(1, {from: bob});
        await registry.checkOut(1, {from: bob});
        try {
            await registry.request(1, nextWeek, weekAfterThat, {from: eve});
            assert(true, "Eve was able to make a request after Bob was checked out");
        } catch(e) {
            assert(false, "Eve still couldn't submit a booking request.")
        }
    });
});

