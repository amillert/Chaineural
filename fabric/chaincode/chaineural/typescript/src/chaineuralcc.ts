import { Context, Contract } from 'fabric-contract-api';
import { Epoch } from './epoch';
import { Minibatch, MinibatchPrivateInfo } from './minibatch';

export class Chaineural extends Contract {
    public async initEpochsLedger(ctx: Context, epochCount: number, miniBatchesAmount: number, org: string) {
        console.info('============= START : Initialize Ledger ===========');
        let epochs: Epoch[] = [];
        for (let i = 0; i < epochCount; i++) {
            const epoch: Epoch = {
                docType: 'epoch',
                epochName: 'epoch' + (i + 1),
                miniBatchesAmount,
                validatedByOrg: []
            };
            epochs.push(epoch);
            await ctx.stub.putState(epoch.epochName, Buffer.from(JSON.stringify(epoch)));
            console.info('Added <--> ', epoch);
        }
        ctx.stub.setEvent('InitEpochsLedgerEvent', Buffer.from(JSON.stringify({ 'epochs': epochs, 'byOrg': org })));
        console.info('============= END : Initialize Ledger ===========');
        return JSON.stringify(epochs);
    }

    public async initMinibatch(ctx: Context, minibatchNumber: number, epochName: string, workerName: string, org: string) {
        console.info('============= START : Initialize Minibatch ===========');
        // ==== Check if epoch already exists ====
        let currentEpochInLedgerAsBytes = await ctx.stub.getState(epochName); // get the data from chaincode state
        if (!currentEpochInLedgerAsBytes || currentEpochInLedgerAsBytes.length === 0) {
            throw new Error(`${epochName} does not exist`);
        }
        let epoch = <Epoch>JSON.parse(currentEpochInLedgerAsBytes.toString());

        const minibatch: Minibatch = {
            docType: 'minibatch',
            minibatchNumber,
            epochName,
            workerName,
            byOrg: org,
            finished: false,
        };
        if (minibatchNumber === epoch.miniBatchesAmount) {
            await ctx.stub.putState(`${minibatch.epochName}-finalMinibatch${minibatch.minibatchNumber}'-'${org}`, Buffer.from(JSON.stringify(minibatch)));
            console.info(`Added final minibatch in ${org}<--> `, minibatch);
            ctx.stub.setEvent('FinalMinibatchEvent', Buffer.from(JSON.stringify(minibatch)));
        }
        else {
            await ctx.stub.putState(minibatch.epochName + '-minibatch' + minibatch.minibatchNumber, Buffer.from(JSON.stringify(minibatch)));
            console.info('Added <--> ', minibatch);
            ctx.stub.setEvent('InitMinibatchEvent', Buffer.from(JSON.stringify(minibatch)));
        }
        console.info('============= END : Initialize Minibatch ===========');
        return JSON.stringify(minibatch);
    }

    public async finishMinibatch(ctx: Context, minibatchNumber: number, epochName: string, org: string) {
        console.info('============= START : Finish Minibatch ===========');
        // ==== Check if epoch already exists ====
        let epochInLedgerAsBytes = await ctx.stub.getState(epochName); // get the data from chaincode state
        if (!epochInLedgerAsBytes || epochInLedgerAsBytes.length === 0) {
            throw new Error(`${epochName} does not exist`);
        }
        let epoch = <Epoch>JSON.parse(epochInLedgerAsBytes.toString());
        let minibatchAsBytes = null;

        if (minibatchNumber === epoch.miniBatchesAmount) {
            minibatchAsBytes = await ctx.stub.getState(`${epochName}-finalMinibatch${minibatchNumber}'-'${org}`);
        } else {
            minibatchAsBytes = await ctx.stub.getState(epochName + '-minibatch' + minibatchNumber);
        }
        if (!minibatchAsBytes || minibatchAsBytes.length === 0) {
            throw new Error(`Minibatch number ${minibatchNumber} for ${epochName} do not exist`);
        }

        let minibatch = <Minibatch>JSON.parse(minibatchAsBytes.toString())
        minibatch.finished = true;
        if (minibatchNumber === epoch.miniBatchesAmount) {
            await ctx.stub.putState(`${epochName}-finalMinibatch${minibatchNumber}'-'${org}`, Buffer.from(JSON.stringify(minibatch)));
            epoch.validatedByOrg.push(org);
        }
        else {
            await ctx.stub.putState(minibatch.epochName + '-minibatch' + minibatch.minibatchNumber, Buffer.from(JSON.stringify(minibatch)));
        }
        const transMap = ctx.stub.getTransient();
        const result = {};
        transMap.forEach((value, key) => {
            result[key] = value.toString();
        });
        let minibatchPrivateInfo: MinibatchPrivateInfo = {
            docType: 'minibatchPrivateInfo',
            minibatchNumber: minibatch.minibatchNumber,
            epochName: minibatch.epochName,
            learningTime: result['learningTime'],
            loss: result['loss']
        }
        const orgCapitalized = org.charAt(0).toUpperCase() + org.slice(1);
        await ctx.stub.putPrivateData('collectionMinibatchesPrivateDetailsFor' + orgCapitalized, minibatch.epochName + '-minibatch' + minibatch.minibatchNumber, Buffer.from(JSON.stringify(minibatchPrivateInfo)));
        ctx.stub.setEvent('FinishMinibatchEvent', Buffer.from(JSON.stringify(minibatch)));
        if (minibatch.minibatchNumber === epoch.miniBatchesAmount) {
            epoch.avgLoss = result['loss'];
            epoch.valid = true;
            epoch.byOrg = org;
            const epochValidIndex = 'epochName~org~value~txId';
            const key = ctx.stub.createCompositeKey(epochValidIndex, [epoch.epochName, org, JSON.stringify(epoch), ctx.stub.getTxID()]);
            await ctx.stub.putState(key, Buffer.from('\u0000'));
        }
        return JSON.stringify(minibatch);
    }

    // tslint:disable-next-line: align
    hasDuplicates(arr) {
        return arr.some(function (item) {
            return arr.indexOf(item) !== arr.lastIndexOf(item);
        });
    }

    public async putTestData(ctx: Context, test: string) {
        await ctx.stub.putState(test, Buffer.from(test)); // get the data from chaincode state
        return "OK";
    }

    public async queryData(ctx: Context, epochName: string): Promise<string> {
        const dataAsBytes = await ctx.stub.getState(epochName); // get the data from chaincode state
        if (!dataAsBytes || dataAsBytes.length === 0) {
            throw new Error(`${epochName} does not exist`);
        }
        return dataAsBytes.toString();
    }

    public async queryEpoch(ctx: Context, epochName: string): Promise<string> {
        const dataAsBytes = await ctx.stub.getState(epochName); // get the data from chaincode state
        if (!dataAsBytes || dataAsBytes.length === 0) {
            throw new Error(`${epochName} does not exist`);
        }
        return dataAsBytes.toString();
    }

    public async queryEpochIsValid(ctx: Context, epochName: string): Promise<boolean> {
        let epochInLedgerAsBytes = await ctx.stub.getState(epochName); // get the data from chaincode state
        if (!epochInLedgerAsBytes || epochInLedgerAsBytes.length === 0) {
            throw new Error(`${epochName} does not exist`);
        }
        let checker = (arr, target) => target.every(v => arr.includes(v));
        let array = [];
        let epochIsValidIterator =
            await ctx.stub.getStateByPartialCompositeKey('epochName~org~value~txId', [epochName])
        while (true) {
            let responseRange = await epochIsValidIterator.next();
            if (!responseRange || !responseRange.value || !responseRange.value.key) {
                break;
            }
            let objectType;
            let attributes;
            ({
                objectType,
                attributes
            } = await ctx.stub.splitCompositeKey(responseRange.value.key));
            const returnedValue = attributes[2];
            array.push(JSON.parse(returnedValue));
        }
        return (array.every(this.isValidEpoch) && array.every(a => a["avgLoss"] === array[0]["avgLoss"])
            && checker(array.map(a => a["byOrg"]),['org1','org2','org3','org4']));
    }

    private isValidEpoch(element, index, array) {
        return (element["valid"] === true);
    }

    


    public async queryMinibatch(ctx: Context, epochName: string, minibatchNumber: number, org: string): Promise < string > {
    const epochAsBytes = await ctx.stub.getState(epochName); // get the data from chaincode state
    if(!epochAsBytes || epochAsBytes.length === 0) {
    throw new Error(`${epochName} does not exist`);
}
let epoch = <Epoch>JSON.parse(epochAsBytes.toString());
let minibatch;
if (epoch.miniBatchesAmount === minibatchNumber) {
    minibatch = await ctx.stub.getState(`${epoch.epochName}-finalMinibatch${minibatchNumber}'-'${org}`); // get the data from chaincode state
    if (!minibatch || minibatch.length === 0) {
        throw new Error(`Minibatch number ${minibatchNumber} for ${epochName} for ${org} do not exist`);
    }
} else {
    minibatch = await ctx.stub.getState(epochName + '-minibatch' + minibatchNumber);
    if (!minibatch || minibatch.length === 0) {
        throw new Error(`Minibatch number ${minibatchNumber} for ${epochName} do not exist`);
    }
}
return minibatch.toString();
    }

    public async queryMinibatchPrivateInfo(ctx: Context, epochName: string, minibatchNumber: number, org: string): Promise < string > {
    const orgCapitalized = org.charAt(0).toUpperCase() + org.slice(1);
    const dataAsBytes = await ctx.stub.getPrivateData('collectionMinibatchesPrivateDetailsFor' + orgCapitalized, epochName + '-minibatch' + minibatchNumber); // get the data from chaincode private collection
    if(!dataAsBytes || dataAsBytes.length === 0) {
    throw new Error(`${epochName} does not exist`);
}
return dataAsBytes.toString();
    }

    public async queryAllData(ctx: Context): Promise < string > {
    const startKey = 'epoch1';
    const endKey = 'epoch999';

    const iterator = await ctx.stub.getStateByRange(startKey, endKey);

    const allResults = [];
    while(true) {
        const res = await iterator.next();

        if (res.value && res.value.value.toString()) {
            console.log(res.value.value.toString());

            const Key = res.value.key;
            let Record;
            try {
                Record = JSON.parse(res.value.value.toString());
            } catch (err) {
                console.log(err);
                Record = res.value.value.toString();
            }
            allResults.push({ Key, Record });
        }
        if (res.done) {
            console.log('end of data');
            await iterator.close();
            console.info(allResults);
            return JSON.stringify(allResults);
        }
    }
}
    public async queryAverageTimeAndLossWithoutEvent(ctx: Context, epochName: string, org: string): Promise < string > {
        const epochAsBytes = await ctx.stub.getState(epochName); // get the data from chaincode state
    if(!epochAsBytes || epochAsBytes.length === 0) {
    throw new Error(`${epochName} does not exist`);
}
let epoch = <Epoch>JSON.parse(epochAsBytes.toString());
const orgCapitalized = org.charAt(0).toUpperCase() + org.slice(1);
let allResults: MinibatchPrivateInfo[] = [];
for (let i = 1; i <= epoch.miniBatchesAmount; i++) {
    const privateDetailsMinibatchAsBytes = await ctx.stub.getPrivateData('collectionMinibatchesPrivateDetailsFor' + orgCapitalized, epochName + '-minibatch' + i);
    if (privateDetailsMinibatchAsBytes && privateDetailsMinibatchAsBytes.length !== 0) {
        let privateDetails = JSON.parse(privateDetailsMinibatchAsBytes.toString());
        allResults.push(privateDetails);
    }
}
const sumLearningTime = allResults.map(a => parseFloat(a.learningTime.toString().replace('"', ''))).reduce((a, b) => a + b, 0);
const avgLearningTime = (sumLearningTime / allResults.length) || 0;
const sumLoss = allResults.map(a => (parseFloat(a.loss.toString().replace('"', '')))).reduce((a, b) => a + b, 0);
const avgLoss = (sumLoss / allResults.length) || 0;
let result = {
    'avgLearningTime': avgLearningTime,
    'avgLoss': avgLoss
}
console.log(`The sum is: ${result.avgLearningTime}. The average is: ${result.avgLoss}.`);
return JSON.stringify(result);
    }

    public async queryAverageTimeAndLoss(ctx: Context, epochName: string, org: string): Promise < string > {
        const epochAsBytes = await ctx.stub.getState(epochName); // get the data from chaincode state
    if(!epochAsBytes || epochAsBytes.length === 0) {
    throw new Error(`${epochName} does not exist`);
}
let epoch = <Epoch>JSON.parse(epochAsBytes.toString());
const orgCapitalized = org.charAt(0).toUpperCase() + org.slice(1);
let allResults: MinibatchPrivateInfo[] = [];
for (let i = 1; i <= epoch.miniBatchesAmount; i++) {
    const privateDetailsMinibatchAsBytes = await ctx.stub.getPrivateData('collectionMinibatchesPrivateDetailsFor' + orgCapitalized, epochName + '-minibatch' + i);
    if (privateDetailsMinibatchAsBytes && privateDetailsMinibatchAsBytes.length !== 0) {
        let privateDetails = JSON.parse(privateDetailsMinibatchAsBytes.toString());
        allResults.push(privateDetails);
    }
}
const sumLearningTime = allResults.map(a => parseFloat(a.learningTime.toString().replace('"', ''))).reduce((a, b) => a + b, 0);
const avgLearningTime = (sumLearningTime / allResults.length) || 0;
const sumLoss = allResults.map(a => (parseFloat(a.loss.toString().replace('"', '')))).reduce((a, b) => a + b, 0);
const avgLoss = (sumLoss / allResults.length) || 0;
let result = {
    'avgLearningTime': avgLearningTime,
    'avgLoss': avgLoss
}
console.log(`The sum is: ${result.avgLearningTime}. The average is: ${result.avgLoss}.`);
ctx.stub.setEvent('EpochAveragesEvent', Buffer.from(JSON.stringify(result)));
return JSON.stringify(result);
    }
    //for cleaning all data (only for tests)
    public async deleteAllData(ctx: Context): Promise < string > {
    //all epochs
    for(let i = 0; i < 20; i++) {
    ctx.stub.deleteState('epoch' + i);
}
//all minibatches
for (let i = 0; i < 20; i++) {
    for (let j = 0; j < 1000; j++) {
        ctx.stub.deleteState('epoch' + i + '-minibatch' + j);
    }
}
for (let i = 0; i < 20; i++) {
    for (let y = 0; y < 5; y++) {
        ctx.stub.deleteState('epoch' + i + '-finalMinibatch' + 1000 + '-org' + y);
    }
}
return 'OK';
    }
}
