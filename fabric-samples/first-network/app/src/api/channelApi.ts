import * as channel from '../libs/channel';
import * as helper from '../libs/helper';

// tslint:disable-next-line:no-var-requires
// const config = require('../app_config.json');
const logger = helper.getLogger('ChannelApi');

export async function invokeChaincode(peerOrgPairs: [string,string][], channelName: string,
    chaincodeName: string, fcn: string, args: string[], username: string, fromOrg: string) {
    return channel.invokeChaincode(peerOrgPairs, channelName, chaincodeName, fcn, args, username, fromOrg);
}

export async function queryChaincode(peer: string, channelName: string, chaincodeName: string,
    args: string[], fcn: string, username: string, org: string) {
    return channel.queryChaincode(peer, channelName, chaincodeName,
        args, fcn, username, org);
}
