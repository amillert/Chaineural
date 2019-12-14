'use strict';
var cors = require ('cors');
var express = require ('express');
const app = express()
const port = 3001;
import GatewayAPI from './gatewayAPI';
import * as chaincodeApi from './api/chaincodeApi';

var gatewayAPI = new GatewayAPI();
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
app.get('/api/channels', (req, res) => {res.send(gatewayAPI.getAllChannels());});
app.get('/api/channel-blocks-hashes/:channelName', async (req, res) => res.send(await gatewayAPI.getChannelBlocksHashes(req.params.channelName, 10)));
app.get('/api/anchor-peers/:channelName',async (req, res) => res.send(await gatewayAPI.getChannelAnchorPeers(req.params.channelName)));
app.get('/api/chaincodes/:channelName',async (req, res) => res.send(await gatewayAPI.getChannelInstantiatedChaincodes(req.params.channelName)));
app.get('/api/channel-connections/:channelName',async (req, res) => res.send(await gatewayAPI.getChannelConnections(req.params.channelName)));
// === chaincodeApi ===
app.get('/api/chaincode/instantiated/:channelName', async (req, res) => res.send(await chaincodeApi.getInstantiatedChaincodesForChannel(req.params.channelName)));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));