"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var util = __importStar(require("util"));
var path = require('path');
var hfc = require('fabric-client');
var file = 'network-config%s.json';
var env = process.env.TARGET_NETWORK;
if (env) {
    file = util.format(file, '-' + env);
}
else {
    file = util.format(file, '');
}
// indicate to the application where the setup file is located so it able
// to have the hfc load it to initalize the fabric client instance
console.log('============= CONFIG =============');
hfc.setConfigSetting('network-connection-profile-path', path.join(__dirname, '../../', file));
hfc.setConfigSetting('Org1-connection-profile-path', path.join(__dirname, '../../', 'org1.yaml'));
hfc.setConfigSetting('Org2-connection-profile-path', path.join(__dirname, '../../', 'org2.yaml'));
hfc.setConfigSetting('Org3-connection-profile-path', path.join(__dirname, '../../', 'org3.yaml'));
hfc.setConfigSetting('Org4-connection-profile-path', path.join(__dirname, '../../', 'org4.yaml'));
exports.default = {
    networkConfigFile: file
};
//# sourceMappingURL=config.js.map