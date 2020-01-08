'use strict';
// === NODE JS LIBRARIES ===
var fs = require('fs');
var path = require('path')
// === HLF ===
const { FileSystemWallet, Gateway, Wallet } = require('fabric-network');
import FabricClient = require("fabric-client");
import FabricCAServices = require("fabric-ca-client");
var fabricCAClient = require('fabric-ca-client')
// === MODELS ===
import Models = require("./common/models");
import GraphModels = require("./common/ngx-graph/models");
// === API ===
import * as helper from './libs/helper';
import * as channel from './libs/channel';
import * as chaincode from './libs/chaincode';
import * as akkaService from './services/akka.service';
import { BlockInfo } from "./common/models";



const logger = helper.getLogger('Logic');
class Logic {
    client: FabricClient;
    fabricCAClients: FabricCAServices[] = [];
    listener
    // orgsConnectionProfilesPaths: string[]
    constructor() {
        helper.init();
        // this.orgsConnectionProfilesPaths = [
        //     path.join(__dirname, './config/org1.yaml'),
        //     path.join(__dirname, './config/org2.yaml'),
        //     path.join(__dirname, './config/org3.yaml')
        // ]
        this.client = helper.getClientWithLoadedCommonProfile();
        // for (let pathProfile of this.orgsConnectionProfilesPaths) {
        //     this.client.loadFromConfig(pathProfile);
        // };
        for (const caClientUrl of this.getAllCertificateAuthoritiesUrls()) {
            this.fabricCAClients.push(new FabricCAServices(caClientUrl))
        }
    };

    getAllAnchorPeersObjects(): FabricClient.Peer[] {
        let configObj = helper.getConfigObject()
        let peers: FabricClient.Peer[] = [];
        for (let name of Object.keys(configObj.peers)) {
            peers.push(this.client.getPeer(name));
        }

        return peers;
    };
    getAllCertificateAuthoritiesUrls(): string[] {
        let configObj = helper.getConfigObject()
        let ca: string[] = [];
        for (let value of Object.values(configObj.certificateAuthorities) as any) {
            ca.push(value.url);
        }
        return ca;
    };
    getAllOrgsMspids(): string[] {
        let configObj = helper.getConfigObject()
        let orgsMspids: string[] = [];
        for (let orgValue of Object.values(configObj.organizations) as any) {
            orgsMspids.push(orgValue.mspid);
        }
        return orgsMspids;
    };
    getAllPeers(): FabricClient.Peer[] {
        let peers: FabricClient.Peer[] = [];
        let allOrgsMspids = this.getAllOrgsMspids();
        for (let orgMspid of allOrgsMspids) {
            let peersForOrg = this.client.getPeersForOrg(orgMspid);
            peers = peers.concat(peersForOrg);
        }
        return peers;
    }

    getAllChannels(): string[] {
        return helper.getAllChannels();
    }

    getPeerForChannel(channelName: string): string[] {
        return this.getAllPeers().map(a => a.getName());
    }

    getAdminCredentialsForOrg(mspid: string): [string, string] {
        let configObj = helper.getConfigObject()
        let credentials: [string, string] = ['', ''];
        for (let orgValue of Object.values(configObj.organizations) as any) {
            if (orgValue.mspid == mspid) {
                let adminPrivateKey = fs.readFileSync(path.join(orgValue.adminPrivateKey.path))
                let adminCert = fs.readFileSync(path.join(orgValue.signedCert.path))
                credentials = [adminPrivateKey, adminCert];
                break;
            }
        }
        return credentials;
    }
    async getChannelsBlockchainInfo(channels: FabricClient.Channel[]) {
        let allChannels: FabricClient.Channel[] = [];
        var map = new Map<string, [[string, string], FabricClient.Channel[]]>();
        //                 KEY     ADM KEY, ADM CERT, CHANNELS
        for (let channel of channels) {
            for (let channelPeer of channel.getChannelPeers()) {
                let channelMspId = channelPeer.getMspid();
                let namesForMspid = map.get(channelMspId);
                if (namesForMspid != undefined) {
                    namesForMspid[1].push(channel);
                    allChannels.push(channel);
                } else {
                    let channelExistsInMap = allChannels.includes(channel);
                    if (!channelExistsInMap) {
                        let adminCredentials = this.getAdminCredentialsForOrg(channelMspId);
                        map.set(channelMspId, [adminCredentials, [channel]]);
                        allChannels.push(channel);
                    }
                }
            }
        }
        await map.forEach(async (value: [[string, string], FabricClient.Channel[]], key: string) => {
            // this.client = fabricClient.loadFromConfig(value[0]);
            for (let channel of value[1]) {
                this.client.setAdminSigningIdentity(value[0][0], value[0][1], key);
                var blockchainInfo = await channel.queryInfo(undefined, true);
            }
        });
    }
    async getChannelBlocksHashes(channelName: string, amount: number, peer: string, userOrg:string): Promise<BlockInfo[]> {
        try {
            let channel = await this.client.getChannel(channelName);
            let peerObj = helper.getChannelForOrg(userOrg).getPeer(peer).getPeer();
            let mspid = helper.getMspID(userOrg);
            let adminCredentials = this.getAdminCredentialsForOrg(mspid);
            this.client.setAdminSigningIdentity(adminCredentials[0], adminCredentials[1], mspid);
            let blocksHashes: BlockInfo[] = [];
            var blockchainInfo = await channel.queryInfo(undefined, true);
            blocksHashes.push({ hash: blockchainInfo.currentBlockHash.toString('hex'), number: blockchainInfo.height.low });
            for (let i = blockchainInfo.height.low - 1; i >= 0; i--) {
                let block = await channel.queryBlock(i, peerObj, true, false);
                let blockHash = block.header.previous_hash.toString('hex');
                if (blockHash !== '') {
                    blocksHashes.push({ hash: blockHash, number: i });
                }
                if (blocksHashes.length === amount) {
                    break;
                }
            }
            blocksHashes = blocksHashes.reverse();

            return blocksHashes;
        }
        catch (e) {
            console.error(e);
            return [];
        }
    }

    async getChannelAnchorPeers(channelName: string): Promise<Models.PeerOrg[]> {
        try {
            let channel = await this.client.getChannel(channelName);
            let channelPeers = channel.getChannelPeers();
            let peersOrg: Models.PeerOrg[] = [];
            for (let i = 0; i < channelPeers.length; i++) {
                let peerOrg: Models.PeerOrg = {
                    id: i + 1,
                    name: channelPeers[i].getName(),
                    endpoint: channelPeers[i].getUrl(),
                    org: channelPeers[i].getMspid()
                }
                peersOrg.push(peerOrg);
            }
            return peersOrg;
        }
        catch (e) {
            console.error(e);
            return [];
        }
    }

    async getChannelConnections(channelName) {
        try {
            let channel = await this.client.getChannel(channelName);
            let channelPeers = channel.getChannelPeers();

            let allOrgs: { mspId: string, value: { 'peers': Array<{ 'mspid': string; 'endpoint': string; }>; }; }[] = [];
            for (let channelPeer of channelPeers) {
                let adminCredentials = this.getAdminCredentialsForOrg(channelPeer.getMspid());
                this.client.setAdminSigningIdentity(adminCredentials[0], adminCredentials[1], channelPeer.getMspid());
                let request: FabricClient.PeerQueryRequest = {
                    target: channelPeer.getPeer(),
                    useAdmin: true
                }
                let queryPeer = await this.client.queryPeers(request) as any;
                let orgsDict = queryPeer.local_peers as { [mspId: string]: { 'peers': Array<{ 'mspid': string; 'endpoint': string; }>; }; }
                for (let [mspId, value] of Object.entries(orgsDict)) {
                    allOrgs.push({ mspId, value });
                }
            }
            let count = 0;
            let array: { 'mspid': string; 'endpoint': string }[] = [];
            let values = allOrgs.map((a, index) => ({ 'length': a.value.peers.length, 'index': index, 'mspid': a.mspId }));
            let indexesToMove: number[] = [];
            let i = 0;
            for (let item of values) {
                let mspids = values.filter(a => a.mspid == item.mspid);
                if (mspids.length > channelPeers.length - 1) {
                    const max = mspids.reduce((prev, current) => (prev.length > current.length) ? prev : current)
                    if (!indexesToMove.includes(max.index)) indexesToMove.push(max.index);
                }
            }
            allOrgs = allOrgs.filter((a, index) => indexesToMove.includes(index));
            let anchorPeers = await this.getChannelAnchorPeers(channelName);
            let currentConnections: [string, string][] = [];
            let links: GraphModels.Link[] = [];
            for (let peer of anchorPeers) {
                for (let peer1 of anchorPeers) {
                    if (peer != peer1 && !currentConnections.includes([peer1.name, peer.name])) {
                        let link: GraphModels.Link = {
                            id: this.makeRandomString(),
                            source: peer1.name,
                            target: peer.name,
                            label: channelName
                        }
                        links.push(link);
                        currentConnections.push([link.source, link.target]);
                        currentConnections.push([link.target, link.source]);
                    };
                };
            };
            for (let org of allOrgs) {
                let peers = org.value.peers;
                for (let peer of peers) {
                    for (let peer1 of peers) {
                        if (peer != peer1
                            && !currentConnections.includes([peer1.endpoint.substr(0, peer1.endpoint.indexOf(':')), peer.endpoint.substr(0, peer.endpoint.indexOf(':'))])
                            && !currentConnections.includes([peer.endpoint.substr(0, peer.endpoint.indexOf(':')), peer1.endpoint.substr(0, peer1.endpoint.indexOf(':'))])) {
                            let link: GraphModels.Link = {
                                id: this.makeRandomString(),
                                source: peer1.endpoint.substr(0, peer1.endpoint.indexOf(':')),
                                target: peer.endpoint.substr(0, peer.endpoint.indexOf(':')),
                                label: 'internal connection'
                            }
                            links.push(link);
                            currentConnections.push([peer1.endpoint.substr(0, peer1.endpoint.indexOf(':')), peer.endpoint.substr(0, peer.endpoint.indexOf(':'))]);
                        }
                    }
                }
            };
            let nodess: GraphModels.Node[] = [];
            for (let org of allOrgs) {
                let peers = org.value.peers.map(peer => (
                    {
                        id: peer.endpoint.substr(0, peer.endpoint.indexOf(':')),
                        label: peer.endpoint.substr(0, peer.endpoint.indexOf(':'))
                    }) as GraphModels.Node);
                nodess = nodess.concat(peers);
            }
            const graph: GraphModels.Graph = {
                clusters: allOrgs.map(org => ({
                    id: org.mspId,
                    label: org.mspId,
                    childNodeIds: org.value.peers.map(peer => peer.endpoint.substr(0, peer.endpoint.indexOf(':')))
                }) as GraphModels.Organization),
                nodes: nodess,
                links: links
            };
            console.log(graph);
            return graph;
        }
        catch (e) {
            console.error(e);
            return [];
        }

        // {links: "", nodes: "", organizations: Or}
    }

    async getChannelInstantiatedChaincodes(channelName: string) {
        try {
            let channel = await this.client.getChannel(channelName);
            let channelPeer = await channel.getChannelPeers()[0].getPeer();
            let instantiatedChaincodes = await channel.queryInstantiatedChaincodes(channelPeer, true);
            return { result: instantiatedChaincodes.chaincodes.length };
        }
        catch (e) {
            console.error(e);
            return { result: -1 };
        }
    }

    async getInstalledChaincodes(
        peer: string, type: string, org: string) {
            const users = FabricClient.getConfigSetting('admins');
            const username = users[0].username;
            return chaincode.getInstalledChaincodes(peer, type, username, org);
        }

    async invokeChaincode(peerOrgPairs: [string, string][], channelName: string,
        chaincodeName: string, fcn: string, args: string[], username: string, peer:string, fromOrg: string) {
        return channel.invokeChaincode(peerOrgPairs, channelName, chaincodeName, fcn, args, username, peer, fromOrg);
    }

    
    async startLearning(peer: string, trxnID: string, username: string, org: string) {
        let transaction = await channel.getTransactionByID(peer, trxnID, username, org);
        return await akkaService.startLearning(transaction);
    }

    async getMinibatchAmount(minibatchSize: string) {
        return await akkaService.getMinibatchAmount(minibatchSize);
    }

    async enrollAdminsOnAllCA() {
        await this.client.initCredentialStores();
        for (const caClient of this.fabricCAClients) {
            let user = await this.client.getUserContext('admin', true);
            if (user) {
                console.log("Admin already exists");
                return this.client.setUserContext(user);
            } else {
                let enrollment = await caClient.enroll({
                    enrollmentID: 'admin',
                    enrollmentSecret: 'adminpw',
                    attr_reqs: [
                        { name: "hf.Registrar.Roles", optional: false },
                        { name: "hf.Registrar.Attributes", optional: false }
                    ]
                });
                console.log('Successfully enrolled admin user "admin"');
            }
        }
    }
    async getAdminCreateIfNotExist() {
        await this.client.initCredentialStores();
        let user = await this.client.getUserContext('admin', true);
        if (user) {
            console.log("Admin already exists");
            return this.client.setUserContext(user);
        } else {
            let enrollment = await fabricCAClient.enroll({
                enrollmentID: 'admin',
                enrollmentSecret: 'adminpw',
                attr_reqs: [
                    { name: "hf.Registrar.Roles", optional: false },
                    { name: "hf.Registrar.Attributes", optional: false }
                ]
            });
            console.log('Successfully enrolled admin user "admin"');
            let createdUser = await this.client.createUser(
                {
                    username: 'admin',
                    mspid: 'Org1MSP',
                    cryptoContent: { privateKeyPEM: enrollment.key.toBytes(), signedCertPEM: enrollment.certificate },
                    skipPersistence: true
                });
            return this.client.setUserContext(createdUser);
        }
    }

    async initEpochsLedger() {
        // connect to the network connection file
        const ccpPath = path.join(__dirname, '../../network-config.json');
        const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
        const connectionProfile = JSON.parse(ccpJSON);


        //A wallet stores a collection of identities for use with local wallet
        const walletPath = path.join(__dirname, '../wallet/org2');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        const peerIdentity = 'userWorker';

        try {

            let response;

            // Check to see if we've already enrolled the user.
            const userExists = await wallet.exists(peerIdentity);
            if (!userExists) {
                console.log('An identity for the user ' + peerIdentity + ' does not exist in the wallet');
                console.log('Run the registerUser.js application before retrying');
                response.error = 'An identity for the user ' + peerIdentity + ' does not exist in the wallet. Register ' + peerIdentity + ' first';
                return response;
            }

            //connect to Fabric Network, but starting a new gateway
            const gateway = new Gateway();
            //use our config file, our peerIdentity, and our discovery options to connect to Fabric network.
            await gateway.connect(connectionProfile, {
                wallet,
                identity: peerIdentity,
                discovery: {enabled: false}
            });
            
            //connect to our channel that has been created on IBM Blockchain Platform
            const network = await gateway.getNetwork('mainchannel');
            //connect to our insurance contract that has been installed / instantiated on IBM Blockchain Platform
            const contract = await network.getContract('chaineuralcc');
            console.log('contract listener')
            await contract.addContractListener('chaineuralcc-listener', 'InitEpochsLedgerEvent', (err, event, blockNumber, transactionId, status) => {
                if (err) {
                    console.error(err);
                    return;
                }

                //convert event to something we can parse 
                event = event.payload.toString();
                event = JSON.parse(event)
                //where we output the TradeEvent
            //     console.log('************************ Start Trade Event *******************************************************');
            //     console.log(`type: ${event.type}`);
            //     console.log(`ownerId: ${event.ownerId}`);
            //     console.log(`id: ${event.id}`);
            //     console.log(`description: ${event.description}`);
            //     console.log(`status: ${event.status}`);
            //     console.log(`amount: ${event.amount}`);
            //     console.log(`buyerId: ${event.buyerId}`);
            //     console.log(`Block Number: ${blockNumber} Transaction ID: ${transactionId} Status: ${status}`);
            //     console.log('************************ End Trade Event ************************************');
            });

            // var sellerEmail = "auction@acme.org";
            // var sellerName = "ACME";
            // var sellerBalance = "100";
            const initEpochsLedgerResponse = await contract.submitTransaction('queryAllData');
            console.log('initEpochsLedgerResponse: ');
            console.log(initEpochsLedgerResponse);
            console.log(JSON.parse(initEpochsLedgerResponse.toString()));
            // var memberAEmail = "memberA@acme.org";
            // var memberAFirstName = "Amy";
            // var memberALastName = "Williams";
            // var memberABalance = "1000";

            // //addMember - this is the person that can bid on the item
            // const addMemberAResponse = await contract.submitTransaction('AddMember', memberAEmail, memberAFirstName, memberALastName, memberABalance);

            // var memberBEmail = "memberB@acme.org";
            // var memberBFirstName = "Billy";
            // var memberBLastName = "Thompson";
            // var memberBBalance = "1000";

            // //addMember - this is the person that will compete in bids to win the auction
            // const addMemberBResponse = await contract.submitTransaction('AddMember', memberBEmail, memberBFirstName, memberBLastName, memberBBalance);

            // var productId = "p1";
            // var description = "Sample Product";

            // //addProduct - add a product that people can bid on
            // const addProductResponse = await contract.submitTransaction('AddProduct', productId, description, sellerEmail);

            // var listingId = "l1";
            // var reservePrice = "50";
            // //start the auction
            // const startBiddingResponse = await contract.submitTransaction('StartBidding', listingId, reservePrice, productId);

            // var memberA_bidPrice = "50";
            // //make an offer
            // const offerAResponse = await contract.submitTransaction('Offer', memberA_bidPrice, listingId, memberAEmail);

            // var memberB_bidPrice = "100";
            // const offerBResponse = await contract.submitTransaction('Offer', memberB_bidPrice, listingId, memberBEmail);

            // const closebiddingResponse = await contract.submitTransaction('CloseBidding', listingId);
            // console.log('closebiddingResponse: ');
            // console.log(JSON.parse(closebiddingResponse.toString()));
            // console.log('Transaction to close the bidding has been submitted');

            // Disconnect from the gateway.
            await gateway.disconnect();

        } catch (error) {
            console.error(`Failed to submit transaction: ${error}`);
        }
    }

    makeRandomString(): string {
        let outString: string = '';
        let inOptions: string = 'abcdefghijklmnopqrstuvwxyz';

        for (let i = 0; i < 32; i++) {

            outString += inOptions.charAt(Math.floor(Math.random() * inOptions.length));

        }

        return outString;
    }
}
export = Logic;