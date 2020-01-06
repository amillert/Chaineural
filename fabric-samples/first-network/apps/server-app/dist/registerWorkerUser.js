"use strict";
/*
 * SPDX-License-Identifier: Apache-2.0
 */
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
var helper = __importStar(require("./libs/helper"));
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var logger = helper.getLogger('registerWorkerUser');
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var _i, _a, org, orgCapitalized, ccpPath, ccpJSON, ccp, walletPath, wallet, userExists, adminExists, gateway, client, ca, adminUser, secret, enrollment, userIdentity, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 11, , 12]);
                    helper.init();
                    _i = 0, _a = Object.keys(helper.getOrgs());
                    _b.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 10];
                    org = _a[_i];
                    if (!(org.lastIndexOf('org', 0) === 0)) return [3 /*break*/, 9];
                    logger.info("Enroll admin for " + org);
                    orgCapitalized = org.charAt(0).toUpperCase() + org.slice(1);
                    ccpPath = path.resolve(__dirname, "../../../connection-" + org + ".json");
                    ccpJSON = fs.readFileSync(ccpPath, 'utf8');
                    ccp = JSON.parse(ccpJSON);
                    walletPath = path.join(process.cwd(), "../../wallet/" + org);
                    wallet = new fabric_network_1.FileSystemWallet(walletPath);
                    console.log("Wallet path: " + walletPath);
                    return [4 /*yield*/, wallet.exists('userWorker')];
                case 2:
                    userExists = _b.sent();
                    if (userExists) {
                        console.log('An identity for the user "userWorker" already exists in the wallet');
                        return [3 /*break*/, 9];
                    }
                    return [4 /*yield*/, wallet.exists('admin')];
                case 3:
                    adminExists = _b.sent();
                    if (!adminExists) {
                        console.log('An identity for the admin user "admin" does not exist in the wallet');
                        console.log('Run the enrollAdmin.ts application before retrying');
                        return [3 /*break*/, 9];
                    }
                    gateway = new fabric_network_1.Gateway();
                    // const client = new FabricClient();
                    // client.setConfigSetting('network-connection-profile-path',path.join(__dirname, '../config' ,'common-connection-profile.yaml'));
                    // //                 client.setConfigSetting('Org2-connection-profile-path',path.join(__dirname, '../config', 'org2.yaml'));
                    // // client.setConfigSetting('Org3-connection-profile-path',path.join(__dirname, '../config', 'org3.yaml'));
                    // // client.setConfigSetting('Org4-connection-profile-path',path.join(__dirname, '../config', 'org4.yaml'));
                    // console.log('cos2222');
                    // client.loadFromConfig(client.getConfigSetting('network-connection-profile-path'));
                    // console.log('cos');
                    // console.log(client.getConfigSetting('Chaineural Network'));
                    // client.loadFromConfig(client.getConfigSetting('Org3-connection-profile-path'));
                    return [4 /*yield*/, gateway.connect(ccpPath, { wallet: wallet, identity: 'admin', discovery: { enabled: false } })];
                case 4:
                    // const client = new FabricClient();
                    // client.setConfigSetting('network-connection-profile-path',path.join(__dirname, '../config' ,'common-connection-profile.yaml'));
                    // //                 client.setConfigSetting('Org2-connection-profile-path',path.join(__dirname, '../config', 'org2.yaml'));
                    // // client.setConfigSetting('Org3-connection-profile-path',path.join(__dirname, '../config', 'org3.yaml'));
                    // // client.setConfigSetting('Org4-connection-profile-path',path.join(__dirname, '../config', 'org4.yaml'));
                    // console.log('cos2222');
                    // client.loadFromConfig(client.getConfigSetting('network-connection-profile-path'));
                    // console.log('cos');
                    // console.log(client.getConfigSetting('Chaineural Network'));
                    // client.loadFromConfig(client.getConfigSetting('Org3-connection-profile-path'));
                    _b.sent();
                    client = gateway.getClient();
                    ca = client.getCertificateAuthority();
                    return [4 /*yield*/, client.getUserContext('admin', false)];
                case 5:
                    adminUser = _b.sent();
                    // Create Affiliation for org if not exists
                    return [4 /*yield*/, helper.createAffiliationIfNotExists(org)];
                case 6:
                    // Create Affiliation for org if not exists
                    _b.sent();
                    return [4 /*yield*/, ca.register({ affiliation: org + ".department1", enrollmentID: 'userWorker', role: 'client' }, adminUser)];
                case 7:
                    secret = _b.sent();
                    return [4 /*yield*/, ca.enroll({ enrollmentID: 'userWorker', enrollmentSecret: secret })];
                case 8:
                    enrollment = _b.sent();
                    userIdentity = fabric_network_1.X509WalletMixin.createIdentity(orgCapitalized + "MSP", enrollment.certificate, enrollment.key.toBytes());
                    wallet.import('userWorker', userIdentity);
                    console.log('Successfully registered and enrolled admin user "userWorker" and imported it into the wallet');
                    _b.label = 9;
                case 9:
                    _i++;
                    return [3 /*break*/, 1];
                case 10: return [3 /*break*/, 12];
                case 11:
                    error_1 = _b.sent();
                    console.error("Failed to register user \"userWorker\": " + error_1);
                    process.exit(1);
                    return [3 /*break*/, 12];
                case 12: return [2 /*return*/];
            }
        });
    });
}
main();
//# sourceMappingURL=registerWorkerUser.js.map