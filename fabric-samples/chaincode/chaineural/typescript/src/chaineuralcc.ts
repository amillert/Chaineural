/*
 * SPDX-License-Identifier: Apache-2.0
 */
import { Context, Contract } from 'fabric-contract-api';
import { Shim } from 'fabric-shim';
import { Epoch } from './epoch';
import { Minibatch, MinibatchPrivateInfo } from './minibatch';
import { AkkaCommunicationNode } from './akka-communication-node';
var logger = Shim.newLogger('ChaineuralLogger');

export class Chaineural extends Contract {
    public async initEpochsLedger(ctx: Context, epochCount: number, miniBatchesAmount: number) {
        console.info('============= START : Initialize Ledger ===========');
        let epochs: Epoch[] = [];
        for (let i = 0; i < epochCount; i++) {
            const epoch: Epoch = {
                docType: 'epoch',
                epochName: 'epoch' + (i + 1),
                miniBatchesAmount,
                valid: false,
                validatedByOrg: [],
                loss: -1,
            };
            epochs.push(epoch);
            await ctx.stub.putState(epoch.epochName, Buffer.from(JSON.stringify(epoch)));
            console.info('Added <--> ', epoch);
        }
        ctx.stub.setEvent('InitEpochsLedgerEvent', Buffer.from(JSON.stringify(epochs)));
        console.info('============= END : Initialize Ledger ===========');
        return JSON.stringify(epochs);
    }

    // public async setAkkaCommunicationNode(ctx: Context, name: string, endpoint: string, org: string) {
    //     console.info('============= START : Set Akka Communication Node ===========');
    //     const minibatch: AkkaCommunicationNode = {
    //         docType: 'akkaCommunicationNode',
    //         name,
    //         endpoint,
    //         org,
    //     };

    //     const orgCapitalized = org.charAt(0).toUpperCase() + org.slice(1);
    //     await ctx.stub.putPrivateData('collectionMinibatchesPrivateDetailsFor' + orgCapitalized, 'akkaCommunicationNode-' + name, Buffer.from(JSON.stringify(minibatch)));
    //     console.info('Added <--> ', epochs);
    //     ctx.stub.setEvent('InitEpochsLedgerEvent', Buffer.from(JSON.stringify(epochs)));
    //     console.info('============= END : Set Akka Communication Node ===========');
    // }

    public async initMinibatch(ctx: Context, minibatchNumber: number, epochName: string, workerName: string, org: string) {
        console.info('============= START : Initialize Minibatch ===========');
        // ==== Check if epoch already exists ====
        let currentEpochInLedgerAsBytes = await ctx.stub.getState(epochName); // get the data from chaincode state
        if (!currentEpochInLedgerAsBytes || currentEpochInLedgerAsBytes.length === 0) {
            throw new Error(`${epochName} does not exist`);
        }
        let epoch = <Epoch>JSON.parse(currentEpochInLedgerAsBytes.toString());
        // ==== Check if minibatch already exists ====
        let minibatchAsBytes = await ctx.stub.getState(epochName + '-minibatch' + minibatchNumber);
        if (minibatchAsBytes && minibatchAsBytes.length !== 0) {
            throw new Error(`Minibatch number ${minibatchNumber} for ${epochName} already exists`);
        }

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
        // ==== Check if minibatch already exists ====
        let minibatchAsBytes;
        if (minibatchNumber === epoch.miniBatchesAmount) {
            minibatchAsBytes = await ctx.stub.getState(`${epochName}-finalMinibatch${minibatchNumber}'-'${org}`);
        } else {
            minibatchAsBytes = await ctx.stub.getState(epochName + '-minibatch' + minibatchNumber);
        }
        if (!minibatchAsBytes && minibatchAsBytes.length === 0) {
            throw new Error(`Minibatch number ${minibatchNumber} for ${epochName} do not exist`);
        }

        console.log(JSON.parse(minibatchAsBytes.toString()));
        let minibatch = <Minibatch>JSON.parse(minibatchAsBytes.toString())
        if (minibatch.finished) {
            throw new Error(`Minibatch number ${minibatchNumber} for ${epochName} was finished before`);
        }
        minibatch.finished = true;
        if (minibatchNumber === epoch.miniBatchesAmount) {
            await ctx.stub.putState(`${epochName}-finalMinibatch${minibatchNumber}'-'${org}`, Buffer.from(JSON.stringify(minibatch)));
            epoch.validatedByOrg.push(org);
            await ctx.stub.putState(epochName, Buffer.from(JSON.stringify(epoch)));
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
        await ctx.stub.putPrivateData('collectionMinibatchesPrivateDetailsFor' + orgCapitalized, minibatch.epochName + '-minibatch' + minibatch.minibatchNumber + '-private', Buffer.from(JSON.stringify(minibatchPrivateInfo)));
        console.info('Added private data<--> ', minibatch);
        ctx.stub.setEvent('finishMinibatchEvent', Buffer.from(JSON.stringify(minibatch)));
        console.info('============= END : Finish Minibatch ===========');
        if (minibatch.minibatchNumber === epoch.miniBatchesAmount) {
            console.info('============= START : Finalize Epoch ===========');
            if (epoch.validatedByOrg.length === 4 && !this.hasDuplicates(epoch.validatedByOrg)) {
                epoch.valid = true;
                await ctx.stub.putState(epoch.epochName, Buffer.from(JSON.stringify(epoch)));
                console.info('Epoch is valid <--> ', epoch);
                ctx.stub.setEvent('EpochIsValidEvent', Buffer.from(JSON.stringify(epoch)));
            }
            console.info('============= END : Finalize Epoch ===========');
        }
        return JSON.stringify(minibatch);
    }

    // tslint:disable-next-line: align
    hasDuplicates(arr) {
        return arr.some(function(item) {
            return arr.indexOf(item) !== arr.lastIndexOf(item);
        });
    }

    public async queryData(ctx: Context, epochName: string): Promise<string> {
        const dataAsBytes = await ctx.stub.getState(epochName); // get the data from chaincode state
        if (!dataAsBytes || dataAsBytes.length === 0) {
            throw new Error(`${epochName} does not exist`);
        }
        console.log(dataAsBytes.toString());
        return dataAsBytes.toString();
    }

    public async queryEpoch(ctx: Context, epochName: string): Promise<string> {
        const dataAsBytes = await ctx.stub.getState(epochName); // get the data from chaincode state
        if (!dataAsBytes || dataAsBytes.length === 0) {
            throw new Error(`${epochName} does not exist`);
        }
        console.log(dataAsBytes.toString());
        return dataAsBytes.toString();
    }

    public async queryMinibatch(ctx: Context, epochName: string, minibatchNumber: number, org:string): Promise<string> {
        const epochAsBytes = await ctx.stub.getState(epochName); // get the data from chaincode state
        if (!epochAsBytes || epochAsBytes.length === 0) {
            throw new Error(`${epochName} does not exist`);
        }
        let epoch = <Epoch>JSON.parse(epochAsBytes.toString());
        let minibatch;
        if(epoch.miniBatchesAmount === minibatchNumber){
            minibatch = await ctx.stub.getState(`${epoch.epochName}-finalMinibatch${minibatchNumber}'-'${org}`); // get the data from chaincode state
            if (!minibatch || minibatch.length === 0) {
                throw new Error(`Minibatch number ${minibatchNumber} for ${epochName} for ${org} do not exist`);
            }
        } else{
            minibatch = await ctx.stub.getState(epochName + '-minibatch' + minibatchNumber);
            if (!minibatch || minibatch.length === 0) {
                throw new Error(`Minibatch number ${minibatchNumber} for ${epochName} do not exist`);
            }
        }
        console.log(minibatch.toString());
        return minibatch.toString();
    }

    public async queryMinibatchPrivateInfo(ctx: Context, epochName: string, minibatchNumber: number, org: string): Promise<string> {
        const orgCapitalized = org.charAt(0).toUpperCase() + org.slice(1);
        const dataAsBytes = await ctx.stub.getPrivateData('collectionMinibatchesPrivateDetailsFor' + orgCapitalized, epochName + '-minibatch' + minibatchNumber + '-private'); // get the data from chaincode private collection
        if (!dataAsBytes || dataAsBytes.length === 0) {
            throw new Error(`${epochName} does not exist`);
        }
        console.log(dataAsBytes.toString());
        return dataAsBytes.toString();
    }
    // public async createData(ctx: Context, name: string, value: string) {
    //     console.info('============= START : Create data ===========');
    //     logger.info("===CREATEDATA START===");
    //     const data: Data = {
    //         name,
    //         docType: 'data',
    //         value,
    //     };
    //     logger.info('=== PUT STATE: ===');
    //     await ctx.stub.putState(name, Buffer.from(JSON.stringify(data)));
    //     let creator = await ctx.stub.getCreator();
    //     logger.info('===getCreator()===');
    //     logger.info(creator.mspid);
    //     logger.info(creator.idBytes);
    //     logger.info('===DATA===');
    //     logger.info(data);
    //     console.info(data);
    //     logger.info('=== LEARNING SIMULATION RESULT: ===');
    //     let simulationResult = Math.floor(Math.random() * 6) + 1;
    //     logger.info(simulationResult.toString());
    //     const dataPrivateDetails: DataPrivateDetails = {
    //         name,
    //         docType: 'dataPrivateDetails',
    //         simulationResult
    //     }
    //     logger.info(dataPrivateDetails);
    //     // logger.info('=== PUT PRIVATE DATA: collectionLearningWeightsPrivateDetailsForOrg1MSP ===');
    //     // await ctx.stub.putPrivateData("collectionLearningWeightsPrivateDetailsForOrg1MSP", name, Buffer.from(JSON.stringify(dataPrivateDetails)));
    //     // logger.info('=== PUT PRIVATE DATA: collectionLearningWeightsPrivateDetailsForOrg2MSP ===');
    //     // await ctx.stub.putPrivateData("collectionLearningWeightsPrivateDetailsForOrg2MSP", name, Buffer.from(JSON.stringify(dataPrivateDetails)));
    //     // logger.info('=== PUT PRIVATE DATA: collectionLearningWeightsPrivateDetailsForOrg3MSP ===');
    //     // await ctx.stub.putPrivateData("collectionLearningWeightsPrivateDetailsForOrg3MSP", name, Buffer.from(JSON.stringify(dataPrivateDetails)));
    //     // logger.info('=== PUT PRIVATE DATA: collectionLearningWeightsPrivateDetailsForOrg4MSP ===');
    //     // await ctx.stub.putPrivateData("collectionLearningWeightsPrivateDetailsForOrg4MSP", name, Buffer.from(JSON.stringify(dataPrivateDetails)));
    //     logger.info("===CREATEDATA END===");
    //     console.info('============= END : Create Data ===========');
    // }

    // public async getPrivateData(ctx: Context, name: string) {
    //     console.info('============= START : getPrivateData ===========');
    //     logger.info("===getPrivateData START===");
    //     var data = await ctx.stub.getState(name);
    //     var creator = await ctx.stub.getCreator();
    //     logger.info("===DATA OBJECT===");
    //     logger.info(data);
    //     logger.info('=== GET PRIVATE DATA: collectionLearningWeightsPrivateDetailsFor' +  creator.mspid + ' ===');
    //     var dataPrivateDetailsAsBytes = await ctx.stub.getPrivateData("collectionLearningWeightsPrivateDetailsFor" +  creator.mspid, name);
    //     console.info(dataPrivateDetailsAsBytes.toString());
    //     logger.info("===getPrivateData END===");
    //     console.info('============= END : getPrivateData ===========');
    // }

    public async queryAllData(ctx: Context): Promise<string> {
        const startKey = 'epoch1';
        const endKey = 'epoch999';

        const iterator = await ctx.stub.getStateByRange(startKey, endKey);

        const allResults = [];
        while (true) {
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

    public async queryAllPrivateDetails(ctx: Context, epochName: string, org: string): Promise<string> {
        const startKey = epochName + '-minibatch1';
        const endKey = epochName + '-minibatch9999';
        const orgCapitalized = org.charAt(0).toUpperCase() + org.slice(1);
        const iterator = await ctx.stub.getPrivateDataByRange('collectionMinibatchesPrivateDetailsFor' + orgCapitalized, startKey, endKey);

        const allResults = [];
        while (true) {
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
    // public async changeCarOwner(ctx: Context, carNumber: string, newOwner: string) {
    //     console.info('============= START : changeCarOwner ===========');

    //     const carAsBytes = await ctx.stub.getState(carNumber); // get the car from chaincode state
    //     if (!carAsBytes || carAsBytes.length === 0) {
    //         throw new Error(`${carNumber} does not exist`);
    //     }
    //     const car: Car = JSON.parse(carAsBytes.toString());
    //     car.owner = newOwner;

    //     await ctx.stub.putState(carNumber, Buffer.from(JSON.stringify(car)));
    //     console.info('============= END : changeCarOwner ===========');
    // }

}
