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
var chaincode = __importStar(require("../libs/chaincode"));
var helper = __importStar(require("../libs/helper"));
// tslint:disable-next-line:no-var-requires
// const config = require('../app_config.json');
var logger = helper.getLogger('ChaincodeApi');
function getInstantiatedChaincodesForChannel(channelName) {
    return __awaiter(this, void 0, void 0, function () {
        var orgs, allInstantiated, _i, _a, _b, orgKey, value, _c, _d, _e, peerKey, instantiatedList, _loop_1, index, _f, instantiatedList_1, chaincode_1;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    orgs = helper.getOrgs();
                    allInstantiated = [];
                    _i = 0, _a = Object.entries(orgs);
                    _g.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 6];
                    _b = _a[_i], orgKey = _b[0], value = _b[1];
                    _c = [];
                    for (_d in orgs[orgKey].peers)
                        _c.push(_d);
                    _e = 0;
                    _g.label = 2;
                case 2:
                    if (!(_e < _c.length)) return [3 /*break*/, 5];
                    peerKey = _c[_e];
                    return [4 /*yield*/, chaincode.getInstalledChaincodes(peerKey, 'instantiated', 'admin', orgKey)];
                case 3:
                    instantiatedList = _g.sent();
                    _loop_1 = function (chaincode_1) {
                        index = allInstantiated.findIndex(function (x) { return x.name == chaincode_1.name; });
                        if (index === -1) {
                            allInstantiated.push(chaincode_1);
                        }
                    };
                    for (_f = 0, instantiatedList_1 = instantiatedList; _f < instantiatedList_1.length; _f++) {
                        chaincode_1 = instantiatedList_1[_f];
                        _loop_1(chaincode_1);
                    }
                    _g.label = 4;
                case 4:
                    _e++;
                    return [3 /*break*/, 2];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6: return [2 /*return*/, allInstantiated];
            }
        });
    });
}
exports.getInstantiatedChaincodesForChannel = getInstantiatedChaincodesForChannel;
//# sourceMappingURL=chaincodeApi.js.map