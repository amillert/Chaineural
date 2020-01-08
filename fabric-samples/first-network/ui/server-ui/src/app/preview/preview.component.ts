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
  //== INIT LEDGER ==
  epochs: Epoch[];
  epochsCount: string = '0'
  setting: Setting;
  loading = false;
  epochsAmountInput:string;
  minibatchesAmountInput:string = '1000';

  transactionId = '';

  //== START LEARNING ==
  startLearningResponse:string;

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

  onMinibatchesKey(event: any) { // without type info
    this.minibatchesAmountInput = event.target.value;
  }

  initEpochsLedger() {
    this.loading = true;
    const peerNameParts = this.setting.selectedPeerName.split('.');
    // tslint:disable-next-line: max-line-length
    this.networkService.invokeChaincode(
      this.setting.selectedChannelName, 'chaineuralcc', 'initEpochsLedger', null, [this.epochsAmountInput.toString(), this.minibatchesAmountInput], 'admin', peerNameParts[0], peerNameParts[1]
      )
    .subscribe((txID) => {
      this.transactionId = txID;
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

  startLearning() {
    const peerNameParts = this.setting.selectedPeerName.split('.');
    // tslint:disable-next-line: max-line-length
    this.networkService.startLearning(
      this.transactionId, 'admin', peerNameParts[0], peerNameParts[1]
      )
    .subscribe((response) => {
      this.startLearningResponse = response.toString();
    });
  }
}
