import { Gateway, FileSystemWallet } from 'fabric-network';
import * as path from 'path';

// == init ==
const org = 'org4';
const epochName = 'epoch3';
const minibatchNumber = 6;
const workerName = 'worker1';
// == finish ==
const learningTime = '3sec';
const loss = 0.123;
const ccpPath = path.resolve(__dirname, `../../../connection-${org}.json`);
async function initMinibatch() {
    try {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(__dirname, `../../wallet/${org}`);
        const wallet = await new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.exists('admin');
        if (!identity) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.ts application before retrying');
            return;
        }
        // Create a new gateway for connecting to our peer node.
        console.log(`1`);
        const gateway = new Gateway();
        console.log(`2`);
        await gateway.connect(ccpPath, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: true } });
        console.log(`3`);
        
        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mainchannel');
        console.log(`4`);
        
        // Get the contract from the network.
        const contract = network.getContract('chaineuralcc');
        console.log(`5`);
        await contract.createTransaction('initMinibatch').submit(minibatchNumber.toString(), epochName, workerName, org);
        console.log(`Transaction has been submitted`);
        // let response = await contract.evaluateTransaction('queryAllPrivateDetails', epochName, org);
        // console.log(`Transaction has been evaluated, result is: ${response.toString()}`);
        // Disconnect from the gateway.
        await gateway.disconnect();
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

async function finishMinibatch() {
    try {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(__dirname, `../../wallet/${org}`);
        const wallet = await new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.exists('admin');
        if (!identity) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.ts application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mainchannel');

        // Get the contract from the network.
        const contract = network.getContract('chaineuralcc');

        let transientData = {
            'learningTime': Buffer.from(JSON.stringify(learningTime)),
            'loss': Buffer.from(JSON.stringify(loss)),
        };
        console.log(transientData);
        let response = await contract.createTransaction('finishMinibatch').setTransient(transientData).submit(minibatchNumber.toString(), epochName, org);
        console.log(`Transaction has been submitted`);
        console.log(`Response`);
        console.log(response.toString());
        // let response = await contract.evaluateTransaction('queryAllPrivateDetails', epochName, org);
        // console.log(`Transaction has been evaluated, result is: ${response.toString()}`);
        // Disconnect from the gateway.
        await gateway.disconnect();
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

async function queryEpoch() {
    try {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(__dirname, `../../wallet/${org}`);
        const wallet = await new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.exists('admin');
        if (!identity) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.ts application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        console.log(`1`);
        await gateway.connect(ccpPath, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: true } });
        console.log(`2`);

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mainchannel');
        console.log(`3`);
        // Get the contract from the network.
        const contract = network.getContract('chaineuralcc');
        console.log(`4`);
        let response = await contract.createTransaction('queryEpoch').submit(epochName);
        console.log(response.toString());
        console.log(`Transaction has been submitted`);
        // let response = await contract.evaluateTransaction('queryAllPrivateDetails', epochName, org);
        // console.log(`Transaction has been evaluated, result is: ${response.toString()}`);
        // Disconnect from the gateway.
        await gateway.disconnect();
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

async function queryMinibatch() {
    try {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(__dirname, `../../wallet/${org}`);
        const wallet = await new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.exists('admin');
        if (!identity) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.ts application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mainchannel');

        // Get the contract from the network.
        const contract = network.getContract('chaineuralcc');
        let response = await contract.createTransaction('queryMinibatch').submit(epochName, minibatchNumber.toString(), org);
        console.log(response.toString());
        console.log(`Transaction has been submitted`);
        // let response = await contract.evaluateTransaction('queryAllPrivateDetails', epochName, org);
        // console.log(`Transaction has been evaluated, result is: ${response.toString()}`);
        // Disconnect from the gateway.
        await gateway.disconnect();
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

async function queryMinibatchPrivateInfo() {
    try {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(__dirname, `../../wallet/${org}`);
        const wallet = await new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.exists('admin');
        if (!identity) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.ts application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mainchannel');

        // Get the contract from the network.
        const contract = network.getContract('chaineuralcc');
        let response = await contract.createTransaction('queryMinibatch').submit(epochName, minibatchNumber.toString(), org);
        console.log(response.toString());
        console.log(`Transaction has been submitted`);
        // let response = await contract.evaluateTransaction('queryAllPrivateDetails', epochName, org);
        // console.log(`Transaction has been evaluated, result is: ${response.toString()}`);
        // Disconnect from the gateway.
        await gateway.disconnect();
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

async function deleteAllData() {
    try {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(__dirname, `../../wallet/${org}`);
        const wallet = await new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.exists('admin');
        if (!identity) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.ts application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mainchannel');

        // Get the contract from the network.
        const contract = network.getContract('chaineuralcc');
        let response = await contract.createTransaction('deleteAllData').submit();
        console.log(response.toString());
        console.log(`Transaction has been submitted`);
        // let response = await contract.evaluateTransaction('queryAllPrivateDetails', epochName, org);
        // console.log(`Transaction has been evaluated, result is: ${response.toString()}`);
        // Disconnect from the gateway.
        await gateway.disconnect();
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

initMinibatch();
// finishMinibatch();
// queryEpoch();
// queryMinibatch();
// queryMinibatchPrivateInfo();
// deleteAllData();