import { Component, Output, EventEmitter } from '@angular/core';
import { NetworkService } from './network.service';
import { SharedService } from './shared.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  channels:string[];
  selectedChannel:string = 'No channels';
  title = 'Chaineural';
  constructor(private networkService: NetworkService, private _sharedService: SharedService){
    this.allChannels();
  }
  changeChannel(channelName){
    this.selectedChannel = channelName;
    this._sharedService.emitChange(this.selectedChannel);
  }
  allChannels() {
    this.networkService.getAllChannels()
      .subscribe((data: string[]) => {
        this.channels = data;
        if(data.length > 0){
          this.selectedChannel = data[0];
          this._sharedService.emitChange(this.selectedChannel);
        }
      }, (error => console.log("Error")));
  }
}
