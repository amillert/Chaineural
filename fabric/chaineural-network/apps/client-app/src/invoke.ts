import { Gateway, FileSystemWallet, Contract } from 'fabric-network';
import * as path from 'path';
import time from 'timers';
import { Minibatch } from 'minibatch';
const org = process.env.ORG as string;
const ccpPath = path.resolve(__dirname, `./../connection-${org}.json`);
const walletPath = path.resolve(__dirname, `./../wallet/${org}`);
console.log('org');
console.log(org);
console.log('__dirname');
console.log(__dirname);
let contract: Contract;
const waitMap = new Map<string, Map<string, number>>();
class Lock {
    waiters;
    counter;
    constructor(counter) {
        this.counter = counter; // how many users can use the resource at one, set 1 for regular lock 
        this.waiters = []; // all the callback that are waiting to use the resource
    }

    hold(cb) {
        if (this.counter > 0) { // there is no one wating for the resource
            this.counter--; // update the resource is in usage
            cb();  // fire the requested callback
        } else {
            this.waiters.push(cb); // the resoucre is in usage you need to wait for it
        }
    }

    release() { // some one just relese the resource - pop the next user who is waiting and fire it
        if (this.waiters.length > 0) { // some one released the lock - so we need to see who is wating and fire it
            const cb = this.waiters.pop(); // get the latest request for the lock
            // select the relevent one
            process.nextTick(cb); // if you are on node
            setTimeout(() => cb, 0); // if you are in the browser
        } else {
            this.counter++;
        }
    }
}
let lock = new Lock(1);
initClient();
export async function initClient() {
    try {
        console.log('/api/init-client/')
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
        const gateway = new Gateway();
        // Create a new gateway for connecting to our peer node.
        await gateway.connect(ccpPath, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: false } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mainchannel');
        // Get the contract from the network.
        contract = network.getContract('chaineuralcc');
        const orgCapitalized = org.charAt(0).toUpperCase() + org.slice(1);
        const eventHubs = network.getChannel().getChannelEventHubsForOrg(orgCapitalized + 'MSP');
        eventHubs.forEach((eh) => {
            eh.getName();
            eh.registerChaincodeEvent('chaineuralcc', 'InitMinibatchEvent', (event, block_num, tx, status) => commitCallBack(event, tx, status, block_num)
                , (error) => eventError(error)
            );
            eh.registerChaincodeEvent('chaineuralcc', 'FinalMinibatchEvent', (event, block_num, tx, status) => commitCallBack(event, tx, status, block_num)
                , (error) => eventError(error)
            );
            eh.connect(true);
        });
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
    }
}

export async function initMinibatch(epochName, minibatchNumber, workerName) {
    try {
        console.log('/api/init-minibatch/' + epochName + '/' + minibatchNumber + '/' + workerName);
        let transaction = contract.createTransaction('initMinibatch');
        // const listener = await transaction.addCommitListener((error, transactionId, status, blockNumber) => commitCallBack(error, epochName, minibatchNumber.toString(), transactionId, status, blockNumber));
        const response = await transaction.submit(minibatchNumber.toString(), epochName, workerName, org);
        // console.log(response.toString(), `Transaction has been submitted`);
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
    }
}


export async function finishMinibatch(epochName, minibatchNumber, learningTime: number, loss: number) {
    try {
        console.log('/api/finish-minibatch/' + epochName + '/' + minibatchNumber + '/' + learningTime + '/' + loss)
        let minibatchesMap = waitMap.get(epochName);
        // console.log(minibatchesMap);
        if (minibatchesMap !== undefined) {
            console.log(minibatchesMap[minibatchNumber]);
            if (minibatchesMap[minibatchNumber] !== undefined) {

                let transientData = {
                    'learningTime': Buffer.from(JSON.stringify(learningTime)),
                    'loss': Buffer.from(JSON.stringify(loss)),
                };

                // let repeat = true;
                // do{
                //     console.log('do');
                //     try{
                //         const queryMinibatchAsBytes = await contract.createTransaction('queryMinibatch').submit(epochName, minibatchNumber, org);
                //         console.log('afterQuery');
                //         console.log(queryMinibatchAsBytes);
                //         if(queryMinibatchAsBytes === undefined || queryMinibatchAsBytes.length === 0){
                //             await timer(3000);
                //         }
                //         else{
                //             repeat = false;
                //         }
                //     }
                //     catch(err){
                //         console.log('not found and repeat');
                //         await timer(3000);
                //     }
                // } while(repeat)


                const response = await contract.createTransaction('finishMinibatch').setTransient(transientData).submit(minibatchNumber.toString(), epochName, org);
            }
            else {
                setTimeout(finishMinibatch, 2000, epochName, minibatchNumber, learningTime, loss);
            }
        }
        else {
            setTimeout(finishMinibatch, 2000, epochName, minibatchNumber, learningTime, loss);
        }
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
    }
}

export async function queryEpoch(epochName: string) {
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
        let response = await contract.evaluateTransaction('queryEpoch', epochName)
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

export async function queryMinibatch(epochName, minibatchNumber) {
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
        let transaction = contract.createTransaction('queryMinibatch');
        // const listener = await transaction.addCommitListener((error, transactionId, status, blockNumber) => commitCallBack(error, epochName, minibatchNumber.toString(), transactionId, status, blockNumber));
        let response = await transaction.submit(epochName, minibatchNumber.toString(), org);
        console.log(transaction.getTransactionID(), response.toString());
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
function commitCallBack(event, transactionId?: string | undefined, status?: string | undefined, blockNumber?: number | undefined) {
    let minibatch = <Minibatch>JSON.parse(event.payload.toString());
    if (minibatch.byOrg === org) {
        lock.hold(() => {
            let minibatchesMap = waitMap.get(minibatch.epochName);
            if (minibatchesMap === undefined) {
                minibatchesMap = new Map<string, number>();
            }
            minibatchesMap[minibatch.minibatchNumber] = 1;
            waitMap.set(minibatch.epochName, minibatchesMap);
            lock.release();
        });
        // console.log('===========START commitCallBack==========');
        console.log('commitCallBackEvent', event.payload.toString());
        // console.log('===========END commitCallBack==========');
    }
}

// export async function queryAverageTimeAndLoss(epochName) {
//     try {
//         const wallet = await new FileSystemWallet(walletPath);
//         console.log(`Wallet path: ${walletPath}`);

//         // Check to see if we've already enrolled the user.
//         const identity = await wallet.exists('admin');
//         if (!identity) {
//             console.log('An identity for the user "user1" does not exist in the wallet');
//             console.log('Run the registerUser.ts application before retrying');
//             return;
//         }

//         // Create a new gateway for connecting to our peer node.
//         const gateway = new Gateway();
//         await gateway.connect(ccpPath, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: false } });

//         // Get the network (channel) our contract is deployed to.
//         const network = await gateway.getNetwork('mainchannel');

//         // Get the contract from the network.
//         const contract = network.getContract('chaineuralcc');
//         let response = await contract.createTransaction('queryAverageTimeAndLoss').submit(epochName, org);
//         console.log(response.toString());
//         console.log(`Transaction has been submitted`);
//         // let response = await contract.evaluateTransaction('queryAllPrivateDetails', epochName, org);
//         // console.log(`Transaction has been evaluated, result is: ${response.toString()}`);
//         // Disconnect from the gateway.
//         await gateway.disconnect();
//     } catch (error) {
//         console.error(`Failed to submit transaction: ${error}`);
//         process.exit(1);
//     }
// }

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

export async function queryEpochIsValid(name) {
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
        let response = await contract.createTransaction('queryEpochIsValid').submit(name);
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

function eventError(error) {
    console.info('Failed to receive the chaincode event ::' + error);
}