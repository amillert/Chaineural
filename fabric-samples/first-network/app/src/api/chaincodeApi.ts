import * as chaincode from '../libs/chaincode';
import * as helper from '../libs/helper';
import { ChaincodeInfo } from 'common/models';

// tslint:disable-next-line:no-var-requires
// const config = require('../app_config.json');
const logger = helper.getLogger('ChaincodeApi');

export async function getInstantiatedChaincodesForChannel(channelName) {
    let orgs = helper.getOrgs();
    let allInstantiated: ChaincodeInfo[] = []
    for(let [orgKey, value] of Object.entries(orgs) as any) {
        console.log(orgKey)
        for (const peerKey in orgs[orgKey].peers) {
            let instantiatedList = await chaincode.getInstalledChaincodes(peerKey, 'instantiated','admin', orgKey) as ChaincodeInfo[]
            for (const chaincode of instantiatedList) {
                var index = allInstantiated.findIndex(x => x.name == chaincode.name);
                if (index === -1){
                    allInstantiated.push(chaincode);
                }
            }
        }
    }
    return allInstantiated;
}