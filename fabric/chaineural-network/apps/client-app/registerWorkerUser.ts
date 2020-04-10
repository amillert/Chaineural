/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { FileSystemWallet, Gateway, X509WalletMixin } from 'fabric-network';
import FabricClient = require('fabric-client');
import * as helper from './libs/helper';
import * as fs from 'fs';
import * as path from 'path';

const logger = helper.getLogger('registerWorkerUser');

async function main() {
    try {
        helper.init();
        for (let org of Object.keys(helper.getOrgs())) {
            if (org.lastIndexOf('org', 0) === 0) {
                logger.info(`Enroll admin for ${org}`)
                const orgCapitalized = org.charAt(0).toUpperCase() + org.slice(1)
                const ccpPath = path.resolve(__dirname, `../../connection-${org}.json`);
                const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
                const ccp = JSON.parse(ccpJSON);
                // Create a new file system based wallet for managing identities.
                const walletPath = path.join(process.cwd(), `../wallet/${org}`);
                const wallet = new FileSystemWallet(walletPath);
                console.log(`Wallet path: ${walletPath}`);

                // Check to see if we've already enrolled the user.
                const userExists = await wallet.exists('userWorker');
                if (userExists) {
                    console.log('An identity for the user "userWorker" already exists in the wallet');
                    continue;
                }

                // Check to see if we've already enrolled the admin user.
                const adminExists = await wallet.exists('admin');
                if (!adminExists) {
                    console.log('An identity for the admin user "admin" does not exist in the wallet');
                    console.log('Run the enrollAdmin.ts application before retrying');
                    continue;
                }

                // Create a new gateway for connecting to our peer node.
                const gateway = new Gateway();
                await gateway.connect(ccpPath, { wallet, identity: 'admin', discovery: { enabled: false } });
                // Get the CA client object from the gateway for interacting with the CA.
                const client = gateway.getClient();
                const ca = client.getCertificateAuthority();
                const adminUser = await client.getUserContext('admin', false);
                // Create Affiliation for org if not exists
                await helper.createAffiliationIfNotExists(org);

                // Register the user, enroll the user, and import the new identity into the wallet.
                const secret = await ca.register({ affiliation: `${org}.department1`, enrollmentID: 'userWorker', role: 'client' }, adminUser);
                const enrollment = await ca.enroll({ enrollmentID: 'userWorker', enrollmentSecret: secret });
                const userIdentity = X509WalletMixin.createIdentity(`${orgCapitalized}MSP`, enrollment.certificate, enrollment.key.toBytes());
                wallet.import('userWorker', userIdentity);
                console.log('Successfully registered and enrolled admin user "userWorker" and imported it into the wallet');
            }
        }
    } catch (error) {
        console.error(`Failed to register user "userWorker": ${error}`);
        process.exit(1);
    }
}

main();
