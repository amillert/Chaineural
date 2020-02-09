"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fabric_network_1 = require("fabric-network");
var path = __importStar(require("path"));
var org = process.env.ORG;
var ccpPath = path.resolve(__dirname, "./../connection-" + org + ".json");
var walletPath = path.resolve(__dirname, "./../wallet/" + org);
console.log('org');
console.log(org);
console.log('__dirname');
console.log(__dirname);
var timeMapForTests = new Map();
var timeArrayDiff = [];
var contract;
var waitMap = new Map();
var results = [];
var Lock = /** @class */ (function () {
    function Lock(counter) {
        this.counter = counter; // how many users can use the resource at one, set 1 for regular lock 
        this.waiters = []; // all the callback that are waiting to use the resource
    }
    Lock.prototype.hold = function (cb) {
        if (this.counter > 0) { // there is no one wating for the resource
            this.counter--; // update the resource is in usage
            cb(); // fire the requested callback
        }
        else {
            this.waiters.push(cb); // the resoucre is in usage you need to wait for it
        }
    };
    Lock.prototype.release = function () {
        if (this.waiters.length > 0) { // some one released the lock - so we need to see who is wating and fire it
            var cb_1 = this.waiters.pop(); // get the latest request for the lock
            // select the relevent one
            process.nextTick(cb_1); // if you are on node
            setTimeout(function () { return cb_1; }, 0); // if you are in the browser
        }
        else {
            this.counter++;
        }
    };
    return Lock;
}());
var lock = new Lock(1);
initClient();
function initClient() {
    return __awaiter(this, void 0, void 0, function () {
        var wallet, identity, gateway, network, orgCapitalized, eventHubs, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    console.log('/api/init-client/');
                    return [4 /*yield*/, new fabric_network_1.FileSystemWallet(walletPath)];
                case 1:
                    wallet = _a.sent();
                    return [4 /*yield*/, wallet.exists('admin')];
                case 2:
                    identity = _a.sent();
                    if (!identity) {
                        console.log('An identity for the user "user1" does not exist in the wallet');
                        console.log('Run the registerUser.ts application before retrying');
                        return [2 /*return*/];
                    }
                    gateway = new fabric_network_1.Gateway();
                    // Create a new gateway for connecting to our peer node.
                    return [4 /*yield*/, gateway.connect(ccpPath, { wallet: wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: false } })];
                case 3:
                    // Create a new gateway for connecting to our peer node.
                    _a.sent();
                    return [4 /*yield*/, gateway.getNetwork('mainchannel')];
                case 4:
                    network = _a.sent();
                    // Get the contract from the network.
                    contract = network.getContract('chaineuralcc');
                    orgCapitalized = org.charAt(0).toUpperCase() + org.slice(1);
                    eventHubs = network.getChannel().getChannelEventHubsForOrg(orgCapitalized + 'MSP');
                    eventHubs.forEach(function (eh) {
                        eh.getName();
                        eh.registerChaincodeEvent('chaineuralcc', 'InitMinibatchEvent', function (event, block_num, tx, status) { return commitCallBack(event, tx, status, block_num); }, function (error) { return eventError(error); });
                        eh.registerChaincodeEvent('chaineuralcc', 'FinalMinibatchEvent', function (event, block_num, tx, status) { return commitCallBack(event, tx, status, block_num); }, function (error) { return eventError(error); });
                        eh.connect(true);
                    });
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _a.sent();
                    console.error("Failed to submit transaction: " + error_1);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.initClient = initClient;
function initMinibatch(epochName, minibatchNumber, workerName) {
    return __awaiter(this, void 0, void 0, function () {
        var transaction, response, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    console.log('/api/init-minibatch/' + epochName + '/' + minibatchNumber + '/' + workerName);
                    transaction = contract.createTransaction('initMinibatch');
                    return [4 /*yield*/, transaction.submit(minibatchNumber.toString(), epochName, workerName, org)];
                case 1:
                    response = _a.sent();
                    console.log(response.toString(), "Transaction has been submitted");
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error("Failed to submit transaction: " + error_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.initMinibatch = initMinibatch;
function finishMinibatch(epochName, minibatchNumber, learningTime, loss) {
    return __awaiter(this, void 0, void 0, function () {
        var minibatchesMap, transientData, response, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    console.log('/api/finish-minibatch/' + epochName + '/' + minibatchNumber + '/' + learningTime + '/' + loss);
                    minibatchesMap = waitMap.get(epochName);
                    if (!(minibatchesMap !== undefined)) return [3 /*break*/, 4];
                    console.log(minibatchesMap[minibatchNumber]);
                    if (!(minibatchesMap[minibatchNumber] !== undefined)) return [3 /*break*/, 2];
                    transientData = {
                        'learningTime': Buffer.from(JSON.stringify(learningTime)),
                        'loss': Buffer.from(JSON.stringify(loss)),
                    };
                    return [4 /*yield*/, contract.createTransaction('finishMinibatch').setTransient(transientData).submit(minibatchNumber.toString(), epochName, org)];
                case 1:
                    response = _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    setTimeout(finishMinibatch, 2000, epochName, minibatchNumber, learningTime, loss);
                    _a.label = 3;
                case 3: return [3 /*break*/, 5];
                case 4:
                    setTimeout(finishMinibatch, 2000, epochName, minibatchNumber, learningTime, loss);
                    _a.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_3 = _a.sent();
                    console.error("Failed to submit transaction: " + error_3);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
exports.finishMinibatch = finishMinibatch;
function queryEpoch(epochName) {
    return __awaiter(this, void 0, void 0, function () {
        var wallet, identity, gateway, network, contract_1, response, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    return [4 /*yield*/, new fabric_network_1.FileSystemWallet(walletPath)];
                case 1:
                    wallet = _a.sent();
                    console.log("Wallet path: " + walletPath);
                    return [4 /*yield*/, wallet.exists('admin')];
                case 2:
                    identity = _a.sent();
                    if (!identity) {
                        console.log('An identity for the user "user1" does not exist in the wallet');
                        console.log('Run the registerUser.ts application before retrying');
                        return [2 /*return*/];
                    }
                    gateway = new fabric_network_1.Gateway();
                    return [4 /*yield*/, gateway.connect(ccpPath, { wallet: wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: false } })];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, gateway.getNetwork('mainchannel')];
                case 4:
                    network = _a.sent();
                    contract_1 = network.getContract('chaineuralcc');
                    return [4 /*yield*/, contract_1.evaluateTransaction('queryEpoch', epochName)];
                case 5:
                    response = _a.sent();
                    console.log(response.toString());
                    console.log("Transaction has been submitted");
                    // let response = await contract.evaluateTransaction('queryAllPrivateDetails', epochName, org);
                    // console.log(`Transaction has been evaluated, result is: ${response.toString()}`);
                    // Disconnect from the gateway.
                    return [4 /*yield*/, gateway.disconnect()];
                case 6:
                    // let response = await contract.evaluateTransaction('queryAllPrivateDetails', epochName, org);
                    // console.log(`Transaction has been evaluated, result is: ${response.toString()}`);
                    // Disconnect from the gateway.
                    _a.sent();
                    return [3 /*break*/, 8];
                case 7:
                    error_4 = _a.sent();
                    console.error("Failed to submit transaction: " + error_4);
                    process.exit(1);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
exports.queryEpoch = queryEpoch;
function queryMinibatch(epochName, minibatchNumber) {
    return __awaiter(this, void 0, void 0, function () {
        var wallet, identity, gateway, network, contract_2, transaction, response, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    return [4 /*yield*/, new fabric_network_1.FileSystemWallet(walletPath)];
                case 1:
                    wallet = _a.sent();
                    console.log("Wallet path: " + walletPath);
                    return [4 /*yield*/, wallet.exists('admin')];
                case 2:
                    identity = _a.sent();
                    if (!identity) {
                        console.log('An identity for the user "user1" does not exist in the wallet');
                        console.log('Run the registerUser.ts application before retrying');
                        return [2 /*return*/];
                    }
                    gateway = new fabric_network_1.Gateway();
                    return [4 /*yield*/, gateway.connect(ccpPath, { wallet: wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: false } })];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, gateway.getNetwork('mainchannel')];
                case 4:
                    network = _a.sent();
                    contract_2 = network.getContract('chaineuralcc');
                    transaction = contract_2.createTransaction('queryMinibatch');
                    return [4 /*yield*/, transaction.submit(epochName, minibatchNumber.toString(), org)];
                case 5:
                    response = _a.sent();
                    console.log(transaction.getTransactionID(), response.toString());
                    console.log("Transaction has been submitted");
                    // let response = await contract.evaluateTransaction('queryAllPrivateDetails', epochName, org);
                    // console.log(`Transaction has been evaluated, result is: ${response.toString()}`);
                    // Disconnect from the gateway.
                    return [4 /*yield*/, gateway.disconnect()];
                case 6:
                    // let response = await contract.evaluateTransaction('queryAllPrivateDetails', epochName, org);
                    // console.log(`Transaction has been evaluated, result is: ${response.toString()}`);
                    // Disconnect from the gateway.
                    _a.sent();
                    return [3 /*break*/, 8];
                case 7:
                    error_5 = _a.sent();
                    console.error("Failed to submit transaction: " + error_5);
                    process.exit(1);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
exports.queryMinibatch = queryMinibatch;
// let i = 0;
function commitCallBack(event, transactionId, status, blockNumber) {
    var minibatch = JSON.parse(event.payload.toString());
    // ======== FOR TESTS PURPOSES ======
    // var end = +new Date();  // log end timestamp
    // i++;
    // console.log('which minibatch');
    // console.log(i);
    // if (i === txsCountglob * 2) {
    //     var diff = end - start;
    //     console.log('diff');
    //     console.log(diff);
    //     results.push(diff);
    //     process.exit(1);
    // }
    if (minibatch.byOrg === org) {
        lock.hold(function () {
            var minibatchesMap = waitMap.get(minibatch.epochName);
            if (minibatchesMap === undefined) {
                minibatchesMap = new Map();
            }
            minibatchesMap[minibatch.minibatchNumber] = 1;
            waitMap.set(minibatch.epochName, minibatchesMap);
            lock.release();
        });
        // console.log('===========START commitCallBack==========');
        // console.log('commitCallBackEvent', event.payload.toString());
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
function deleteAllData(org) {
    return __awaiter(this, void 0, void 0, function () {
        var wallet, identity, gateway, network, contract_3, response, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    return [4 /*yield*/, new fabric_network_1.FileSystemWallet(walletPath)];
                case 1:
                    wallet = _a.sent();
                    console.log("Wallet path: " + walletPath);
                    return [4 /*yield*/, wallet.exists('admin')];
                case 2:
                    identity = _a.sent();
                    if (!identity) {
                        console.log('An identity for the user "user1" does not exist in the wallet');
                        console.log('Run the registerUser.ts application before retrying');
                        return [2 /*return*/];
                    }
                    gateway = new fabric_network_1.Gateway();
                    return [4 /*yield*/, gateway.connect(ccpPath, { wallet: wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: false } })];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, gateway.getNetwork('mainchannel')];
                case 4:
                    network = _a.sent();
                    contract_3 = network.getContract('chaineuralcc');
                    return [4 /*yield*/, contract_3.createTransaction('deleteAllData').submit()];
                case 5:
                    response = _a.sent();
                    console.log(response.toString());
                    console.log("Transaction has been submitted");
                    // let response = await contract.evaluateTransaction('queryAllPrivateDetails', epochName, org);
                    // console.log(`Transaction has been evaluated, result is: ${response.toString()}`);
                    // Disconnect from the gateway.
                    return [4 /*yield*/, gateway.disconnect()];
                case 6:
                    // let response = await contract.evaluateTransaction('queryAllPrivateDetails', epochName, org);
                    // console.log(`Transaction has been evaluated, result is: ${response.toString()}`);
                    // Disconnect from the gateway.
                    _a.sent();
                    return [3 /*break*/, 8];
                case 7:
                    error_6 = _a.sent();
                    console.error("Failed to submit transaction: " + error_6);
                    process.exit(1);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
exports.deleteAllData = deleteAllData;
function putTestData(test) {
    return __awaiter(this, void 0, void 0, function () {
        var wallet, identity, gateway, network, contract_4, response, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    console.log('putTestData');
                    return [4 /*yield*/, new fabric_network_1.FileSystemWallet(walletPath)];
                case 1:
                    wallet = _a.sent();
                    console.log("Wallet path: " + walletPath);
                    return [4 /*yield*/, wallet.exists('admin')];
                case 2:
                    identity = _a.sent();
                    if (!identity) {
                        console.log('An identity for the user "user1" does not exist in the wallet');
                        console.log('Run the registerUser.ts application before retrying');
                        return [2 /*return*/];
                    }
                    gateway = new fabric_network_1.Gateway();
                    return [4 /*yield*/, gateway.connect(ccpPath, { wallet: wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: false } })];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, gateway.getNetwork('mainchannel')];
                case 4:
                    network = _a.sent();
                    contract_4 = network.getContract('chaineuralcc');
                    return [4 /*yield*/, contract_4.createTransaction('putTestData').submit(test)];
                case 5:
                    response = _a.sent();
                    console.log(response.toString());
                    console.log("Transaction has been submitted");
                    // let response = await contract.evaluateTransaction('queryAllPrivateDetails', epochName, org);
                    // console.log(`Transaction has been evaluated, result is: ${response.toString()}`);
                    // Disconnect from the gateway.
                    return [4 /*yield*/, gateway.disconnect()];
                case 6:
                    // let response = await contract.evaluateTransaction('queryAllPrivateDetails', epochName, org);
                    // console.log(`Transaction has been evaluated, result is: ${response.toString()}`);
                    // Disconnect from the gateway.
                    _a.sent();
                    return [3 /*break*/, 8];
                case 7:
                    error_7 = _a.sent();
                    console.error("Failed to submit transaction: " + error_7);
                    process.exit(1);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
exports.putTestData = putTestData;
function queryEpochIsValid(name) {
    return __awaiter(this, void 0, void 0, function () {
        var wallet, identity, gateway, network, contract_5, response, error_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    console.log('putTestData');
                    return [4 /*yield*/, new fabric_network_1.FileSystemWallet(walletPath)];
                case 1:
                    wallet = _a.sent();
                    console.log("Wallet path: " + walletPath);
                    return [4 /*yield*/, wallet.exists('admin')];
                case 2:
                    identity = _a.sent();
                    if (!identity) {
                        console.log('An identity for the user "user1" does not exist in the wallet');
                        console.log('Run the registerUser.ts application before retrying');
                        return [2 /*return*/];
                    }
                    gateway = new fabric_network_1.Gateway();
                    return [4 /*yield*/, gateway.connect(ccpPath, { wallet: wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: false } })];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, gateway.getNetwork('mainchannel')];
                case 4:
                    network = _a.sent();
                    contract_5 = network.getContract('chaineuralcc');
                    return [4 /*yield*/, contract_5.createTransaction('queryEpochIsValid').submit(name)];
                case 5:
                    response = _a.sent();
                    console.log(response.toString());
                    console.log("Transaction has been submitted");
                    // let response = await contract.evaluateTransaction('queryAllPrivateDetails', epochName, org);
                    // console.log(`Transaction has been evaluated, result is: ${response.toString()}`);
                    // Disconnect from the gateway.
                    return [4 /*yield*/, gateway.disconnect()];
                case 6:
                    // let response = await contract.evaluateTransaction('queryAllPrivateDetails', epochName, org);
                    // console.log(`Transaction has been evaluated, result is: ${response.toString()}`);
                    // Disconnect from the gateway.
                    _a.sent();
                    return [3 /*break*/, 8];
                case 7:
                    error_8 = _a.sent();
                    console.error("Failed to submit transaction: " + error_8);
                    process.exit(1);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
exports.queryEpochIsValid = queryEpochIsValid;
function eventError(error) {
    console.info('Failed to receive the chaincode event ::' + error);
}
// ======== FOR TESTS PURPOSES ======
// var start;
// var txsCountglob;
// export async function testTPS(epochName, txsCount) {
//     console.log('testTPS')
//     console.log(txsCount)
//     txsCountglob = txsCount;
//     console.log(txsCountglob)
//     for (let y = 0; y < 10; y++) {
//         i = 0;
//         console.log('b')
//         start = +new Date();
//         for (let i = 0; i < txsCount; i++) {
//             console.log('a')
//             initMinibatch(epochName, i, 'workerName');
//         }
//         console.log(results);
//         await delay(200000);
//     }
//     var sum = 0;
//     for (var i = 0; i < results.length; i++) {
//         sum += parseInt(results[i]); //don't forget to add the base
//     }
//     var avg = sum / results.length;
// }
// function delay(ms: number) {
//     return new Promise( resolve => setTimeout(resolve, ms) );
// }
//# sourceMappingURL=invoke.js.map