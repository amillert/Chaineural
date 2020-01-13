import * as helper from '../libs/helper';
import * as eventEmitter from './event-emitter.service'
import {ContractEvent} from '../common/models'
const logger = helper.getLogger('ContractListener');

export async function start(channel_name: string, chaincode_id: string, events_name: string[]) {
    eventEmitter.listen(channel_name, chaincode_id, events_name);
}
export async function registerChaincodeEvents(channel_name: string, chaincode_id: string, events_name: string[]){
    for (let org of Object.keys(helper.getOrgs())) {
        if (org.startsWith('org')) {
            let adminUser = await helper.getOrgAdmin(org);
            let client = helper.getClientForOrg(org)
            client.setUserContext(adminUser);
            let channel = client.getChannel(channel_name);
            let event_hubs = channel.getChannelEventHubsForOrg();
            event_hubs.forEach((eh) => {
                events_name.forEach((name) => {
                    eh.getName();
                    eh.registerChaincodeEvent(chaincode_id, name, (event, block_num, tx, status) => eventCallBack(event, block_num, tx, status, eh.getName(), org)
                    , (error) => eventError(error)
                    );
                })
                eh.connect(true);
            });
        }
    }
}
function eventCallBack(event, block_num, tx, status, peer, org){
    logger.info('Successfully got a chaincode event with transid:' + tx + ' with status:' + status);
    logger.info('Successfully got a chaincode event with payload:' + event.payload.toString());
    if (block_num) {
        logger.info('Successfully received the chaincode event on block number ' + block_num);
    } else {
        logger.info('Successfully got chaincode event ... just not the one we are looking for on block number ' + block_num);
    }
    let contractEvent:ContractEvent = {
        peer,
        org,
        event_name: event.event_name,
        tx_id:tx,
        payload: event.payload.toString(),
        block_num: block_num,
        status: status
    }
    eventEmitter.sendMessage(event.event_name, JSON.stringify(contractEvent));
}

function eventError(error){
    logger.info('Failed to receive the chaincode event ::' + error);
}