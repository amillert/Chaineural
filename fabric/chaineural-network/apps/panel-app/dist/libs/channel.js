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
function invokeChaincode(peerOrgPairs, channelName, chaincodeName, fcn, args, username, peerName, fromOrg) {
    return __awaiter(this, void 0, void 0, function () {
        var client, channel, targets, user, err_1, txId, request, results, proposalResponses, proposal, allGood_1, responses, proposalResponse, request2, transactionID_1, eventPromises_1, peerNames, eventhubs, sendPromise, results2, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logger.debug(util.format('\n============ invoke transaction on organization %s ============\n', fromOrg));
                    client = helper.getClientForOrg(fromOrg);
                    channel = helper.getChannelForOrg(fromOrg);
                    targets = [];
                    peerOrgPairs.forEach(function (_a, index) {
                        var peerName = _a[0], org = _a[1];
                        targets = targets.concat(helper.newPeers([peerName], org));
                    });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, helper.getRegisteredUsers(username, fromOrg)];
                case 2:
                    user = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    return [2 /*return*/, err_1];
                case 4:
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
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 10, , 11]);
                    return [4 /*yield*/, channel.sendTransactionProposal(request)];
                case 6:
                    results = _a.sent();
                    proposalResponses = results[0];
                    proposal = results[1];
                    allGood_1 = true;
                    proposalResponses.forEach(function (pr) {
                        var oneGood = false;
                        if (pr.response && pr.response.status === 200) {
                            oneGood = true;
                            logger.info('transaction proposal was good');
                        }
                        else {
                            logger.error('transaction proposal was bad');
                        }
                        allGood_1 = allGood_1 && oneGood;
                    });
                    if (!allGood_1) return [3 /*break*/, 8];
                    responses = proposalResponses;
                    proposalResponse = responses[0];
                    logger.debug(util.format(
                    // tslint:disable-next-line:max-line-length
                    'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s", metadata - "%s", endorsement signature: %s', proposalResponse.response.status, proposalResponse.response.message, proposalResponse.response.payload, proposalResponse.endorsement
                        .signature));
                    request2 = {
                        proposalResponses: responses,
                        proposal: proposal
                    };
                    transactionID_1 = txId.getTransactionID();
                    eventPromises_1 = [];
                    peerNames = [];
                    if (peerNames.length == 0) {
                        peerNames = channel.getPeers().map(function (peer) {
                            return peer.getName();
                        });
                    }
                    eventhubs = helper.newEventHubs([peerName], fromOrg);
                    eventhubs.forEach(function (eh) {
                        eh.connect();
                        var txPromise = new Promise(function (resolve, reject) {
                            var handle = setTimeout(function () {
                                eh.disconnect();
                                reject();
                            }, 30000);
                            eh.registerTxEvent(transactionID_1, function (tx, code) {
                                clearTimeout(handle);
                                eh.unregisterTxEvent(transactionID_1);
                                eh.disconnect();
                                if (code !== 'VALID') {
                                    logger.error('The chaineural transaction was invalid, code = ' + code);
                                    reject();
                                }
                                else {
                                    logger.info('The chaineural transaction has been committed on peer ' +
                                        eh.getPeerAddr());
                                    resolve();
                                }
                            });
                        });
                        eventPromises_1.push(txPromise);
                    });
                    sendPromise = channel.sendTransaction(request2);
                    return [4 /*yield*/, Promise.all([sendPromise].concat(eventPromises_1))];
                case 7:
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
                    return [3 /*break*/, 9];
                case 8:
                    logger.error(
                    // tslint:disable-next-line:max-line-length
                    'Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
                    // tslint:disable-next-line:max-line-length
                    return [2 /*return*/, 'Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...'];
                case 9: return [3 /*break*/, 11];
                case 10:
                    err_2 = _a.sent();
                    logger.error('Failed to send transaction due to error: ' + err_2.stack ? err_2
                        .stack : err_2);
                    return [2 /*return*/, 'Failed to send transaction due to error: ' + err_2.stack ? err_2.stack :
                            err_2];
                case 11: return [2 /*return*/];
            }
        });
    });
}
exports.invokeChaincode = invokeChaincode;
function queryChaincode(peer, channelName, chaincodeName, args, fcn, username, org) {
    return __awaiter(this, void 0, void 0, function () {
        var channel, client, target, user, txId, request, responsePayloads, err_3;
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
                        return [2 /*return*/, responsePayloads];
                    }
                    else {
                        logger.error('response_payloads is null');
                        return [2 /*return*/, 'response_payloads is null'];
                    }
                    return [3 /*break*/, 5];
                case 4:
                    err_3 = _a.sent();
                    logger.error('Failed to send query due to error: ' + err_3.stack ? err_3.stack :
                        err_3);
                    return [2 /*return*/, 'Failed to send query due to error: ' + err_3.stack ? err_3.stack : err_3];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.queryChaincode = queryChaincode;
function getTransactionByID(peer, trxnID, username, org) {
    return __awaiter(this, void 0, void 0, function () {
        var target, channel, user, responsePayloads, err_4;
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
                        return [2 /*return*/, responsePayloads.transactionEnvelope.payload.data.actions[0]
                                .payload.action.proposal_response_payload.extension.results.ns_rwset[0].rwset
                                .writes.map(function (a) { return a.value; })];
                    }
                    else {
                        logger.error('response_payloads is null');
                        return [2 /*return*/, 'response_payloads is null'];
                    }
                    return [3 /*break*/, 5];
                case 4:
                    err_4 = _a.sent();
                    logger.error('Failed to query with error:' + err_4.stack ? err_4.stack : err_4);
                    return [2 /*return*/, 'Failed to query with error:' + err_4.stack ? err_4.stack : err_4];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.getTransactionByID = getTransactionByID;
//# sourceMappingURL=channel.js.map