let web3Provider;

if (typeof web3 !== 'undefined') {
    web3Provider = web3.currentProvider;
}
else {
    web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545/');
}
window.web3 = new Web3(web3Provider);

let createProperty;

const run = async () => {

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

    const propertyJson     = await getJson('../../build/contracts/Property.json');
    const propertyContract = await getContract(propertyJson);

    const tokenJson        = await getJson('../../build/contracts/PropertyToken.json');
    const tokenContract    = await getContract(tokenJson);

    const registryJson     = await getJson('../../build/contracts/PropertyRegistry.json');
    const registryContract = await getContract(registryJson);

    const propertyEvent = propertyContract.allEvents({ fromBlock: 0, toBlock: 'latest' });
    const tokenEvent = tokenContract.allEvents({ fromBlock: 0, toBlock: 'latest' });
    const registryEvent = registryContract.allEvents({ fromBlock: 0, toBlock: 'latest' });

    watchEvents(propertyEvent);
    watchEvents(tokenEvent);
    watchEvents(registryEvent);

    createProperty = async () => {
       try {
            const tx = await propertyContract.createProperty({
                from: activeAccount,
                gas: 250000
            });
            console.log(tx);
            console.log(`Property Created for ${activeAccount}`);
        } catch(e) {
            console.log(e);
            alert('Error creating property', e)
        }
    }

}

run();

document.getElementById('createProperty').setAttribute("onclick", "createProperty();");
