'use strict';
const express = require('express')
var cors = require ('cors');
const app = express()
const port = 3001;
import NetworkManager from './networkManager';

var networkManager = new NetworkManager();
app.use(cors({
    origin:['http://localhost:4200','http://127.0.0.1:4200']
}));

app.use(function (req, res, next) {

  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Headers', true);
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  next();
});
app.get('/api/channels', (req, res) => res.send(networkManager.getAllChannels()));
app.get('/api/channel-blocks-hashes/:channelName', async (req, res) => res.send(await networkManager.getChannelBlocksHashes(req.params.channelName, 10)));
app.get('/api/anchor-peers/:channelName',async (req, res) => res.send(await networkManager.getChannelAnchorPeers(req.params.channelName)));
app.get('/api/chaincodes/:channelName',async (req, res) => res.send(await networkManager.getChannelInstantiatedChaincodes(req.params.channelName)));
app.get('/api/channel-connections/:channelName',async (req, res) => res.send(await networkManager.getChannelConnections(req.params.channelName)));

app.listen(port, () => console.log(`Example app listening on port ${port}!`))