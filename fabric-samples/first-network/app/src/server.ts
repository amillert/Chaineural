'use strict';
var cors = require ('cors');
var express = require ('express');
var bodyParser = require('body-parser')
const app = express()
const port = 3001;
import GatewayAPI from './gatewayAPI';
import * as chaincodeApi from './api/chaincodeApi';
import * as channelApi from './api/channelApi';

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

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/api/channels', (req, res) => {res.send(gatewayAPI.getAllChannels());});
app.get('/api/channel-blocks-hashes/:channelName', async (req, res) => res.send(await gatewayAPI.getChannelBlocksHashes(req.params.channelName, 16)));
app.get('/api/anchor-peers/:channelName',async (req, res) => res.send(await gatewayAPI.getChannelAnchorPeers(req.params.channelName)));
app.get('/api/chaincodes/:channelName',async (req, res) => res.send(await gatewayAPI.getChannelInstantiatedChaincodes(req.params.channelName)));
app.get('/api/channel-connections/:channelName',async (req, res) => res.send(await gatewayAPI.getChannelConnections(req.params.channelName)));
// === chaincodeApi ===
app.get('/api/chaincode/instantiated/:channelName', async (req, res) => res.send(await chaincodeApi.getInstantiatedChaincodesForChannel(req.params.channelName)));

// === initEpochsLedger === 
app.post('/api/channel/invoke/:channelName/:chaincodeName/:chaincodeFun', async (req, res) => 
{
  console.log(req.body);
  res.send(await gatewayAPI.invokeChaincode(
    req.body.nodes, req.params.channelName, req.params.chaincodeName,req.params.chaincodeFun,req.body.parameters,req.body.user, req.body.workOrg));
});
// query one
app.get('/api/channel/query/:channelName/:chaincodeName/:chaincodeFun', async (req, res) => 
{
  console.log(req.body);
  res.send(await channelApi.queryChaincode(
    req.body.node, req.params.channelName, req.params.chaincodeName,req.body.parameters,req.params.chaincodeFun,req.body.user, req.body.workOrg));
});
app.listen(port, () => console.log(`Example app listening on port ${port}!`));