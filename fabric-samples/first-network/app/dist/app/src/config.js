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
var file = 'network-config%s.json';
var env = process.env.TARGET_NETWORK;
if (env) {
    file = util.format(file, '-' + env);
}
else {
    file = util.format(file, '');
}
exports.default = {
    networkConfigFile: file
};
//# sourceMappingURL=config.js.map