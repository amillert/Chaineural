import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../shared.module';
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
  chaincodesCount: number;

  channelPeers: PeerOrg[] = [];
  chaincodes: ChaincodeInfo[] = [];
  // channelsOrgsWithPeers:{ mspId: string, value: { 'peers': Array<{ 'mspid': string; 'endpoint': string; }>; }; }[] = [];

  clusters: Organization[] = [];
  links: Link[] = [];
  nodes: Node[] = [];
  constructor(private networkService: NetworkService, private sharedModule: SharedModule) {

  }
  ngOnInit() {
    // if channel change
    this.sharedModule.settingChangeEmitted$.subscribe(
      (setting: Setting) => {
        this.peersCount = setting.peersCount;
        let dashboardJSONObject = JSON.parse(localStorage.getItem('dashboardObject'));
        localStorage.setItem('dashboardObject', JSON.stringify({ ...dashboardJSONObject, 'peersCount': this.peersCount }));
        this.getChannelBlocksHashes(setting.selectedChannelName, 16, setting.peerFirstLimb, setting.workOrg);
        this.getChannelAnchorPeers(setting.selectedChannelName);
        this.getInstalledChaincodes(setting.peerFirstLimb, 'instantiated', setting.workOrg);
        this.getChannelConnections(setting.selectedChannelName);
      });
    let dashboardObject = localStorage.getItem('dashboardObject');
    if (dashboardObject !== null) {
      let dashboardJSONObject = JSON.parse(dashboardObject);
      this.blocksHashes = dashboardJSONObject['blocksHashes'];
      this.blocksCount = dashboardJSONObject['blocksCount'];
      this.peersCount = dashboardJSONObject['peersCount'];
      this.chaincodesCount = dashboardJSONObject['chaincodesCount'];
      this.channelPeers = dashboardJSONObject['channelPeers'];
      this.chaincodes = dashboardJSONObject['chaincodes'];
      this.clusters = dashboardJSONObject['clusters'];
      this.links = dashboardJSONObject['links'];
      this.nodes = dashboardJSONObject['nodes'];
    }
  }

  getChannelBlocksHashes(channelName, amount, peerFirstLimb, workOrg) {
    this.networkService.getChannelBlocksHashes(channelName, amount, peerFirstLimb, workOrg)
      .subscribe((data: BlockInfo[]) => {
        this.blocksHashes = data;
        this.blocksCount = data.length;
        let dashboardJSONObject = JSON.parse(localStorage.getItem('dashboardObject'));
        localStorage.setItem('dashboardObject', JSON.stringify({ ...dashboardJSONObject, 'blocksHashes': this.blocksHashes, 'blocksCount': this.blocksCount }));
      });
  }
  getChannelAnchorPeers(channelName) {
    this.networkService.getChannelAnchorPeers(channelName)
      .subscribe((data: PeerOrg[]) => {
        this.channelPeers = data;
        let dashboardJSONObject = JSON.parse(localStorage.getItem('dashboardObject'));
        localStorage.setItem('dashboardObject', JSON.stringify({ ...dashboardJSONObject, 'channelPeers': this.channelPeers }));
      });
  }

  getInstalledChaincodes(peer, type, org) {
    this.networkService.getInstalledChaincodes(peer, type, org)
      .subscribe((data: ChaincodeInfo[]) => {
        this.chaincodes = data;
        this.chaincodesCount = data.length;
        let dashboardJSONObject = JSON.parse(localStorage.getItem('dashboardObject'));
        localStorage.setItem('dashboardObject', JSON.stringify({ ...dashboardJSONObject, 'chaincodes': this.chaincodes, 'chaincodesCount': this.chaincodesCount }));
      });
  }

  getChannelConnections(channelName) {
    this.networkService.getChannelConnections(channelName)
      .subscribe((data: Graph) => {
        this.clusters = data.clusters;
        this.links = data.links;
        this.nodes = data.nodes;
        let dashboardJSONObject = JSON.parse(localStorage.getItem('dashboardObject'));
        localStorage.setItem('dashboardObject', JSON.stringify({ ...dashboardJSONObject, 'clusters': this.clusters, 'links': this.links, 'nodes': this.nodes }));
      });
  }
}
