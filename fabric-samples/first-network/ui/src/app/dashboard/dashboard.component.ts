import { Component, OnInit } from '@angular/core';
import { SharedService } from '../shared.service';
import { NetworkService } from '../network.service';
import { PeerOrg } from '../../../../common/models';
import { Node, Link, Organization, Graph} from '../../../../common/ngx-graph/models'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  blocksHashes: string[];
  blocksCount: number;
  peersCount: number;
  transactionsCount: number;
  chaincodesCount: number;

  channelPeers:PeerOrg[] = [];
  // channelsOrgsWithPeers:{ mspId: string, value: { 'peers': Array<{ 'mspid': string; 'endpoint': string; }>; }; }[] = [];

  clusters:Organization[] = [];
  links:Link[] = [];
  nodes:Node[] = [];
  constructor(private networkService: NetworkService, private _sharedService: SharedService) { 
    // if channel change
    _sharedService.changeEmitted$.subscribe(
      channelName => {
        this.getChannelBlocksHashes(channelName);
        this.getChannelAnchorPeers(channelName);
        this.getChannelInstatiatedChaincodes(channelName);
        this.getChannelConnections(channelName);
      });
  }
  ngOnInit() {
  }

  getChannelBlocksHashes(channelName){
    this.networkService.getChannelBlocksHashes(channelName)
      .subscribe((data: string[]) => {
        this.blocksHashes = data;
        this.blocksCount = data.length;
      });
  }
  getChannelAnchorPeers(channelName){
    this.networkService.getChannelAnchorPeers(channelName)
      .subscribe((data: PeerOrg[]) => {
        this.channelPeers = data;
        this.peersCount = data.length;
      });
  }

  getChannelInstatiatedChaincodes(channelName){
    this.networkService.getChannelInstatiatedChaincodes(channelName)
      .subscribe((data: any) => {
        this.chaincodesCount = data.result;
      });
  }

  getChannelConnections(channelName){
    this.networkService.getChannelConnections(channelName)
      .subscribe((data: Graph) => {
        this.clusters = data.clusters;
        this.links = data.links;
        this.nodes = data.nodes;
      });
  }
}
