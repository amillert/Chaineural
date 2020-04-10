import * as util from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as helper from './helper';
import { ChannelEventHub, Peer, ChaincodeInvokeRequest, ChaincodeQueryRequest, ChaincodeChannelEventHandle } from 'fabric-client';
import Client = require('fabric-client');
const logger = helper.getLogger('ChannelApi');
// tslint:disable-next-line:no-var-requires
// const config = require('../app_config.json');

const allEventhubs: ChannelEventHub[] = [];

function buildTarget(peer: string, org: string): Peer | undefined {
    let target: Peer | undefined = undefined;
    if (typeof peer !== 'undefined') {
        const targets: Peer[] = helper.newPeers([peer], org);
        if (targets && targets.length > 0) {
            target = targets[0];
        }
    }

    return target;
}

export async function invokeChaincode(
    peerOrgPairs: [string, string][], channelName: string,
    chaincodeName: string, fcn: string, args: string[], username: string, peerName:string, fromOrg: string) {
    logger.debug(
        util.format('\n============ invoke transaction on organization %s ============\n', fromOrg));

    const client = helper.getClientForOrg(fromOrg);
    const channel = helper.getChannelForOrg(fromOrg);
    let targets: Array<any> = [];
    peerOrgPairs.forEach(([peerName, org], index) => {
        targets = targets.concat(helper.newPeers([peerName], org));
    });
    try{
        const user = await helper.getRegisteredUsers(username, fromOrg);
    }
    catch(err){
        return err;
    }

    const txId = client.newTransactionID();
    logger.debug(util.format('Sending transaction "%j"', txId));
    // send proposal to endorser
    const request: ChaincodeInvokeRequest = {
        chaincodeId: chaincodeName,
        fcn,
        args,
        txId
    };

    if (targets) {
        request.targets = targets;
    }

    try {

        const results = await channel.sendTransactionProposal(request);
        const proposalResponses = results[0];
        const proposal = results[1];
        let allGood = true;

        proposalResponses.forEach((pr: any) => {
            let oneGood = false;
            if (pr.response && pr.response.status === 200) {
                oneGood = true;
                logger.info('transaction proposal was good');
            } else {
                logger.error('transaction proposal was bad');
            }
            allGood = allGood && oneGood;
        });

        if (allGood) {
            const responses = proposalResponses as any;
            const proposalResponse = responses[0];
            logger.debug(util.format(
                // tslint:disable-next-line:max-line-length
                'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s", metadata - "%s", endorsement signature: %s',
                proposalResponse.response.status, proposalResponse.response.message,
                proposalResponse.response.payload, proposalResponse.endorsement
                    .signature));

            const request2 = {
                proposalResponses: responses,
                proposal
            };

            // set the transaction listener and set a timeout of 30sec
            // if the transaction did not get committed within the timeout period,
            const transactionID = txId.getTransactionID();
            const eventPromises: Array<Promise<any>> = [];

            let peerNames:string[] = [];
            if (peerNames.length == 0) {
                peerNames = channel.getPeers().map((peer) => {
                    return peer.getName();
                });
            }
            const eventhubs = helper.newEventHubs([peerName], fromOrg);
            eventhubs.forEach((eh: ChannelEventHub) => {
                eh.connect();

                const txPromise = new Promise((resolve, reject) => {
                    const handle = setTimeout(() => {
                        eh.disconnect();
                        reject();
                    }, 30000);

                    eh.registerTxEvent(transactionID, (tx: string, code: string) => {
                        clearTimeout(handle);
                        eh.unregisterTxEvent(transactionID);
                        eh.disconnect();

                        if (code !== 'VALID') {
                            logger.error(
                                'The chaineural transaction was invalid, code = ' + code);
                            reject();
                        } else {
                             logger.info(
                               'The chaineural transaction has been committed on peer ' +
                              eh.getPeerAddr());
                            resolve();
                        }
                    });
                });
                eventPromises.push(txPromise);
            });

            const sendPromise = channel.sendTransaction(request2);
            const results2 = await Promise.all([sendPromise].concat(eventPromises));

            logger.debug(' event promise all complete and testing complete');
            if (results2[0].status === 'SUCCESS') {
                logger.info('Successfully sent transaction to the orderer.');
                return txId.getTransactionID();
            } else {
                logger.error('Failed to order the transaction. Error code: ' + results2[0].status);
                return 'Failed to order the transaction. Error code: ' + results2[0].status;
            }
        } else {
            logger.error(
                // tslint:disable-next-line:max-line-length
                'Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...'
            );
            // tslint:disable-next-line:max-line-length
            return 'Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...';
        }

    } catch (err) {
        logger.error('Failed to send transaction due to error: ' + err.stack ? err
            .stack : err);
        return 'Failed to send transaction due to error: ' + err.stack ? err.stack :
            err;
    }
}

export async function queryChaincode(
    peer: string, channelName: string, chaincodeName: string,
    args: string[], fcn: string, username: string, org: string) {

    const channel = helper.getChannelForOrg(org);
    const client = helper.getClientForOrg(org);
    const target = buildTarget(peer, org);
    const user = await helper.getRegisteredUsers(username, org);
    const txId = client.newTransactionID();
    // send query
    const request: ChaincodeQueryRequest = {
        chaincodeId: chaincodeName,
        txId,
        fcn,
        args
    };

    if (target) {
        request.targets = [target];
    }

    try {
        const responsePayloads = await channel.queryByChaincode(request);

        if (responsePayloads) {

            return responsePayloads;

        } else {
            logger.error('response_payloads is null');
            return 'response_payloads is null';
        }
    } catch (err) {
        logger.error('Failed to send query due to error: ' + err.stack ? err.stack :
            err);
        return 'Failed to send query due to error: ' + err.stack ? err.stack : err;
    }
}


export async function getTransactionByID(
    peer: string, trxnID: string, username: string, org: string) {

    const target = buildTarget(peer, org);
    const channel = helper.getChannelForOrg(org);

    const user = await helper.getRegisteredUsers(username, org);

    try {

        const responsePayloads = await channel.queryTransaction(trxnID, target);

        if (responsePayloads) {
            logger.debug(responsePayloads);
            return responsePayloads.transactionEnvelope.payload.data.actions[0]
            .payload.action.proposal_response_payload.extension.results.ns_rwset[0].rwset
            .writes.map(a => a.value);
        } else {
            logger.error('response_payloads is null');
            return 'response_payloads is null';
        }

    } catch (err) {
        logger.error('Failed to query with error:' + err.stack ? err.stack : err);
        return 'Failed to query with error:' + err.stack ? err.stack : err;
    }
}