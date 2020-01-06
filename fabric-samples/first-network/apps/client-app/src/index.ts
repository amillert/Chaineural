import * as chaincodeApi from './libs/chaincode'
import * as channelApi from './libs/channel'

import * as path from 'path';

import * as helper from './libs/helper';

helper.init();
let peers: string[] = ['peer1'];
let chaincodeName: string = 'chaineuralcc';
let chaincodePath: string = '/../../../chaineural/typescript';
let chaincodeVersion: string = '1.0';
let channelName: string = 'mainchannel';

start();

async function start(){
    // await installChaincodes();
    // await instantiateChaincode();
    // await queryListChaincode("instantiated");
    // await invokeChaincode();
    await queryChaincode();
}

async function installChaincodes(){
    var result = await chaincodeApi.installChaincode(peers, chaincodeName, chaincodePath, chaincodeVersion, '', 'org1')
    console.log(result);
    var result = await chaincodeApi.installChaincode(peers, chaincodeName, chaincodePath, chaincodeVersion, '', 'org2')
    console.log(result);
    var result = await chaincodeApi.installChaincode(peers, chaincodeName, chaincodePath, chaincodeVersion, '', 'org3')
    console.log(result);
    var result = await chaincodeApi.installChaincode(peers, chaincodeName, chaincodePath, chaincodeVersion, '', 'org4')
    console.log(result);
}

async function instantiateChaincode(){
    var result1 = await channelApi.instantiateChainCode(channelName, chaincodeName, chaincodeVersion, '', [], '', 'org2')
    console.log(result1);
}

async function queryListChaincode(type:string){
    var result = await chaincodeApi.getInstalledChaincodes('peer1', type, '', 'org2');
    console.log(result);
}

async function queryChaincode(){
    var result = await channelApi.queryChaincode('peer1', channelName, chaincodeName,["data6"],'queryData','miron3', 'org2');
    console.log(result);
}

async function invokeChaincode(){
    var result = await channelApi.invokeChaincode([['peer1','org1'],['peer1','org2'],['peer1','org3'],['peer1','org4']], channelName, chaincodeName,'createData',["data6","6"],'miron3', 'org2');
    console.log(result);
}