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
function createAffiliationIfNotExists(userOrg, client) {
    return __awaiter(this, void 0, void 0, function () {
        var adminUserObj, caClient, affiliationService, registeredAffiliations, affiliation;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getAdminUser(userOrg)];
                case 1:
                    adminUserObj = _a.sent();
                    caClient = client.getCertificateAuthority();
                    affiliationService = caClient.newAffiliationService();
                    return [4 /*yield*/, affiliationService.getAll(adminUserObj)];
                case 2:
                    registeredAffiliations = _a.sent();
                    if (!!registeredAffiliations.result.affiliations.some(function (x) { return x.name == userOrg.toLowerCase(); })) return [3 /*break*/, 4];
                    affiliation = userOrg + ".department1";
                    return [4 /*yield*/, affiliationService.create({
                            name: affiliation,
                            force: true
                        }, adminUserObj)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
var fabric_network_1 = require("fabric-network");
var path = __importStar(require("path"));
var org = 'org3';
var orgCapitalized = org.charAt(0).toUpperCase() + org.slice(1);
var ccpPath = path.resolve(__dirname, "../../../connection-" + org + ".json");
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var walletPath, wallet, userIdentity, adminIdentity, gateway, client, ca, adminUser, secret, enrollment, x509Identity, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 10, , 11]);
                    walletPath = path.join(process.cwd(), "../../wallet/" + org);
                    return [4 /*yield*/, new fabric_network_1.FileSystemWallet(walletPath)];
                case 1:
                    wallet = _a.sent();
                    console.log("Wallet path: " + walletPath);
                    return [4 /*yield*/, wallet.exists('user1')];
                case 2:
                    userIdentity = _a.sent();
                    if (userIdentity) {
                        console.log('An identity for the user "user1" already exists in the wallet');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, wallet.exists('admin')];
                case 3:
                    adminIdentity = _a.sent();
                    if (!adminIdentity) {
                        console.log('An identity for the admin user "admin" does not exist in the wallet');
                        console.log('Run the enrollAdmin.ts application before retrying');
                        return [2 /*return*/];
                    }
                    gateway = new fabric_network_1.Gateway();
                    return [4 /*yield*/, gateway.connect(ccpPath, { wallet: wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: true } })];
                case 4:
                    _a.sent();
                    client = gateway.getClient();
                    ca = client.getCertificateAuthority();
                    return [4 /*yield*/, client.getUserContext('admin', false)];
                case 5:
                    adminUser = _a.sent();
                    return [4 /*yield*/, createAffiliationIfNotExists(org, client)];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, ca.register({ affiliation: org + ".department1", enrollmentID: 'user1', role: 'client' }, adminUser)];
                case 7:
                    secret = _a.sent();
                    return [4 /*yield*/, ca.enroll({ enrollmentID: 'user1', enrollmentSecret: secret })];
                case 8:
                    enrollment = _a.sent();
                    x509Identity = {
                        credentials: {
                            certificate: enrollment.certificate,
                            privateKey: enrollment.key.toBytes(),
                        },
                        mspId: orgCapitalized + "MSP",
                        type: 'X.509',
                    };
                    return [4 /*yield*/, wallet.import('user1', x509Identity)];
                case 9:
                    _a.sent();
                    console.log('Successfully registered and enrolled admin user "user1" and imported it into the wallet');
                    return [3 /*break*/, 11];
                case 10:
                    error_1 = _a.sent();
                    console.error("Failed to register user \"user1\": " + error_1);
                    process.exit(1);
                    return [3 /*break*/, 11];
                case 11: return [2 /*return*/];
            }
        });
    });
}
main();
//# sourceMappingURL=registerWorkerUser.js.map