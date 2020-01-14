async function createAffiliationIfNotExists(userOrg: string, client: Client) {
    let adminUserObj = await getAdminUser(userOrg);
    
    let caClient = client.getCertificateAuthority();
    let affiliationService = caClient.newAffiliationService();
    
    let registeredAffiliations = await affiliationService.getAll(adminUserObj) as any;
    if (!registeredAffiliations.result.affiliations.some(
        x => x.name == userOrg.toLowerCase())) {
            let affiliation = `${userOrg}.department1`;
            await affiliationService.create({
                name: affiliation,
                force: true
            }, adminUserObj);
        }
}

import { Gateway, FileSystemWallet, X509WalletMixin } from 'fabric-network';
import * as path from 'path';
import Client = require('fabric-client');
const org = 'org3';
const orgCapitalized = org.charAt(0).toUpperCase() + org.slice(1);
const ccpPath = path.resolve(__dirname, `../../../connection-${org}.json`);

async function main() {
    try {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), `../../wallet/${org}`);
        const wallet = await new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userIdentity = await wallet.exists('user1');
        if (userIdentity) {
            console.log('An identity for the user "user1" already exists in the wallet');
            return;
        }

        // Check to see if we've already enrolled the admin user.
        const adminIdentity = await wallet.exists('admin');
        if (!adminIdentity) {
            console.log('An identity for the admin user "admin" does not exist in the wallet');
            console.log('Run the enrollAdmin.ts application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: true } });

        // Get the CA client object from the gateway for interacting with the CA.
        const client = gateway.getClient();
        const ca = client.getCertificateAuthority();
        const adminUser = await client.getUserContext('admin', false);

        await createAffiliationIfNotExists(org, client);
        // Register the user, enroll the user, and import the new identity into the wallet.
        const secret = await ca.register({ affiliation: `${org}.department1`, enrollmentID: 'user1', role: 'client' }, adminUser);
        const enrollment = await ca.enroll({ enrollmentID: 'user1', enrollmentSecret: secret });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: `${orgCapitalized}MSP`,
            type: 'X.509',
        };
        await wallet.import('user1', x509Identity);
        console.log('Successfully registered and enrolled admin user "user1" and imported it into the wallet');

    } catch (error) {
        console.error(`Failed to register user "user1": ${error}`);
        process.exit(1);
    }
}

main();