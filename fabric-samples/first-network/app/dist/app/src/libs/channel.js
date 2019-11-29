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
var util = __importStar(require("util"));
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var helper = __importStar(require("./helper"));
var logger = helper.getLogger('ChannelApi');
// tslint:disable-next-line:no-var-requires
// const config = require('../app_config.json');
var allEventhubs = [];
function buildTarget(peer, org) {
    var target = undefined;
    if (typeof peer !== 'undefined') {
        var targets = helper.newPeers([peer], org);
        if (targets && targets.length > 0) {
            target = targets[0];
        }
    }
    return target;
}
// Attempt to send a request to the orderer with the sendCreateChain method
function createChannel(channelName, channelConfigPath, username, orgName) {
    return __awaiter(this, void 0, void 0, function () {
        var client, channel, envelope, channelConfig, admin, signature, request, response, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logger.debug('\n====== Creating Channel \'' + channelName + '\' ======\n');
                    client = helper.getClientForOrg(orgName);
                    channel = helper.getChannelForOrg(orgName);
                    envelope = fs.readFileSync(path.join(__dirname, channelConfigPath));
                    channelConfig = client.extractChannelConfig(envelope);
                    return [4 /*yield*/, helper.getOrgAdmin(orgName)];
                case 1:
                    admin = _a.sent();
                    logger.debug(util.format('Successfully acquired admin user for the organization "%s"', orgName));
                    signature = client.signChannelConfig(channelConfig);
                    request = {
                        config: channelConfig,
                        signatures: [signature],
                        name: channelName,
                        orderer: channel.getOrderers()[0],
                        txId: client.newTransactionID()
                    };
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, client.createChannel(request)];
                case 3:
                    response = _a.sent();
                    if (response && response.status === 'SUCCESS') {
                        logger.debug('Successfully created the channel.');
                        return [2 /*return*/, {
                                success: true,
                                message: 'Channel \'' + channelName + '\' created Successfully'
                            }];
                    }
                    else {
                        logger.error('\n!!!!!!!!! Failed to create the channel \'' + channelName +
                            '\' !!!!!!!!!\n\n');
                        throw new Error('Failed to create the channel \'' + channelName + '\'');
                    }
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _a.sent();
                    logger.error('\n!!!!!!!!! Failed to create the channel \'' + channelName +
                        '\' !!!!!!!!!\n\n');
                    throw new Error('Failed to create the channel \'' + channelName + '\'');
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.createChannel = createChannel;
function joinChannel(channelName, peers, username, org) {
    return __awaiter(this, void 0, void 0, function () {
        var closeConnections, client, channel, admin, request, genesisBlock, request2, eventhubs, eventPromises, sendPromise, results, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    closeConnections = function (isSuccess) {
                        if (isSuccess) {
                            logger.debug('\n============ Join Channel is SUCCESS ============\n');
                        }
                        else {
                            logger.debug('\n!!!!!!!! ERROR: Join Channel FAILED !!!!!!!!\n');
                        }
                        logger.debug('');
                        allEventhubs.forEach(function (hub) {
                            console.log(hub);
                            if (hub && hub.isconnected()) {
                                hub.disconnect();
                            }
                        });
                    };
                    // logger.debug('\n============ Join Channel ============\n')
                    logger.info(util.format('Calling peers in organization "%s" to join the channel', org));
                    client = helper.getClientForOrg(org);
                    channel = helper.getChannelForOrg(org);
                    return [4 /*yield*/, helper.getOrgAdmin(org)];
                case 1:
                    admin = _a.sent();
                    logger.info(util.format('received member object for admin of the organization "%s": ', org));
                    request = {
                        txId: client.newTransactionID()
                    };
                    return [4 /*yield*/, channel.getGenesisBlock(request)];
                case 2:
                    genesisBlock = _a.sent();
                    request2 = {
                        targets: helper.newPeers(peers, org),
                        txId: client.newTransactionID(),
                        block: genesisBlock
                    };
                    eventhubs = helper.newEventHubs(peers, org);
                    eventhubs.forEach(function (eh) {
                        eh.connect();
                        allEventhubs.push(eh);
                    });
                    eventPromises = [];
                    eventhubs.forEach(function (eh) {
                        var txPromise = new Promise(function (resolve, reject) {
                            var handle = setTimeout(reject, 30000);
                            eh.registerBlockEvent(function (block) {
                                clearTimeout(handle);
                                // in real-world situations, a peer may have more than one channels so
                                // we must check that this block came from the channel we asked the peer to join
                                if (block.data.data.length === 1) {
                                    // Config block must only contain one transaction
                                    var channel_header = block.data.data[0].payload.header.channel_header;
                                    if (channel_header.channel_id === channelName) {
                                        resolve();
                                    }
                                    else {
                                        reject();
                                    }
                                }
                            });
                        });
                        eventPromises.push(txPromise);
                    });
                    sendPromise = channel.joinChannel(request2);
                    return [4 /*yield*/, Promise.all([sendPromise].concat(eventPromises))];
                case 3:
                    results = _a.sent();
                    logger.debug(util.format('Join Channel R E S P O N S E : %j', results));
                    if (results[0] && results[0][0] && results[0][0].response && results[0][0]
                        .response.status === 200) {
                        logger.info(util.format('Successfully joined peers in organization %s to the channel \'%s\'', org, channelName));
                        closeConnections(true);
                        response = {
                            success: true,
                            message: util.format('Successfully joined peers in organization %s to the channel \'%s\'', org, channelName)
                        };
                        return [2 /*return*/, response];
                    }
                    else {
                        logger.error(' Failed to join channel');
                        closeConnections(false);
                        throw new Error('Failed to join channel');
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.joinChannel = joinChannel;
function instantiateChainCode(channelName, chaincodeName, chaincodeVersion, functionName, args, username, org) {
    return __awaiter(this, void 0, void 0, function () {
        var channel, client, admin, txId, request, results, proposalResponses, proposal, allGood_1, request2, deployId_1, ORGS, eh_1, txPromise, sendPromise, transactionResults, response, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logger.debug('\n============ Instantiate chaincode on organization ' + org +
                        ' ============\n');
                    channel = helper.getChannelForOrg(org);
                    client = helper.getClientForOrg(org);
                    return [4 /*yield*/, helper.getOrgAdmin(org)];
                case 1:
                    admin = _a.sent();
                    return [4 /*yield*/, channel.initialize()];
                case 2:
                    _a.sent();
                    txId = client.newTransactionID();
                    request = {
                        chaincodeId: chaincodeName,
                        chaincodeVersion: chaincodeVersion,
                        args: args,
                        txId: txId,
                        fcn: functionName,
                    };
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 8, , 9]);
                    console.log();
                    return [4 /*yield*/, channel.sendInstantiateProposal(request)];
                case 4:
                    results = _a.sent();
                    proposalResponses = results[0];
                    proposal = results[1];
                    console.log(proposalResponses);
                    console.log(proposal);
                    allGood_1 = true;
                    proposalResponses.forEach(function (pr) {
                        var oneGood = false;
                        if (pr.response && pr.response.status === 200) {
                            oneGood = true;
                            logger.info('install proposal was good');
                        }
                        else {
                            logger.error('install proposal was bad');
                        }
                        allGood_1 = allGood_1 && oneGood;
                    });
                    if (!allGood_1) return [3 /*break*/, 6];
                    logger.info(util.format(
                    // tslint:disable-next-line:max-line-length
                    'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s", metadata - "%s", endorsement signature: %s', proposalResponses[0].response.status, proposalResponses[0].response.message, proposalResponses[0].response.payload, proposalResponses[0].endorsement
                        .signature));
                    request2 = {
                        proposalResponses: proposalResponses,
                        proposal: proposal
                    };
                    deployId_1 = txId.getTransactionID();
                    ORGS = helper.getOrgs();
                    eh_1 = channel.newChannelEventHub(ORGS[org].peers['peer1']);
                    eh_1.connect();
                    txPromise = new Promise(function (resolve, reject) {
                        var handle = setTimeout(function () {
                            eh_1.disconnect();
                            reject();
                        }, 30000);
                        eh_1.registerTxEvent(deployId_1, function (tx, code) {
                            // logger.info(
                            //  'The chaincode instantiate transaction has been committed on peer ' +
                            // eh._ep._endpoint.addr);
                            clearTimeout(handle);
                            eh_1.unregisterTxEvent(deployId_1);
                            eh_1.disconnect();
                            if (code !== 'VALID') {
                                logger.error('The chaincode instantiate transaction was invalid, code = ' + code);
                                reject();
                            }
                            else {
                                logger.info('The chaincode instantiate transaction was valid.');
                                resolve();
                            }
                        });
                    });
                    sendPromise = channel.sendTransaction(request2);
                    return [4 /*yield*/, Promise.all([sendPromise].concat([txPromise]))];
                case 5:
                    transactionResults = _a.sent();
                    response = transactionResults[0];
                    if (response.status === 'SUCCESS') {
                        logger.info('Successfully sent transaction to the orderer.');
                        return [2 /*return*/, 'Chaincode Instantiation is SUCCESS'];
                    }
                    else {
                        logger.error('Failed to order the transaction. Error code: ' + response.status);
                        return [2 /*return*/, 'Failed to order the transaction. Error code: ' + response.status];
                    }
                    return [3 /*break*/, 7];
                case 6:
                    logger.error(
                    // tslint:disable-next-line:max-line-length
                    'Failed to send instantiate Proposal or receive valid response. Response null or status is not 200. exiting...');
                    // tslint:disable-next-line:max-line-length
                    return [2 /*return*/, 'Failed to send instantiate Proposal or receive valid response. Response null or status is not 200. exiting...'];
                case 7: return [3 /*break*/, 9];
                case 8:
                    err_2 = _a.sent();
                    logger.error('Failed to send instantiate due to error: ' + err_2.stack ? err_2
                        .stack : err_2);
                    return [2 /*return*/, 'Failed to send instantiate due to error: ' + err_2.stack ? err_2.stack :
                            err_2];
                case 9: return [2 /*return*/];
            }
        });
    });
}
exports.instantiateChainCode = instantiateChainCode;
function invokeChaincode(peerNames, channelName, chaincodeName, fcn, args, username, org) {
    return __awaiter(this, void 0, void 0, function () {
        var client, channel, targets, user, txId, request, results, proposalResponses, proposal, allGood_2, request2, transactionID, eventPromises, sendPromise, results2, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logger.debug(util.format('\n============ invoke transaction on organization %s ============\n', org));
                    client = helper.getClientForOrg(org);
                    channel = helper.getChannelForOrg(org);
                    targets = (peerNames) ? helper.newPeers(peerNames, org) : undefined;
                    return [4 /*yield*/, helper.getRegisteredUsers(username, org)];
                case 1:
                    user = _a.sent();
                    txId = client.newTransactionID();
                    logger.debug(util.format('Sending transaction "%j"', txId));
                    request = {
                        chaincodeId: chaincodeName,
                        fcn: fcn,
                        args: args,
                        txId: txId
                    };
                    if (targets) {
                        request.targets = targets;
                    }
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 7, , 8]);
                    return [4 /*yield*/, channel.sendTransactionProposal(request)];
                case 3:
                    results = _a.sent();
                    proposalResponses = results[0];
                    proposal = results[1];
                    allGood_2 = true;
                    proposalResponses.forEach(function (pr) {
                        var oneGood = false;
                        if (pr.response && pr.response.status === 200) {
                            oneGood = true;
                            logger.info('transaction proposal was good');
                        }
                        else {
                            logger.error('transaction proposal was bad');
                        }
                        allGood_2 = allGood_2 && oneGood;
                    });
                    if (!allGood_2) return [3 /*break*/, 5];
                    logger.debug(util.format(
                    // tslint:disable-next-line:max-line-length
                    'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s", metadata - "%s", endorsement signature: %s', proposalResponses[0].response.status, proposalResponses[0].response.message, proposalResponses[0].response.payload, proposalResponses[0].endorsement
                        .signature));
                    request2 = {
                        proposalResponses: proposalResponses,
                        proposal: proposal
                    };
                    transactionID = txId.getTransactionID();
                    eventPromises = [];
                    if (!peerNames) {
                        peerNames = channel.getPeers().map(function (peer) {
                            return peer.getName();
                        });
                    }
                    sendPromise = channel.sendTransaction(request2);
                    return [4 /*yield*/, Promise.all([sendPromise].concat(eventPromises))];
                case 4:
                    results2 = _a.sent();
                    logger.debug(' event promise all complete and testing complete');
                    if (results2[0].status === 'SUCCESS') {
                        logger.info('Successfully sent transaction to the orderer.');
                        return [2 /*return*/, txId.getTransactionID()];
                    }
                    else {
                        logger.error('Failed to order the transaction. Error code: ' + results2[0].status);
                        return [2 /*return*/, 'Failed to order the transaction. Error code: ' + results2[0].status];
                    }
                    return [3 /*break*/, 6];
                case 5:
                    logger.error(
                    // tslint:disable-next-line:max-line-length
                    'Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
                    // tslint:disable-next-line:max-line-length
                    return [2 /*return*/, 'Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...'];
                case 6: return [3 /*break*/, 8];
                case 7:
                    err_3 = _a.sent();
                    logger.error('Failed to send transaction due to error: ' + err_3.stack ? err_3
                        .stack : err_3);
                    return [2 /*return*/, 'Failed to send transaction due to error: ' + err_3.stack ? err_3.stack :
                            err_3];
                case 8: return [2 /*return*/];
            }
        });
    });
}
exports.invokeChaincode = invokeChaincode;
function queryChaincode(peer, channelName, chaincodeName, args, fcn, username, org) {
    return __awaiter(this, void 0, void 0, function () {
        var channel, client, target, user, txId, request, responsePayloads, err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    channel = helper.getChannelForOrg(org);
                    client = helper.getClientForOrg(org);
                    target = buildTarget(peer, org);
                    return [4 /*yield*/, helper.getRegisteredUsers(username, org)];
                case 1:
                    user = _a.sent();
                    txId = client.newTransactionID();
                    request = {
                        chaincodeId: chaincodeName,
                        txId: txId,
                        fcn: fcn,
                        args: args
                    };
                    if (target) {
                        request.targets = [target];
                    }
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, channel.queryByChaincode(request)];
                case 3:
                    responsePayloads = _a.sent();
                    if (responsePayloads) {
                        responsePayloads.forEach(function (rp) {
                            logger.info(args[0] + ' now has ' + rp.toString('utf8') +
                                ' after the move');
                            return args[0] + ' now has ' + rp.toString('utf8') +
                                ' after the move';
                        });
                    }
                    else {
                        logger.error('response_payloads is null');
                        return [2 /*return*/, 'response_payloads is null'];
                    }
                    return [3 /*break*/, 5];
                case 4:
                    err_4 = _a.sent();
                    logger.error('Failed to send query due to error: ' + err_4.stack ? err_4.stack :
                        err_4);
                    return [2 /*return*/, 'Failed to send query due to error: ' + err_4.stack ? err_4.stack : err_4];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.queryChaincode = queryChaincode;
function getBlockByNumber(peer, blockNumber, username, org) {
    return __awaiter(this, void 0, void 0, function () {
        var target, channel, user, responsePayloads, err_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    target = buildTarget(peer, org);
                    channel = helper.getChannelForOrg(org);
                    return [4 /*yield*/, helper.getRegisteredUsers(username, org)];
                case 1:
                    user = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, channel.queryBlock(parseInt(blockNumber, 10), target)];
                case 3:
                    responsePayloads = _a.sent();
                    if (responsePayloads) {
                        logger.debug(responsePayloads);
                        return [2 /*return*/, responsePayloads]; // response_payloads.data.data[0].buffer;
                    }
                    else {
                        logger.error('response_payloads is null');
                        return [2 /*return*/, 'response_payloads is null'];
                    }
                    return [3 /*break*/, 5];
                case 4:
                    err_5 = _a.sent();
                    logger.error('Failed to query with error:' + err_5.stack ? err_5.stack : err_5);
                    return [2 /*return*/, 'Failed to query with error:' + err_5.stack ? err_5.stack : err_5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.getBlockByNumber = getBlockByNumber;
function getTransactionByID(peer, trxnID, username, org) {
    return __awaiter(this, void 0, void 0, function () {
        var target, channel, user, responsePayloads, err_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    target = buildTarget(peer, org);
                    channel = helper.getChannelForOrg(org);
                    return [4 /*yield*/, helper.getRegisteredUsers(username, org)];
                case 1:
                    user = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, channel.queryTransaction(trxnID, target)];
                case 3:
                    responsePayloads = _a.sent();
                    if (responsePayloads) {
                        logger.debug(responsePayloads);
                        return [2 /*return*/, responsePayloads];
                    }
                    else {
                        logger.error('response_payloads is null');
                        return [2 /*return*/, 'response_payloads is null'];
                    }
                    return [3 /*break*/, 5];
                case 4:
                    err_6 = _a.sent();
                    logger.error('Failed to query with error:' + err_6.stack ? err_6.stack : err_6);
                    return [2 /*return*/, 'Failed to query with error:' + err_6.stack ? err_6.stack : err_6];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.getTransactionByID = getTransactionByID;
function getChainInfo(peer, username, org) {
    return __awaiter(this, void 0, void 0, function () {
        var target, channel, user, blockChainInfo, err_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    target = buildTarget(peer, org);
                    channel = helper.getChannelForOrg(org);
                    return [4 /*yield*/, helper.getRegisteredUsers(username, org)];
                case 1:
                    user = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, channel.queryInfo(target)];
                case 3:
                    blockChainInfo = _a.sent();
                    if (blockChainInfo) {
                        // FIXME: Save this for testing 'getBlockByHash'  ?
                        logger.debug('===========================================');
                        logger.debug(blockChainInfo.currentBlockHash);
                        logger.debug('===========================================');
                        // logger.debug(blockchainInfo);
                        return [2 /*return*/, blockChainInfo];
                    }
                    else {
                        logger.error('blockChainInfo is null');
                        return [2 /*return*/, 'blockChainInfo is null'];
                    }
                    return [3 /*break*/, 5];
                case 4:
                    err_7 = _a.sent();
                    logger.error('Failed to query with error:' + err_7.stack ? err_7.stack : err_7);
                    return [2 /*return*/, 'Failed to query with error:' + err_7.stack ? err_7.stack : err_7];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.getChainInfo = getChainInfo;
// export async function getChannels(peer: string, username: string, org: string) {
//     const target = buildTarget(peer, org);
//     const channel = helper.getChannelForOrg(org);
//     const client = helper.getClientForOrg(org);
//     const user = await helper.getRegisteredUsers(username, org);
//     try {
//         const response = await client.queryChannels(target);
//         if (response) {
//             logger.debug('<<< channels >>>');
//             const channelNames: string[] = [];
//             response.channels.forEach((ci) => {
//                 channelNames.push('channel id: ' + ci.channel_id);
//             });
//             return response;
//         } else {
//             logger.error('response_payloads is null');
//             return 'response_payloads is null';
//         }
//     } catch (err) {
//         logger.error('Failed to query with error:' + err.stack ? err.stack : err);
//         return 'Failed to query with error:' + err.stack ? err.stack : err;
//     }
// }
//# sourceMappingURL=channel.js.map