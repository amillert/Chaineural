import * as chaincodeApi from './libs/chaincode'
import * as channelApi from './libs/channel'

import * as path from 'path';

import * as helper from './libs/helper';

helper.init();
let peers: string[] = ['peer1'];
let chaincodeName: string = 'chaineuralcc4';
let chaincodePath: string = '../../../../../../../chaincode/chaineural/typescript/';
let chaincodeVersion: string = '1.0';

// var result = chaincodeApi.installChaincode(peers, chaincodeName, chaincodePath, chaincodeVersion, '', 'org1')
// console.log(result);
// var result = chaincodeApi.installChaincode(peers, chaincodeName, chaincodePath, chaincodeVersion, '', 'org2')
// console.log(result);
// var result = chaincodeApi.installChaincode(peers, chaincodeName, chaincodePath, chaincodeVersion, '', 'org3')
// console.log(result);
// var result = chaincodeApi.installChaincode(peers, chaincodeName, chaincodePath, chaincodeVersion, '', 'org4')
// console.log(result);
var result1 = channelApi.instantiateChainCode('mychannel', chaincodeName, chaincodeVersion, 'initLedger', [], '', 'org2')
console.log(result1);




