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
// tslint:disable-next-line:no-var-requires
// const config = require('../app_config.json');
var logger = helper.getLogger('ChaincodeLib');
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
function installChaincode(peers, chaincodeName, chaincodePath, chaincodeVersion, username, org) {
    return __awaiter(this, void 0, void 0, function () {
        var channel, client, admin, request, results, proposalResponses, proposal, allGood_1, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logger.debug('\n============ Install chaincode on organizations ============\n');
                    helper.setupChaincodeDeploy();
                    channel = helper.getChannelForOrg(org);
                    client = helper.getClientForOrg(org);
                    return [4 /*yield*/, helper.getOrgAdmin(org)];
                case 1:
                    admin = _a.sent();
                    request = {
                        targets: helper.newPeers(peers, org),
                        chaincodePath: chaincodePath,
                        chaincodeId: chaincodeName,
                        chaincodeVersion: chaincodeVersion
                    };
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, client.installChaincode(request)];
                case 3:
                    results = _a.sent();
                    proposalResponses = results[0];
                    proposal = results[1];
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
                    if (allGood_1) {
                        logger.info(util.format('Successfully sent install Proposal and received ProposalResponse: Status - %s', proposalResponses[0].response.status));
                        logger.debug('\nSuccessfully Installed chaincode on organization ' + org +
                            '\n');
                        return [2 /*return*/, 'Successfully Installed chaincode on organization ' + org];
                    }
                    else {
                        logger.error(
                        // tslint:disable-next-line:max-line-length
                        'Failed to send install Proposal or receive valid response. Response null or status is not 200. exiting...');
                        // tslint:disable-next-line:max-line-length
                        return [2 /*return*/, 'Failed to send install Proposal or receive valid response. Response null or status is not 200. exiting...'];
                    }
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _a.sent();
                    logger.error('Failed to send install proposal due to error: ' + err_1.stack ?
                        err_1.stack : err_1);
                    throw new Error('Failed to send install proposal due to error: ' + err_1.stack ?
                        err_1.stack : err_1);
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.installChaincode = installChaincode;
function getInstalledChaincodes(peer, type, username, org) {
    return __awaiter(this, void 0, void 0, function () {
        var target, channel, client, user, response, details_1, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    target = buildTarget(peer, org);
                    channel = helper.getChannelForOrg(org);
                    client = helper.getClientForOrg(org);
                    return [4 /*yield*/, helper.getOrgAdmin(org)];
                case 1:
                    user = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 7, , 8]);
                    response = null;
                    if (!(type === 'installed')) return [3 /*break*/, 4];
                    return [4 /*yield*/, client.queryInstalledChaincodes(target)];
                case 3:
                    response = _a.sent();
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, channel.queryInstantiatedChaincodes(target)];
                case 5:
                    response = _a.sent();
                    _a.label = 6;
                case 6:
                    if (response) {
                        if (type === 'installed') {
                            logger.debug('<<< Installed Chaincodes >>>');
                        }
                        else {
                            logger.debug('<<< Instantiated Chaincodes >>>');
                        }
                        details_1 = [];
                        response.chaincodes.forEach(function (c) {
                            logger.debug('name: ' + c.name + ', version: ' +
                                c.version + ', path: ' + c.path);
                            details_1.push({
                                name: c.name,
                                version: c.version
                            });
                        });
                        return [2 /*return*/, details_1];
                    }
                    else {
                        logger.error('response is null');
                        return [2 /*return*/, 'response is null'];
                    }
                    return [3 /*break*/, 8];
                case 7:
                    err_2 = _a.sent();
                    logger.error('Failed to query with error:' + err_2.stack ? err_2.stack : err_2);
                    return [2 /*return*/, 'Failed to query with error:' + err_2.stack ? err_2.stack : err_2];
                case 8: return [2 /*return*/];
            }
        });
    });
}
exports.getInstalledChaincodes = getInstalledChaincodes;
//# sourceMappingURL=chaincode.js.map