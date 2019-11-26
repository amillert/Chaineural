import * as util from 'util';

let file = 'network-config%s.json';

const env = process.env.TARGET_NETWORK;
if (env) {
    file = util.format(file, '-' + env);
} else {
    file = util.format(file, '');
}

export default {
    networkConfigFile: file
};