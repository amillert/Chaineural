"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var log4js = require("log4js");
var path = __importStar(require("path"));
var fs = __importStar(require("fs"));
var yaml = __importStar(require("js-yaml"));
var Client = require("fabric-client");
var logger = log4js.getLogger('Helper');
logger.setLevel('DEBUG');
FabricClient.setLogger(logger);
//common connection profile
var commonConnectionProfilePath;
var client;
function init() {
    commonConnectionProfilePath = path.join(__dirname, '../../config', 'common-connection-profile.yaml');
    client.loadFromConfig('test/fixtures/org1.yaml');
}
exports.init = init;
function getLogger(moduleName) {
    var moduleLogger = log4js.getLogger(moduleName);
    moduleLogger.setLevel('DEBUG');
    return moduleLogger;
}
exports.getLogger = getLogger;
function getClientWithLoadedCommonProfile(org) {
    var client = new Client();
    client = FabricClient.loadFromConfig(commonConnectionProfilePath);
    // client
    if (org != null) {
        var clientConfig = path.join(__dirname, "../../config/" + org + ".yaml");
        client.loadFromConfig(clientConfig);
    }
    client.initCredentialStores();
    return client;
}
exports.getClientWithLoadedCommonProfile = getClientWithLoadedCommonProfile;
function getConfigObject() {
    var config = yaml.safeLoad(fs.readFileSync(commonConnectionProfilePath, 'utf8'));
    var configJson = JSON.stringify(config, null, 4);
    return JSON.parse(configJson);
}
exports.getConfigObject = getConfigObject;
//# sourceMappingURL=helperClient.js.map