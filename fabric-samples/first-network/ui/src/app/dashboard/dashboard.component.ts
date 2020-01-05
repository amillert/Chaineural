import { Component, OnInit } from '@angular/core';
import { SharedService } from '../shared.service';
import { NetworkService } from '../network.service';
import { PeerOrg, ChaincodeInfo, BlockInfo } from '../../common/models';
import { Node, Link, Organization, Graph } from '../../common/ngx-graph/models';
import { Setting } from '../shared/models/setting';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  blocksHashes: BlockInfo[];
  blocksCount: number;
  peersCount: number;
  transactionsCount: number;
  chaincodesCount: number;

  channelPeers: PeerOrg[] = [];
  chaincodes: ChaincodeInfo[] = [];
  // channelsOrgsWithPeers:{ mspId: string, value: { 'peers': Array<{ 'mspid': string; 'endpoint': string; }>; }; }[] = [];

  clusters: Organization[] = [];
  links: Link[] = [];
  nodes: Node[] = [];
  constructor(private networkService: NetworkService, private sharedService: SharedService) {
    // if channel change
    sharedService.changeEmitted$.subscribe(
      (setting: Setting) => {
        const peerNameParts = setting.selectedPeerName.split('.');
        this.peersCount = setting.peersCount;
        this.getChannelBlocksHashes(setting.selectedChannelName, 16, peerNameParts[0], peerNameParts[1]);
        this.getChannelAnchorPeers(setting.selectedChannelName);
        this.getInstalledChaincodes(peerNameParts[0], 'instantiated', peerNameParts[1]);
        this.getChannelConnections(setting.selectedChannelName);
      });
  }
  ngOnInit() {
  }

  getChannelBlocksHashes(channelName, amount, peerFirstLimb, workOrg) {
    this.networkService.getChannelBlocksHashes(channelName, amount, peerFirstLimb, workOrg)
      .subscribe((data: BlockInfo[]) => {
        this.blocksHashes = data;
        this.blocksCount = data.length;
        console.log(data);
      });
  }
  getChannelAnchorPeers(channelName) {
    this.networkService.getChannelAnchorPeers(channelName)
      .subscribe((data: PeerOrg[]) => {
        this.channelPeers = data;
      });
  }

  getInstalledChaincodes(peer, type, org) {
    this.networkService.getInstalledChaincodes(peer, type, org)
      .subscribe((data: ChaincodeInfo[]) => {
        console.log(data);
        this.chaincodes = data;
        this.chaincodesCount = data.length;
      });
  }

  getChannelConnections(channelName) {
    this.networkService.getChannelConnections(channelName)
      .subscribe((data: Graph) => {
        this.clusters = data.clusters;
        this.links = data.links;
        this.nodes = data.nodes;
      });
  }
}
