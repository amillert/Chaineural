import { Gateway, FileSystemWallet } from 'fabric-network';
import * as path from 'path';
const org = process.env.ORG as string;
const ccpPath = path.resolve(__dirname, `./../connection-${org}.json`);
const walletPath = path.resolve(__dirname, `./../wallet/${org}`);
console.log('org');
console.log(org);
console.log('__dirname');
console.log(__dirname);
export async function initMinibatch(epochName, minibatchNumber, workerName) {
    try {
        console.log('/api/init-minibatch/' + epochName+'/' + minibatchNumber+'/' + minibatchNumber)
        const wallet = await new FileSystemWallet(walletPath);
        // console.log(`Wallet path: ${walletPath}`);
        // console.log(JSON.stringify({'epochName':epochName,'minibatchNumber':minibatchNumber,'workerName':workerName}))
        // Check to see if we've already enrolled the user.
        const identity = await wallet.exists('admin');
        if (!identity) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.ts application before retrying');
            return;
        }
        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: false } });
        
        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mainchannel');
        
        // Get the contract from the network.
        const contract = network.getContract('chaineuralcc');
        contract.createTransaction('initMinibatch').submit(minibatchNumber.toString(), epochName, workerName, org);
        // console.log(`Transaction has been submitted`);
        // let response = await contract.evaluateTransaction('queryAllPrivateDetails', epochName, org);
        // console.log(`Transaction has been evaluated, result is: ${response.toString()}`);
        // Disconnect from the gateway.
        await gateway.disconnect();
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

export async function finishMinibatch(epochName, minibatchNumber, learningTime:number, loss:number) {
    try {
        console.log('/api/finish-minibatch/' + epochName+'/' + minibatchNumber+'/' + learningTime+'/' + loss)
        const wallet = await new FileSystemWallet(walletPath);
        // console.log(`Wallet path: ${walletPath}`);
        // console.log(JSON.stringify({'epochName':epochName,'minibatchNumber':minibatchNumber,'learningTime':learningTime,'loss':loss}))
        // Check to see if we've already enrolled the user.
        const identity = await wallet.exists('admin');
        if (!identity) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.ts application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: false } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mainchannel');

        // Get the contract from the network.
        const contract = network.getContract('chaineuralcc');

        let transientData = {
            'learningTime': Buffer.from(JSON.stringify(learningTime)),
            'loss': Buffer.from(JSON.stringify(loss)),
        };
        let response = contract.createTransaction('finishMinibatch').setTransient(transientData).submit(minibatchNumber.toString(), epochName, org);
        // console.log(`Transaction has been submitted`);
        await gateway.disconnect();
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

export async function queryEpoch(epochName) {
    try {
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
        await gateway.connect(ccpPath, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: false } });
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

export async function queryMinibatch(org, epochName, minibatchNumber) {
    try {
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
        await gateway.connect(ccpPath, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: false } });

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

export async function queryAverageTimeAndLoss(epochName) {
    try {
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
        await gateway.connect(ccpPath, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: false } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mainchannel');

        // Get the contract from the network.
        const contract = network.getContract('chaineuralcc');
        let response = await contract.createTransaction('queryAverageTimeAndLoss').submit(epochName, org);
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

export async function deleteAllData(org) {
    try {
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
        await gateway.connect(ccpPath, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: false } });

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

export async function putTestData(test) {
    try {
        console.log('putTestData');
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
        await gateway.connect(ccpPath, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: false } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mainchannel');

        // Get the contract from the network.
        const contract = network.getContract('chaineuralcc');
        let response = await contract.createTransaction('putTestData').submit(test);
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