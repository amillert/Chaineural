import { Component, Output, EventEmitter } from '@angular/core';
import { NetworkService } from './network.service';
import { SharedService } from './shared.service';
import { Setting } from './shared/models/setting';

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
  constructor(private networkService: NetworkService, private sharedService: SharedService) {
    this.setting = {
      selectedChannelName: 'No channels',
      selectedPeerName: 'No peers',
      peerFirstLimb: '',
      workOrg: '',
      peersCount: 0
    };
    this.allChannels();
  }

  changeChannel(channelName) {
    this.setting.selectedChannelName = channelName;
    this.sharedService.emitChange(this.setting);
  }

  changePeer(peer) {
    this.setting.selectedPeerName = peer;
    this.sharedService.emitChange(this.setting);
  }
  allChannels() {
    this.networkService.getAllChannels()
      .subscribe((data: string[]) => {
        this.channels = data;
        if (data.length > 0) {
          console.log('data');
          console.log(data);
          this.setting.selectedChannelName = data[0];
          this.allPeers();
        }
      }, (error => console.log('Error')));
  }

  allPeers() {
    this.networkService.getPeersForChannel(this.setting.selectedChannelName)
      .subscribe((peers: string[]) => {
        console.log('peers');
        console.log(peers);
        this.peers = peers;
        if (peers.length > 0) {
          this.setting.selectedPeerName = peers[0];
          this.setting.peersCount = peers.length;
          this.sharedService.emitChange(this.setting);
        }
      });
  }
}
