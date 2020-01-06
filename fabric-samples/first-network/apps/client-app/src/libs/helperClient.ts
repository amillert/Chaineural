import log4js = require('log4js');
import * as path from 'path';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import Client = require('fabric-client');

const logger = log4js.getLogger('Helper');
logger.setLevel('DEBUG');
FabricClient.setLogger(logger);
//common connection profile
let commonConnectionProfilePath: any;
let client: Client;
export function init() {
    commonConnectionProfilePath = path.join(__dirname, '../../config' ,'common-connection-profile.yaml')
    client.loadFromConfig('test/fixtures/org1.yaml');

}

export function getLogger(moduleName: string) {
    const moduleLogger = log4js.getLogger(moduleName);
    moduleLogger.setLevel('DEBUG');
    return moduleLogger;
}

export function getClientWithLoadedCommonProfile(org?: string) {
    let client = new Client();
    client = FabricClient.loadFromConfig(commonConnectionProfilePath);

    // client
    if (org != null) {
        let clientConfig = path.join(__dirname, `../../config/${org}.yaml`)
        client.loadFromConfig(clientConfig);
    }
    client.initCredentialStores();
    return client;
}

export function getConfigObject() {
    const config = yaml.safeLoad(fs.readFileSync(commonConnectionProfilePath, 'utf8'));
    const configJson = JSON.stringify(config, null, 4);
    return JSON.parse(configJson);
}