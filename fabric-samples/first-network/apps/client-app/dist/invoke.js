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
// == init ==
var org = 'org2';
var epochName = 'epoch8';
var minibatchNumber = 1000;
var workerName = 'worker1';
// == finish ==
var learningTime = '3sec';
var loss = 0.123;
var ccpPath = path.resolve(__dirname, "../../../connection-" + org + ".json");
function initMinibatch() {
    return __awaiter(this, void 0, void 0, function () {
        var walletPath, wallet, identity, gateway, network, contract, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    walletPath = path.join(__dirname, "../../wallet/" + org);
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
                    // Create a new gateway for connecting to our peer node.
                    console.log("1");
                    gateway = new fabric_network_1.Gateway();
                    console.log("2");
                    return [4 /*yield*/, gateway.connect(ccpPath, { wallet: wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: true } })];
                case 3:
                    _a.sent();
                    console.log("3");
                    return [4 /*yield*/, gateway.getNetwork('mainchannel')];
                case 4:
                    network = _a.sent();
                    console.log("4");
                    contract = network.getContract('chaineuralcc');
                    console.log("5");
                    return [4 /*yield*/, contract.createTransaction('initMinibatch').submit(minibatchNumber.toString(), epochName, workerName, org)];
                case 5:
                    _a.sent();
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
                    error_1 = _a.sent();
                    console.error("Failed to submit transaction: " + error_1);
                    process.exit(1);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
function finishMinibatch() {
    return __awaiter(this, void 0, void 0, function () {
        var walletPath, wallet, identity, gateway, network, contract, transientData, response, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    walletPath = path.join(__dirname, "../../wallet/" + org);
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
                    return [4 /*yield*/, gateway.connect(ccpPath, { wallet: wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: true } })];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, gateway.getNetwork('mainchannel')];
                case 4:
                    network = _a.sent();
                    contract = network.getContract('chaineuralcc');
                    transientData = {
                        'learningTime': Buffer.from(JSON.stringify(learningTime)),
                        'loss': Buffer.from(JSON.stringify(loss)),
                    };
                    console.log(transientData);
                    return [4 /*yield*/, contract.createTransaction('finishMinibatch').setTransient(transientData).submit(minibatchNumber.toString(), epochName, org)];
                case 5:
                    response = _a.sent();
                    console.log("Transaction has been submitted");
                    console.log("Response");
                    console.log(response.toString());
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
                    error_2 = _a.sent();
                    console.error("Failed to submit transaction: " + error_2);
                    process.exit(1);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
function queryEpoch() {
    return __awaiter(this, void 0, void 0, function () {
        var walletPath, wallet, identity, gateway, network, contract, response, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    walletPath = path.join(__dirname, "../../wallet/" + org);
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
                    console.log("1");
                    return [4 /*yield*/, gateway.connect(ccpPath, { wallet: wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: true } })];
                case 3:
                    _a.sent();
                    console.log("2");
                    return [4 /*yield*/, gateway.getNetwork('mainchannel')];
                case 4:
                    network = _a.sent();
                    console.log("3");
                    contract = network.getContract('chaineuralcc');
                    console.log("4");
                    return [4 /*yield*/, contract.createTransaction('queryEpoch').submit(epochName)];
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
                    error_3 = _a.sent();
                    console.error("Failed to submit transaction: " + error_3);
                    process.exit(1);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
function queryMinibatch() {
    return __awaiter(this, void 0, void 0, function () {
        var walletPath, wallet, identity, gateway, network, contract, response, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    walletPath = path.join(__dirname, "../../wallet/" + org);
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
                    return [4 /*yield*/, gateway.connect(ccpPath, { wallet: wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: true } })];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, gateway.getNetwork('mainchannel')];
                case 4:
                    network = _a.sent();
                    contract = network.getContract('chaineuralcc');
                    return [4 /*yield*/, contract.createTransaction('queryMinibatch').submit(epochName, minibatchNumber.toString(), org)];
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
function queryMinibatchPrivateInfo() {
    return __awaiter(this, void 0, void 0, function () {
        var walletPath, wallet, identity, gateway, network, contract, response, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    walletPath = path.join(__dirname, "../../wallet/" + org);
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
                    return [4 /*yield*/, gateway.connect(ccpPath, { wallet: wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: true } })];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, gateway.getNetwork('mainchannel')];
                case 4:
                    network = _a.sent();
                    contract = network.getContract('chaineuralcc');
                    return [4 /*yield*/, contract.createTransaction('queryMinibatch').submit(epochName, minibatchNumber.toString(), org)];
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
                    error_5 = _a.sent();
                    console.error("Failed to submit transaction: " + error_5);
                    process.exit(1);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
// initMinibatch();
// finishMinibatch();
// queryEpoch();
// queryMinibatch();
// queryMinibatchPrivateInfo();
//# sourceMappingURL=invoke.js.map