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

  getChannelBlocksHashes(channelName){
    return this.http.get(this.url + '/channel-blocks-hashes/' + channelName)
      .pipe(
        map(response => response)
      );
  }

  getChannelAnchorPeers(channelName){
    return this.http.get(this.url + '/anchor-peers/' + channelName)
      .pipe(
        map(response => response)
      );
  }

  getChannelInstatiatedChaincodes(channelName){
    return this.http.get(this.url + '/chaincodes/' + channelName)
      .pipe(
        map(response => response)
      );
  }

  getChannelConnections(channelName){
    return this.http.get(this.url + '/channel-connections/' + channelName)
      .pipe(
        map(response => response)
      );
  }
}
