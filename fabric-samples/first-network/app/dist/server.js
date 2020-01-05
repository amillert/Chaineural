'use strict';
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var cors = require('cors');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var port = 3001;
var gatewayAPI_1 = __importDefault(require("./gatewayAPI"));
var channelApi = __importStar(require("./api/channelApi"));
var gatewayAPI = new gatewayAPI_1.default();
app.use(cors());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.get('/api/channels', function (req, res) { res.send(gatewayAPI.getAllChannels()); });
app.get('/api/peers-for-channel/:channelName', function (req, res) { return __awaiter(void 0, void 0, void 0, function () { var _a, _b; return __generator(this, function (_c) {
    switch (_c.label) {
        case 0:
            _b = (_a = res).send;
            return [4 /*yield*/, gatewayAPI.getPeerForChannel(req.params.channelName)];
        case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
    }
}); }); });
app.get('/api/channel-blocks-hashes/:channelName/:amount/:peerFirstLimb/:workOrg', function (req, res) { return __awaiter(void 0, void 0, void 0, function () { var _a, _b; return __generator(this, function (_c) {
    switch (_c.label) {
        case 0:
            _b = (_a = res).send;
            return [4 /*yield*/, gatewayAPI.getChannelBlocksHashes(req.params.channelName, req.params.amount, req.params.peerFirstLimb, req.params.workOrg)];
        case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
    }
}); }); });
app.get('/api/anchor-peers/:channelName', function (req, res) { return __awaiter(void 0, void 0, void 0, function () { var _a, _b; return __generator(this, function (_c) {
    switch (_c.label) {
        case 0:
            _b = (_a = res).send;
            return [4 /*yield*/, gatewayAPI.getChannelAnchorPeers(req.params.channelName)];
        case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
    }
}); }); });
app.get('/api/chaincodes/:peerFirstLimb/:type/:workOrg', function (req, res) { return __awaiter(void 0, void 0, void 0, function () { var _a, _b; return __generator(this, function (_c) {
    switch (_c.label) {
        case 0:
            _b = (_a = res).send;
            return [4 /*yield*/, gatewayAPI.getInstalledChaincodes(req.params.peerFirstLimb, req.params.type, req.params.workOrg)];
        case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
    }
}); }); });
app.get('/api/channel-connections/:channelName', function (req, res) { return __awaiter(void 0, void 0, void 0, function () { var _a, _b; return __generator(this, function (_c) {
    switch (_c.label) {
        case 0:
            _b = (_a = res).send;
            return [4 /*yield*/, gatewayAPI.getChannelConnections(req.params.channelName)];
        case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
    }
}); }); });
// === chaincodeApi ===
app.get('/api/chaincode/instantiated/:peerFirstLimb/:type/:workOrg', function (req, res) { return __awaiter(void 0, void 0, void 0, function () { var _a, _b; return __generator(this, function (_c) {
    switch (_c.label) {
        case 0:
            _b = (_a = res).send;
            return [4 /*yield*/, gatewayAPI.getInstalledChaincodes(req.params.peerFirstLimb, req.params.type, req.params.workOrg)];
        case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
    }
}); }); });
// === invoke chaincode=== 
app.post('/api/channel/invoke/:channelName/:chaincodeName/:chaincodeFun', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                console.log(req.body);
                _b = (_a = res).send;
                return [4 /*yield*/, gatewayAPI.invokeChaincode(req.body.nodes, req.params.channelName, req.params.chaincodeName, req.params.chaincodeFun, req.body.parameters, req.body.user, req.body.peer, req.body.workOrg)];
            case 1:
                _b.apply(_a, [_c.sent()]);
                return [2 /*return*/];
        }
    });
}); });
// === query chaincode=== 
app.get('/api/channel/query/:channelName/:chaincodeName/:chaincodeFun', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                console.log(req.body);
                _b = (_a = res).send;
                return [4 /*yield*/, channelApi.queryChaincode(req.body.node, req.params.channelName, req.params.chaincodeName, req.body.parameters, req.params.chaincodeFun, req.body.user, req.body.workOrg)];
            case 1:
                _b.apply(_a, [_c.sent()]);
                return [2 /*return*/];
        }
    });
}); });
app.listen(port, function () { return console.log("Example app listening on port " + port + "!"); });
// === get transaction by id === 
app.get('/api/channel/transaction/:txID/:user/:peer/:workOrg', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _b = (_a = res).send;
                return [4 /*yield*/, channelApi.getTransactionByID(req.params.peer, req.params.txID, req.params.user, req.params.workOrg)];
            case 1:
                _b.apply(_a, [_c.sent()]);
                return [2 /*return*/];
        }
    });
}); });
app.listen(port, function () { return console.log("Example app listening on port " + port + "!"); });
//# sourceMappingURL=server.js.map