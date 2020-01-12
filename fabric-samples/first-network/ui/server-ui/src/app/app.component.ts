import { Component, Output, EventEmitter } from '@angular/core';
import { NetworkService } from './network.service';
import { SharedService } from './shared.service';
import { Setting } from './shared/models/setting';
import { WebSocketHandlerService } from './websocket-handler.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  channels: string[];
  peers: string[];
  setting: Setting;

  title = 'Chaineural';
  constructor(private networkService: NetworkService, private sharedService: SharedService, private webSocketHandlerService: WebSocketHandlerService) {
    this.setting = {
      selectedChannelName: 'No channels',
      selectedPeerName: 'No peers',
      peerFirstLimb: '',
      workOrg: '',
      peersCount: 0
    };
    webSocketHandlerService.getInitMessage().subscribe(data => {
      console.log(data);
    });
  }

  ngOnInit() {
    this.allChannels();
  }

  sendMsg() {
    console.log("new message from client to websocket: ", 'message from clinet');
    this.webSocketHandlerService.sendMessage('message from clinet');
  }
  changeChannel(channelName) {
    this.setting.selectedChannelName = channelName;
    this.sharedService.emitChange(this.setting);
  }

  changePeer(peer) {
    this.setting.selectedPeerName = peer;
    const peerNameParts = this.setting.selectedPeerName.split('.');
    this.setting.peerFirstLimb = peerNameParts[0];
    this.setting.workOrg = peerNameParts[1];
    this.sharedService.emitChange(this.setting);
  }
  allChannels() {
    this.networkService.getAllChannels()
      .subscribe((data: string[]) => {
        this.channels = data;
        if (data.length > 0) {
          this.setting.selectedChannelName = data[0];
          this.allPeers();
        }
      }, (error => console.log('Error')));
  }

  allPeers() {
    this.networkService.getPeersForChannel(this.setting.selectedChannelName)
      .subscribe((peers: string[]) => {
        console.log(peers);
        this.peers = peers;
        if (peers.length > 0) {
          this.setting.selectedPeerName = peers[0];
          const peerNameParts = this.setting.selectedPeerName.split('.');
          this.setting.peerFirstLimb = peerNameParts[0];
          this.setting.workOrg = peerNameParts[1];
          this.setting.peersCount = peers.length;
          this.sharedService.emitChange(this.setting);
        }
      });
  }

}
