/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract } from 'fabric-contract-api';
import { Shim } from 'fabric-shim'
import { Epoch } from './epoch';
import { EpochPrivateDetails } from './epoch-private-details';
var logger = Shim.newLogger('ChaineuralLogger');

export class Chaineural extends Contract {
    public async initEpochsLedger(ctx: Context, epochCount: number) {
        console.info('============= START : Initialize Ledger ===========');
        let epochs: Epoch[] = [];
        for (let i = 0; i < epochCount; i++) {
          const epoch: Epoch = {
            docType: 'epoch',
            epochName: 'epoch' + i,
            valid: false,
            loss: -1,
          };
          epochs.push(epoch);
          await ctx.stub.putState(epoch.epochName, Buffer.from(JSON.stringify(epoch)));
          console.info('Added <--> ', epoch);
        }
        ctx.stub.setEvent('InitEpochsLedgerEvent', Buffer.from(JSON.stringify(epochs)));
        console.info('============= END : Initialize Ledger ===========');
    }

    public async queryData(ctx: Context, epochName: string): Promise<string> {
        const dataAsBytes = await ctx.stub.getState(epochName); // get the data from chaincode state
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
