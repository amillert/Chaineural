/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract } from 'fabric-contract-api';
import { Shim } from 'fabric-shim'
import { Data } from './data';
var logger = Shim.newLogger('ChaineuralLogger');

export class Chaineural extends Contract {
    public async initLedger(ctx: Context) {
        console.info('============= START : Initialize Ledger ===========');
        const data: Data[] = [
            {
                name: 'data1',
                value: '1'
            }
        ];

        for (let i = 0; i < data.length; i++) {
          data[i].docType = 'data';
            await ctx.stub.putState('data' + i, Buffer.from(JSON.stringify(data[i])));
            console.info('Added <--> ', data[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    public async queryData(ctx: Context, dataNumber: string): Promise<string> {
        const dataAsBytes = await ctx.stub.getState(dataNumber); // get the data from chaincode state
        if (!dataAsBytes || dataAsBytes.length === 0) {
            throw new Error(`${dataNumber} does not exist`);
        }
        console.log(dataAsBytes.toString());
        return dataAsBytes.toString();
    }

    public async createData(ctx: Context, name: string, value: string) {
        console.info('============= START : Create data ===========');
        logger.info("===CREATEDATA START===");
        const data: Data = {
            name,
            docType: 'data',
            value,
        };
        
        logger.info('===DATA===');
        logger.info(data);
        console.log(data);
        logger.info('=== LEARNING SIMULATION RESULT: ===');
        let simulationResult = Math.floor(Math.random() * 6) + 1;
        logger.info(simulationResult.toString());
        await ctx.stub.putState(name, Buffer.from(JSON.stringify(data)));
        logger.info("===CREATEDATA END===");
        console.info('============= END : Create Data ===========');
    }

    public async queryAllData(ctx: Context): Promise<string> {
        const startKey = 'DATA0';
        const endKey = 'DATA999';

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
