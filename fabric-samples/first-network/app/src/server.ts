'use strict';
var cors = require('cors');
var express = require('express');
var bodyParser = require('body-parser')
const app = express()
const port = 3001;
import GatewayAPI from './gatewayAPI';
import * as chaincodeApi from './api/chaincodeApi';
import * as channelApi from './api/channelApi';

var gatewayAPI = new GatewayAPI();
app.use(cors());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", '*');
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
      return res.status(200).json({});
  }
  next();
});

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/api/channels', (req, res) => { res.send(gatewayAPI.getAllChannels()); });
app.get('/api/peers-for-channel/:channelName', async (req, res) => res.send(await gatewayAPI.getPeerForChannel(req.params.channelName)));
app.get('/api/channel-blocks-hashes/:channelName/:amount/:peerFirstLimb/:workOrg', async (req, res) =>
  res.send(await gatewayAPI.getChannelBlocksHashes(req.params.channelName, req.params.amount, req.params.peerFirstLimb, req.params.workOrg)));
app.get('/api/anchor-peers/:channelName', async (req, res) => res.send(await gatewayAPI.getChannelAnchorPeers(req.params.channelName)));
app.get('/api/chaincodes/:peerFirstLimb/:type/:workOrg', async (req, res) => res.send(await gatewayAPI.getInstalledChaincodes(req.params.peerFirstLimb,req.params.type,req.params.workOrg)));
app.get('/api/channel-connections/:channelName', async (req, res) => res.send(await gatewayAPI.getChannelConnections(req.params.channelName)));
// === chaincodeApi ===
app.get('/api/chaincode/instantiated/:peerFirstLimb/:type/:workOrg', async (req, res) => res.send(await gatewayAPI.getInstalledChaincodes(req.params.peerFirstLimb,req.params.type,req.params.workOrg)));

// === invoke chaincode=== 
app.post('/api/channel/invoke/:channelName/:chaincodeName/:chaincodeFun', async (req, res) => {
  console.log(req.body);
  res.send(await gatewayAPI.invokeChaincode(
    req.body.nodes, req.params.channelName, req.params.chaincodeName, req.params.chaincodeFun, req.body.parameters, req.body.user,req.body.peer, req.body.workOrg));
});
// === query chaincode=== 
app.get('/api/channel/query/:channelName/:chaincodeName/:chaincodeFun', async (req, res) => {
  console.log(req.body);
  res.send(await channelApi.queryChaincode(
    req.body.node, req.params.channelName, req.params.chaincodeName, req.body.parameters, req.params.chaincodeFun, req.body.user, req.body.workOrg));
});
app.listen(port, () => console.log(`Example app listening on port ${port}!`));

// === get transaction by id === 
app.get('/api/channel/transaction/:txID/:user/:peer/:workOrg', async (req, res) => {
  res.send(await channelApi.getTransactionByID(
    req.params.peer, req.params.txID, req.params.user, req.params.workOrg));
});
app.listen(port, () => console.log(`Example app listening on port ${port}!`));