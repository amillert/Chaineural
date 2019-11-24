'use strict';
var path = require('path');
var fabricClient = require('fabric-client');
module.exports = class ClientManager{
    constructor(){
        this.client = fabricClient.loadFromConfig(path.join(__dirname, './config/common-connection-profile.yaml'));
    };
    getClientsForOrg(org_number){
        this.client.setConfigSetting('org' + org_number + '-connection-profile',path.join(__dirname, './org'+org_number+'.yaml'));
        return this.client;
    };
    getMspid(){
        return this.client.getMspid();
    }
    getPeersForOrg(org){
        return this.client.getPeersForOrg(org);
    }
    getPeer(name){
        return this.client.getPeer(name);
    }
}