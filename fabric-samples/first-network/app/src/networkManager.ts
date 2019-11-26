'use strict';

import Client = require("fabric-client");
import FabricCAServices = require("fabric-ca-client");
import Models = require("../../common/models");
import GraphModels = require("../../common/ngx-graph/models");
import { allocate } from "bytebuffer";
var fs = require('fs');
var path = require('path')
var yaml = require('js-yaml');
var express = require("./node_modules/express");
var fabricClient = require('./node_modules/fabric-client')
var fabricCAClient = require('./node_modules/fabric-ca-client')
class NetworkManager {
    client: Client;
    fabricCAClients: FabricCAServices[] = [];
    commonConnectionProfilePath: string;
    allChannels: string[];
    // orgsConnectionProfilesPaths: string[]
    constructor() {
        this.commonConnectionProfilePath = path.join(__dirname, './config/common-connection-profile.yaml');
        // this.orgsConnectionProfilesPaths = [
        //     path.join(__dirname, './config/org1.yaml'),
        //     path.join(__dirname, './config/org2.yaml'),
        //     path.join(__dirname, './config/org3.yaml')
        // ]
        this.client = new Client();
        this.client = fabricClient.loadFromConfig(this.commonConnectionProfilePath);
        // for (let pathProfile of this.orgsConnectionProfilesPaths) {
        //     this.client.loadFromConfig(pathProfile);
        // };
        for (const caClientUrl of this.getAllCertificateAuthoritiesUrls()) {
            this.fabricCAClients.push(new FabricCAServices(caClientUrl))
        }
        this.allChannels = this.getAllChannels();
    };
    getConfigObject() {
        const config = yaml.safeLoad(fs.readFileSync(this.commonConnectionProfilePath, 'utf8'));
        const configJson = JSON.stringify(config, null, 4);
        return JSON.parse(configJson);
    }
    getAllAnchorPeersObjects(): Client.Peer[] {
        let configObj = this.getConfigObject()
        let peers: Client.Peer[] = [];
        for (let name of Object.keys(configObj.peers)) {
            peers.push(this.client.getPeer(name));
        }
        return peers;
    };
    getAllCertificateAuthoritiesUrls(): string[] {
        let configObj = this.getConfigObject()
        let ca: string[] = [];
        for (let value of Object.values(configObj.certificateAuthorities) as any) {
            ca.push(value.url);
        }
        return ca;
    };
    getAllOrgsMspids(): string[] {
        let configObj = this.getConfigObject()
        let orgsMspids: string[] = [];
        for (let orgValue of Object.values(configObj.organizations) as any) {
            orgsMspids.push(orgValue.mspid);
        }
        return orgsMspids;
    };
    getAllPeers(): Client.Peer[] {
        let peers: Client.Peer[] = [];
        let allOrgsMspids = this.getAllOrgsMspids();
        for (let orgMspid of allOrgsMspids) {
            let peersForOrg = this.client.getPeersForOrg(orgMspid);
            peers = peers.concat(peersForOrg);
        }
        return peers;
    }
    // getAllPeersWithOrgMspId(): [Client.Peer,string][] {
    //     let peers: [Client.Peer,string][] = [];
    //     let allOrgsMspids = this.getAllOrgsMspids();
    //     for (let orgMspid of allOrgsMspids) {
    //         let peersForOrg = this.client.getPeersForOrg(orgMspid);
    //         for(let peerForOrg of peersForOrg){
    //             let peerWithOrgMspid:[Client.Peer,string]  = [peerForOrg, orgMspid];
    //             peers.push(peerWithOrgMspid);
    //         };
    //     }
    //     return peers;
    // }
    getAllChannels(): string[] {
        let configObj = this.getConfigObject()
        let channels: string[] = [];
        for (let channel of Object.keys(configObj.channels) as any) {
            channels.push(channel);
        }
        return channels;
    }
    getAdminCredentialsForOrg(mspid: string): [string, string] {
        let configObj = this.getConfigObject()
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
    async getChannelsBlockchainInfo(channels: Client.Channel[]) {
        let allChannels: Client.Channel[] = [];
        var map = new Map<string, [[string, string], Client.Channel[]]>();
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
                        console.log(adminCredentials);
                        map.set(channelMspId, [adminCredentials, [channel]]);
                        allChannels.push(channel);
                    }
                }
            }
        }
        console.log(map);
        await map.forEach(async (value: [[string, string], Client.Channel[]], key: string) => {
            // this.client = fabricClient.loadFromConfig(value[0]);
            for (let channel of value[1]) {
                this.client.setAdminSigningIdentity(value[0][0], value[0][1], key);
                console.log(this.client.getClientConfig());
                console.log(channel.getName());
                var blockchainInfo = await channel.queryInfo(undefined, true);
                console.log(blockchainInfo.height);
                console.log('====')
                console.log(blockchainInfo.currentBlockHash);
                console.log('====')
                console.log(blockchainInfo.previousBlockHash);
                console.log('====')
                console.log(blockchainInfo.currentBlockHash.toString('hex'));
                console.log('==3==')
                console.log(await channel.queryBlockByHash(blockchainInfo.currentBlockHash, "peer0.org2.example.com", true));
                console.log('====')
                console.log(blockchainInfo.previousBlockHash.toString('hex'));
            }
        });
    }
    async getChannelBlocksHashes(channelName: string, amount: number): Promise<string[]> {
        try {
            let channel = await this.client.getChannel(channelName);
            let channelPeer = channel.getChannelPeers()[0];
            let channelMspID = channelPeer.getMspid();
            let adminCredentials = this.getAdminCredentialsForOrg(channelMspID);
            this.client.setAdminSigningIdentity(adminCredentials[0], adminCredentials[1], channelPeer.getMspid());
            let blocksHashes: string[] = [];
            var blockchainInfo = await channel.queryInfo(undefined, true);
            blocksHashes.push(blockchainInfo.currentBlockHash.toString('hex'));
            for (let i = blockchainInfo.height.low - 1; i >= 0; i--) {
                let block = await channel.queryBlock(i, channelPeer.getPeer(), true, false);
                blocksHashes.push(block.header.previous_hash.toString('hex'));
            }
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
                let request: Client.PeerQueryRequest = {
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
            console.log(allOrgs);
            let values = allOrgs.map((a, index) => ({ 'length': a.value.peers.length, 'index': index, 'mspid': a.mspId }));
            let indexesToMove: number[] = [];
            let i = 0;
            console.log('===')
            console.log(values);
            for (let item of values) {
                let mspids = values.filter(a => a.mspid == item.mspid);
                if (mspids.length > channelPeers.length - 1) {
                    const max = mspids.reduce((prev, current) => (prev.length > current.length) ? prev : current)
                    if (!indexesToMove.includes(max.index)) indexesToMove.push(max.index);
                }
            }
            console.log(indexesToMove);
            allOrgs = allOrgs.filter((a, index) => indexesToMove.includes(index));
            console.log('====');
            console.log(allOrgs);
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
                    console.log("00000");
                    console.log(org.mspId)
                    console.log("11111");
                    console.log(peer);
                    console.log("22222");
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

    makeRandomString(): string {
        let outString: string = '';
        let inOptions: string = 'abcdefghijklmnopqrstuvwxyz';

        for (let i = 0; i < 32; i++) {

            outString += inOptions.charAt(Math.floor(Math.random() * inOptions.length));

        }

        return outString;
    }
}
export = NetworkManager;