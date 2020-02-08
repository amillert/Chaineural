'use strict';
var cors = require('cors');
var express = require('express');
var bodyParser = require('body-parser')
const app = express()
const port = 3001;
import Logic from './logic';
import * as chaincodeApi from './api/chaincodeApi';
import * as channelApi from './api/channelApi';

var logic = new Logic();
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

app.get('/api/channels', (req, res) => { res.send(logic.getAllChannels());, console.log("getChannels") });
app.get('/api/peers-for-channel/:channelName', async (req, res) => res.send(await logic.getPeerForChannel(req.params.channelName)));
app.get('/api/channel-blocks-hashes/:channelName/:amount/:peerFirstLimb/:workOrg', async (req, res) =>
  res.send(await logic.getChannelBlocksHashes(req.params.channelName, req.params.amount, req.params.peerFirstLimb, req.params.workOrg)));
app.get('/api/anchor-peers/:channelName', async (req, res) => res.send(await logic.getChannelAnchorPeers(req.params.channelName)));
app.get('/api/chaincodes/:peerFirstLimb/:type/:workOrg', async (req, res) => res.send(await logic.getInstalledChaincodes(req.params.peerFirstLimb,req.params.type,req.params.workOrg)));
app.get('/api/channel-connections/:channelName', async (req, res) => res.send(await logic.getChannelConnections(req.params.channelName)));


// === chaincodeApi ===
app.get('/api/chaincode/instantiated/:peerFirstLimb/:type/:workOrg', async (req, res) => res.send(await logic.getInstalledChaincodes(req.params.peerFirstLimb,req.params.type,req.params.workOrg)));

// === if epoch is valid ===
app.get('/api/epoch-is-valid/:epochName/:peerFirstLimb/:workOrg', async (req, res) => res.send(await logic.queryEpochIsValid(req.params.epochName,req.params.peerFirstLimb, req.params.workOrg)));

// === invoke chaincode=== 
app.post('/api/channel/invoke/:channelName/:chaincodeName/:chaincodeFun', async (req, res) => {
  res.send(await logic.invokeChaincode(
    req.body.nodes, req.params.channelName, req.params.chaincodeName, req.params.chaincodeFun, req.body.parameters, req.body.user,req.body.peer, req.body.workOrg));
});
// === query chaincode=== 
app.get('/api/channel/query/:channelName/:chaincodeName/:chaincodeFun', async (req, res) => {
  res.send(await channelApi.queryChaincode(
    req.body.node, req.params.channelName, req.params.chaincodeName, req.body.parameters, req.params.chaincodeFun, req.body.user, req.body.workOrg));
});

// === get transaction by id === 
app.get('/api/channel/transaction/:txID/:user/:peer/:workOrg', async (req, res) => {
  res.send(await channelApi.getTransactionByID(
    req.params.peer, req.params.txID, req.params.user, req.params.workOrg));
});

// === start epochs learning === 
app.post('/api/start-learning/:txID/:user/:peer/:workOrg/:epochsCount/:workersAmount/:synchronizationHyperparameter/:featuresSize/:hiddenSize/:outputSize/:ETA', async (req, res) => {
  res.send(await logic.startLearning(
    req.params.peer, req.params.txID, req.params.user, req.params.workOrg, req.params.epochsCount, req.params.workersAmount, req.params.synchronizationHyperparameter, req.params.featuresSize, req.params.hiddenSize, req.params.outputSize, req.params.ETA));
});

// === get transaction by id === 
app.get('/api/minibatch-amount/:minibatchSize', async (req, res) => {
  res.send(await logic.getMinibatchAmount(req.params.minibatchSize));
});

app.get('/api/epoch-averages/:epochName', async (req, res) => {
  res.send(await logic.getEpochAverages(req.params.epochName));
});
app.listen(port, () => console.log(`Example app listening on port ${port}!`));