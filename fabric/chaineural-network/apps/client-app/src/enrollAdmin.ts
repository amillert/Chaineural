import FabricCAServices from 'fabric-ca-client';
import { FileSystemWallet, X509WalletMixin } from 'fabric-network';
import * as helper from './libs/helper';
import * as fs from 'fs';
import * as path from 'path';

const logger = helper.getLogger('enrollAdmin');

async function main() {
    try {
        helper.init();
        for (let org of Object.keys(helper.getOrgs())) {
            if (org.lastIndexOf('org', 0) === 0) {
                logger.info(`Enroll admin for ${org}`)
                const orgCapitalized = org.charAt(0).toUpperCase() + org.slice(1)
                const ccpPath = path.resolve(__dirname, `../../../connection-${org}.json`);
                const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
                const ccp = JSON.parse(ccpJSON);

                // Create a new CA client for interacting with the CA.
                const caInfo = ccp.certificateAuthorities[`ca.${org}.example.com`];
                const caTLSCACerts = caInfo.tlsCACerts.pem;
                const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

                // Create a new file system based wallet for managing identities.
                const walletPath = path.join(process.cwd(), `../../wallet/${org}`);
                const wallet = new FileSystemWallet(walletPath);
                console.log(`Wallet path: ${walletPath}`);

                // Check to see if we've already enrolled the admin user.
                const adminExists = await wallet.exists('admin');
                if (adminExists) {
                    console.log('An identity for the admin user "admin" already exists in the wallet');
                }
                else {
                    // Enroll the admin user, and import the new identity into the wallet.
                    const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
                    const identity = X509WalletMixin.createIdentity(`${orgCapitalized}MSP`, enrollment.certificate, enrollment.key.toBytes());
                    wallet.import('admin', identity);
                    console.log('Successfully enrolled admin user "admin" and imported it into the wallet');
                }

            }
        }
    } catch (error) {
        console.error(`Failed to enroll admin user "admin": ${error}`);
        process.exit(1);
    }
}

main();