import { Component, OnInit } from '@angular/core';
import { NetworkService } from '../network.service';
import { SharedService } from '../shared.service';
import { Setting } from '../shared/models/setting';
import { Epoch } from 'src/common/models';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css']
})
export class PreviewComponent implements OnInit {
  startTransactionId = '';
  epochs: Epoch[];
  epochsCount: string = '0'
  setting: Setting;
  loading = false;

  epochsAmountInput:string;

  constructor(private networkService: NetworkService, private sharedService: SharedService) {

  }

  ngOnInit() {
    this.sharedService.changeEmitted$.subscribe(
      (setting: Setting) => {
        this.setting = setting;
      });
  }

  onKey(event: any) { // without type info
    this.epochsAmountInput = event.target.value;
  }

  initEpochsLedger() {
    this.loading = true;
    const peerNameParts = this.setting.selectedPeerName.split('.');
    // tslint:disable-next-line: max-line-length
    this.networkService.invokeChaincode(
      this.setting.selectedChannelName, 'chaineuralcc', 'initEpochsLedger', null, [this.epochsAmountInput.toString()], 'admin', peerNameParts[0], peerNameParts[1]
      )
    .subscribe((txID) => {
      this.startTransactionId = txID;
      this.networkService.getTransactionByID(txID, 'admin', peerNameParts[0], peerNameParts[1])
      .subscribe((responsePayloads) => {
        let array = JSON.parse(responsePayloads);
        let epochsResp:Epoch[] = [];
        for(let epochJSON of array){
          epochsResp.push(<Epoch>JSON.parse(epochJSON));
        }
        this.epochs = epochsResp;
        this.epochsCount = this.epochs.length.toString();
        this.loading = false;
      });
    });
  }
}
