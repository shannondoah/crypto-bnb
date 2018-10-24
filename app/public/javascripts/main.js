let web3Provider;

if (typeof web3 !== 'undefined') {
    web3Provider = web3.currentProvider;
}
else {
    web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545/');
}
window.web3 = new Web3(web3Provider);

let propertyContract,
    tokenContract,
    registryContract;

let createProperty,
    registerProperty;

const createEl = (el) => { return document.createElement(el); }
const textNode = (text) => { return document.createTextNode(text); }

const run = async () => {

    if(!web3.currentProvider.isMetaMask) {
        alert("No MetaMask? Try installing the browser plugin!");
    }

    const { accounts } = web3.eth;
    const activeAccount = accounts[0];

    const getContract = async (json, web3 = window.web3) => {
        const contract = TruffleContract(json);
        contract.setProvider(web3.currentProvider);
        return await contract.deployed();
    }

    const getJson = async (blobPath) => {
        response = await fetch(blobPath);
        return await response.json();
    }

    const watchEvents = (event) => {
        event.watch((err, res) => {
            if (err)
              console.log('Error:', err)
            else
              console.log('Hey! Listen:', res)
        });
    }

    const propertyJson = await getJson('../../build/contracts/Property.json');
    propertyContract   = await getContract(propertyJson);

    const tokenJson = await getJson('../../build/contracts/PropertyToken.json');
    tokenContract   = await getContract(tokenJson);

    const registryJson = await getJson('../../build/contracts/PropertyRegistry.json');
    registryContract   = await getContract(registryJson);

    const propertyEvent = propertyContract.allEvents({ fromBlock: 0, toBlock: 'latest' });
    const tokenEvent = tokenContract.allEvents({ fromBlock: 0, toBlock: 'latest' });
    const registryEvent = registryContract.allEvents({ fromBlock: 0, toBlock: 'latest' });

    watchEvents(propertyEvent);
    watchEvents(tokenEvent);
    watchEvents(registryEvent);

    const properties = await propertyContract.getProperties
                                .call()
                                .then(results => { return results });

   for(i = 0; i < properties.length; i++) {
        const registeredPrice = await registryContract.getStayData
                                .call(properties[i].toNumber())
                                .then(results => { return results[0].toNumber() });

        var container = createEl('div'),
            title = createEl('h5'),
            attrs = createEl('ul'),
            tokenLi = createEl('li'),
            priceLi = createEl('li');

        var titleText = textNode("Property");
        var tokenId = textNode(`ID: ${properties[i]["c"]}`);
        var price = textNode(`Price: $${registeredPrice}`);

        title.appendChild(titleText);
        tokenLi.appendChild(tokenId);
        priceLi.appendChild(price);
        attrs.appendChild(tokenLi)
        attrs.appendChild(priceLi);
        container.appendChild(title);
        container.appendChild(attrs);
        document.getElementById("properties_container").appendChild(container);
   }

    createProperty = async () => {
       try {
            const tx = await propertyContract.createProperty({
                from: activeAccount,
                gas: 250000
            });
            console.log(`Property Created for ${activeAccount}`);
        } catch(e) {
            alert('Error creating property', e)
        }
    }

    registerProperty = async (e) => {
        const $this = e.currentTarget;
        const tokenId = $this.querySelector("#token_id").value;
        const cost = $this.querySelector("#cost").value;

        try {
            const tx = await registryContract.registerProperty(tokenId, cost, {
                from: activeAccount,
                gas: 250000
            });
            console.log('Property registered.');
        } catch(e) {
            alert('Error registering property', e)
        }
    }

}

run();

document.getElementById('create_property').setAttribute("onclick", "createProperty();");

document.getElementById('register_property').addEventListener("submit", async (e) => {
    await registerProperty(e);
});
