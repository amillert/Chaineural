var fs = require('fs');
var path = require('path')
var fabricClient = require('../node_modules/fabric-client')
var fabricNetwork = require('../node_modules/fabric-network')
var client;

function init(){
    client = fabricClient.loadFromConfig(path.join(__dirname, '../config/connection-profile.yaml'));
}
class Channels {
    let client
    constructor()
    async getChannels(){
        let config = await client.getClientConfig();
        console.log('===TYPE===')
        console.log(typeof(config));
        console.log(config);
        console.log('===PEER FOR ORG===')
        let result = await client.getPeersForOrg();
        console.log(result);
    // result.channels.forEach(channel => {
    //     let channelName = channel.channel_id;
    //     let channelInstance = client.getChannel(channelName);

    //     let channelPeers = channel.getChannelPeers();
    // });
    }
}

init();
var channel = new Channels();
channel.getChannels();