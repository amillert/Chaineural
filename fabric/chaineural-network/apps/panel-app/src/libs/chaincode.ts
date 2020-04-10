import * as util from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as helper from './helper';
import { Peer, ChaincodeQueryResponse } from 'fabric-client';
import { ChaincodeInfo } from 'common/models';

// tslint:disable-next-line:no-var-requires
// const config = require('../app_config.json');
const logger = helper.getLogger('ChaincodeLib');

function buildTarget(peer: string, org: string): Peer | undefined {
    let target: Peer | undefined = undefined;
    if (typeof peer !== 'undefined') {
        const targets: Peer[] = helper.newPeers([peer], org);
        if (targets && targets.length > 0) {
            target = targets[0];
        }
    }

    return target;
}

export async function getInstalledChaincodes(
    peer: string, type: string, username: string, org: string) {

    const target = buildTarget(peer, org);
    const channel = helper.getChannelForOrg(org);
    const client = helper.getClientForOrg(org);

    const user = await helper.getOrgAdmin(org);

    try {

        let response: ChaincodeQueryResponse | null = null;

        if (type === 'installed') {
            response = await client.queryInstalledChaincodes(target as Peer);
        } else {
            response = await channel.queryInstantiatedChaincodes(target as Peer);
        }

        if (response) {
            if (type === 'installed') {
                logger.debug('<<< Installed Chaincodes >>>');
            } else {
                logger.debug('<<< Instantiated Chaincodes >>>');
            }

            const details: ChaincodeInfo[] = [];
            response.chaincodes.forEach((c) => {
                logger.debug('name: ' + c.name + ', version: ' +
                    c.version + ', path: ' + c.path
                );
                details.push({
                    name: c.name,
                    version: c.version
                }
                );
            });
            return details;
        } else {
            logger.error('response is null');
            return 'response is null';
        }

    } catch (err) {
        logger.error('Failed to query with error:' + err.stack ? err.stack : err);
        return 'Failed to query with error:' + err.stack ? err.stack : err;
    }
}