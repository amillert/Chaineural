"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var chaincodeApi = __importStar(require("./libs/chaincode"));
var channelApi = __importStar(require("./libs/channel"));
var helper = __importStar(require("./libs/helper"));
helper.init();
var peers = ['peer1'];
var chaincodeName = 'chaineuralcc3';
var chaincodePath = '../../../chaincode/chaineural/typescript/';
var chaincodeVersion = '1.0';
var result = chaincodeApi.installChaincode(peers, chaincodeName, chaincodePath, chaincodeVersion, '', 'org1');
console.log(result);
var result = chaincodeApi.installChaincode(peers, chaincodeName, chaincodePath, chaincodeVersion, '', 'org2');
console.log(result);
var result = chaincodeApi.installChaincode(peers, chaincodeName, chaincodePath, chaincodeVersion, '', 'org3');
console.log(result);
var result = chaincodeApi.installChaincode(peers, chaincodeName, chaincodePath, chaincodeVersion, '', 'org4');
console.log(result);
var result1 = channelApi.instantiateChainCode('mychannel', chaincodeName, chaincodeVersion, 'initLedger', [], '', 'org2');
console.log(result1);
//# sourceMappingURL=index.js.map