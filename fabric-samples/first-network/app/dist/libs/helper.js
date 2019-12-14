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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var log4js = require("log4js");
var path = __importStar(require("path"));
var fs = __importStar(require("fs"));
var util = __importStar(require("util"));
var config_1 = __importDefault(require("../config"));
var FabricClient = require("fabric-client");
// tslint:disable-next-line:no-var-requires
var copService = require('fabric-ca-client');
var logger = log4js.getLogger('Helper');
logger.setLevel('DEBUG');
FabricClient.setLogger(logger);
var ORGS;
var clients = {};
var channels = new Map;
var caClients = {};
function readAllFiles(dir) {
    var files = fs.readdirSync(dir);
    var certs = [];
    files.forEach(function (fileName) {
        var filePath = path.join(dir, fileName);
        var data = fs.readFileSync(filePath);
        certs.push(data);
    });
    return certs;
}
function getKeyStoreForOrg(org) {
    return FabricClient.getConfigSetting('keyValueStore') + '_' + org;
}
function setupPeers(channel, org, client) {
    for (var key in ORGS[org].peers) {
        if (key) {
            var data = fs.readFileSync(path.join(__dirname, ORGS[org].peers[key]['tls_cacerts']));
            var peer = client.newPeer(ORGS[org].peers[key].requests, {
                'pem': Buffer.from(data).toString(),
                'ssl-target-name-override': ORGS[org].peers[key]['server-hostname']
            });
            peer.setName(key);
            channel.addPeer(peer);
        }
    }
}
function newOrderer(client) {
    var caRootsPath = ORGS.orderer.tls_cacerts;
    var data = fs.readFileSync(path.join(__dirname, caRootsPath));
    var caroots = Buffer.from(data).toString();
    return client.newOrderer(ORGS.orderer.url, {
        'pem': caroots,
        'ssl-target-name-override': ORGS.orderer['server-hostname']
    });
}
function getOrgName(org) {
    return ORGS[org].name;
}
function getMspID(org) {
    logger.debug('Msp ID : ' + ORGS[org].mspid);
    return ORGS[org].mspid;
}
function newRemotes(names, forPeers, userOrg) {
    var client = getClientForOrg(userOrg);
    var targets = [];
    // find the peer that match the names
    names.forEach(function (n) {
        var channel = getChannelForOrg(userOrg);
        if (ORGS[userOrg].peers[n]) {
            // found a peer matching the name
            var data = fs.readFileSync(path.join(__dirname, ORGS[userOrg].peers[n]['tls_cacerts']));
            var grpcOpts = {
                'pem': Buffer.from(data).toString(),
                'ssl-target-name-override': ORGS[userOrg].peers[n]['server-hostname']
            };
            if (forPeers) {
                targets.push(client.newPeer(ORGS[userOrg].peers[n].requests, grpcOpts));
            }
            else {
                // const eh = client.newEventHub();
                var eh = channel.newChannelEventHub(ORGS[userOrg].peers[n]);
                // eh.setPeerAddr(ORGS[userOrg].peers[n].events, grpcOpts);
            }
        }
    });
    if (targets.length === 0) {
        logger.error(util.format('Failed to find peers matching the names %s', names));
    }
    return targets;
}
function getAdminUser(userOrg) {
    return __awaiter(this, void 0, void 0, function () {
        var users, username, password, client, store, user, caClient, enrollment, userOptions, member;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    users = FabricClient.getConfigSetting('admins');
                    username = users[0].username;
                    password = users[0].secret;
                    client = getClientForOrg(userOrg);
                    return [4 /*yield*/, FabricClient.newDefaultKeyValueStore({
                            path: getKeyStoreForOrg(getOrgName(userOrg))
                        })];
                case 1:
                    store = _a.sent();
                    client.setStateStore(store);
                    return [4 /*yield*/, client.getUserContext(username, true)];
                case 2:
                    user = _a.sent();
                    if (user && user.isEnrolled()) {
                        logger.info('Successfully loaded member from persistence');
                        return [2 /*return*/, user];
                    }
                    caClient = caClients[userOrg];
                    return [4 /*yield*/, caClient.enroll({
                            enrollmentID: username,
                            enrollmentSecret: password
                        })];
                case 3:
                    enrollment = _a.sent();
                    logger.info('Successfully enrolled user \'' + username + '\'');
                    userOptions = {
                        username: username,
                        mspid: getMspID(userOrg),
                        cryptoContent: {
                            privateKeyPEM: enrollment.key.toBytes(),
                            signedCertPEM: enrollment.certificate
                        },
                        skipPersistence: false
                    };
                    return [4 /*yield*/, client.createUser(userOptions)];
                case 4:
                    member = _a.sent();
                    return [2 /*return*/, member];
            }
        });
    });
}
function newPeers(names, org) {
    return newRemotes(names, true, org);
}
exports.newPeers = newPeers;
function newEventHubs(names, org) {
    return newRemotes(names, false, org);
}
exports.newEventHubs = newEventHubs;
function setupChaincodeDeploy() {
    process.env.GOPATH = path.join(__dirname, FabricClient.getConfigSetting('CC_SRC_PATH'));
}
exports.setupChaincodeDeploy = setupChaincodeDeploy;
function getOrgs() {
    return ORGS;
}
exports.getOrgs = getOrgs;
function getClientForOrg(org) {
    return clients[org];
}
exports.getClientForOrg = getClientForOrg;
function getChannelForOrg(org) {
    return channels[org];
}
exports.getChannelForOrg = getChannelForOrg;
function getAllChannels() {
    var channelsNames = [];
    var _loop_1 = function (channel) {
        index = channelsNames.findIndex(function (x) { return x == channel.getName(); });
        if (index === -1) {
            channelsNames.push(channel.getName());
        }
    };
    var index;
    for (var _i = 0, _a = Object.values(channels); _i < _a.length; _i++) {
        var channel = _a[_i];
        _loop_1(channel);
    }
    return channelsNames;
}
exports.getAllChannels = getAllChannels;
function init() {
    FabricClient.addConfigFile(path.join(__dirname, '../../', config_1.default.networkConfigFile));
    FabricClient.addConfigFile(path.join(__dirname, '../../', 'app_config.json'));
    ORGS = FabricClient.getConfigSetting('network-config');
    logger.debug('Helper Init Function');
    // set up the client and channel objects for each org
    for (var key in ORGS) {
        if (key.indexOf('org') === 0) {
            var client = new FabricClient();
            var cryptoSuite = FabricClient.newCryptoSuite();
            // TODO: Fix it up as setCryptoKeyStore is only available for s/w impl
            cryptoSuite.setCryptoKeyStore(FabricClient.newCryptoKeyStore({
                path: getKeyStoreForOrg(ORGS[key].name)
            }));
            client.setCryptoSuite(cryptoSuite);
            var channel = client.newChannel(FabricClient.getConfigSetting('channelName'));
            channel.addOrderer(newOrderer(client));
            clients[key] = client;
            channels[key] = channel;
            setupPeers(channel, key, client);
            var caUrl = ORGS[key].ca;
            caClients[key] = new copService(caUrl, null /*defautl TLS opts*/, '' /* default CA */, cryptoSuite);
        }
    }
}
exports.init = init;
function getRegisteredUsers(username, userOrg) {
    return __awaiter(this, void 0, void 0, function () {
        var client, store, user, adminUser, caClient, secret, message, userOptions, member;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    client = getClientForOrg(userOrg);
                    return [4 /*yield*/, FabricClient.newDefaultKeyValueStore({
                            path: getKeyStoreForOrg(getOrgName(userOrg))
                        })];
                case 1:
                    store = _a.sent();
                    client.setStateStore(store);
                    return [4 /*yield*/, client.getUserContext(username, true)];
                case 2:
                    user = _a.sent();
                    if (user && user.isEnrolled()) {
                        logger.info('Successfully loaded member from persistence');
                        return [2 /*return*/, user];
                    }
                    logger.info('Using admin to enroll this user ..');
                    return [4 /*yield*/, getAdminUser(userOrg)];
                case 3:
                    adminUser = _a.sent();
                    caClient = caClients[userOrg];
                    return [4 /*yield*/, caClient.register({
                            enrollmentID: username,
                            affiliation: userOrg + '.department1'
                        }, adminUser)];
                case 4:
                    secret = _a.sent();
                    logger.debug(username + ' registered successfully');
                    return [4 /*yield*/, caClient.enroll({
                            enrollmentID: username,
                            enrollmentSecret: secret
                        })];
                case 5:
                    message = _a.sent();
                    if (message && typeof message === 'string' && message.includes('Error:')) {
                        logger.error(username + ' enrollment failed');
                    }
                    logger.debug(username + ' enrolled successfully');
                    userOptions = {
                        username: username,
                        mspid: getMspID(userOrg),
                        cryptoContent: {
                            privateKeyPEM: message.key.toBytes(),
                            signedCertPEM: message.certificate
                        },
                        skipPersistence: false
                    };
                    return [4 /*yield*/, client.createUser(userOptions)];
                case 6:
                    member = _a.sent();
                    return [2 /*return*/, member];
            }
        });
    });
}
exports.getRegisteredUsers = getRegisteredUsers;
function getLogger(moduleName) {
    var moduleLogger = log4js.getLogger(moduleName);
    moduleLogger.setLevel('DEBUG');
    return moduleLogger;
}
exports.getLogger = getLogger;
function getOrgAdmin(userOrg) {
    return __awaiter(this, void 0, void 0, function () {
        var admin, keyPath, keyPEM, certPath, certPEM, client, cryptoSuite, store;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    admin = ORGS[userOrg].admin;
                    keyPath = path.join(__dirname, admin.key);
                    keyPEM = Buffer.from(readAllFiles(keyPath)[0]).toString();
                    certPath = path.join(__dirname, admin.cert);
                    certPEM = readAllFiles(certPath)[0].toString();
                    client = getClientForOrg(userOrg);
                    cryptoSuite = FabricClient.newCryptoSuite();
                    if (userOrg) {
                        cryptoSuite.setCryptoKeyStore(FabricClient.newCryptoKeyStore({ path: getKeyStoreForOrg(getOrgName(userOrg)) }));
                        client.setCryptoSuite(cryptoSuite);
                    }
                    return [4 /*yield*/, FabricClient.newDefaultKeyValueStore({
                            path: getKeyStoreForOrg(getOrgName(userOrg))
                        })];
                case 1:
                    store = _a.sent();
                    client.setStateStore(store);
                    return [2 /*return*/, client.createUser({
                            username: 'peer' + userOrg + 'Admin',
                            mspid: getMspID(userOrg),
                            cryptoContent: {
                                privateKeyPEM: keyPEM,
                                signedCertPEM: certPEM
                            },
                            skipPersistence: false
                        })];
            }
        });
    });
}
exports.getOrgAdmin = getOrgAdmin;
//# sourceMappingURL=helper.js.map