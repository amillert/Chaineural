import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Consts } from 'src/common/consts';
import { map, catchError } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  url: string = Consts.API_ENDPOINT;
  constructor(private http: HttpClient) { }

  getAllChannels() {
    return this.http.get(this.url + '/channels')
      .pipe(
        map(response => response)
      );
  }

  getPeersForChannel(channelName: string) {
    return this.http.get(this.url + '/peers-for-channel/' + channelName)
      .pipe(
        map(response => response)
      );
  }

  getChannelBlocksHashes(channelName, amount, peerFirstLimb, workOrg) {
    return this.http.get(this.url + '/channel-blocks-hashes/' + channelName + '/' + amount + '/' + peerFirstLimb + '/' + workOrg)
      .pipe(
        map(response => response)
      );
  }

  getChannelAnchorPeers(channelName) {
    return this.http.get(this.url + '/anchor-peers/' + channelName)
      .pipe(
        map(response => response)
      );
  }

  getAllPeersCount() {
    return this.http.get(this.url + '/all-peers-count')
      .pipe(
        map(response => response)
      );
  }

  getInstalledChaincodes(peer, type, org) {
    return this.http.get(this.url + '/chaincode/instantiated/' + peer + '/' + type + '/' + org)
      .pipe(
        map(response => response)
      );
  }

  getChannelConnections(channelName) {
    return this.http.get(this.url + '/channel-connections/' + channelName)
      .pipe(
        map(response => response)
      );
  }

  invokeChaincode(channelName, chaincodeName, chaincodeFun, nodes, parameters, user, peer, workOrg) {
    const body = {
      'nodes': nodes,
      'parameters': parameters,
      'user': user,
      'peer': peer,
      'workOrg': workOrg
    }
    return this.http.post(this.url + '/channel/invoke/' + channelName + '/' + chaincodeName + '/' + chaincodeFun, body, {responseType: 'text'})
      .pipe(
        map(response => response)
      );
  }

  getTransactionByID(txID, user, peer, workOrg) {
    return this.http.get(this.url + '/channel/transaction/' + txID + '/' + user + '/' + peer + '/' +  workOrg, {responseType: 'text'})
      .pipe(
        map(response => response)
      );
  }
}
