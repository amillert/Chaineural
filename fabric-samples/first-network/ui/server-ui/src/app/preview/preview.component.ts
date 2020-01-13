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
  epochsAmountInput: string;
  minibatchSizeInput: string = '200';
  minibatchAmountResponse = '0';
  transactionId = '';

  //== START LEARNING ==
  startLearningResponse: string;

  constructor(private networkService: NetworkService, private sharedService: SharedService) {

  }

  ngOnInit() {
    this.sharedService.changeEmitted$.subscribe(
      (setting: Setting) => {
        this.setting = setting;
      });
    let previewObject = localStorage.getItem('previewObject');
    console.log('previewObject');
    console.log(previewObject);
    if (previewObject !== null) {
      let previewJSONObject = JSON.parse(previewObject);
      this.epochsAmountInput = previewJSONObject['epochsAmountInput'];
      this.minibatchSizeInput = previewJSONObject['minibatchSizeInput'];
      this.minibatchAmountResponse = previewJSONObject['minibatchAmountResponse'];
      this.transactionId = previewJSONObject['transactionId'];
      this.epochs = previewJSONObject['epochsArray'];
      this.epochsCount = this.epochs.length.toString();
      this.startLearningResponse = previewJSONObject['startLearningResponse'];
    }
  }

  onKey(event: any) { // without type info
    this.epochsAmountInput = event.target.value;
  }

  onMinibatchSizeKey(event: any) { // without type info
    this.minibatchSizeInput = event.target.value;
  }

  initEpochsLedger() {
    this.loading = true;
    // tslint:disable-next-line: max-line-length
    this.networkService.getMinibatchAmount(this.minibatchSizeInput)
      .subscribe((minibatchAmount) => {
        this.minibatchAmountResponse = minibatchAmount;
        if (minibatchAmount !== 'FAILED') {
          this.networkService.invokeChaincode(
            this.setting.selectedChannelName, 'chaineuralcc', 'initEpochsLedger', [['peer1', 'org1'], ['peer1', 'org2'], ['peer1', 'org3'], ['peer1', 'org4']], [this.epochsAmountInput.toString(), this.minibatchAmountResponse, this.setting.workOrg], 'admin', this.setting.peerFirstLimb, this.setting.workOrg
          )
            .subscribe((txID) => {
              console.log(txID);
              this.transactionId = txID;
              this.networkService.getTransactionByID(txID, 'admin', this.setting.peerFirstLimb, this.setting.workOrg)
                .subscribe((responsePayloads) => {
                  let array = JSON.parse(responsePayloads);
                  let epochsResp: Epoch[] = [];
                  for (let epochJSON of array) {
                    epochsResp.push(<Epoch>JSON.parse(epochJSON));
                  }
                  this.epochs = epochsResp;
                  this.epochsCount = this.epochs.length.toString();
                  localStorage.setItem('previewObject', JSON.stringify({ 'epochsAmountInput': this.epochsAmountInput, 'minibatchSizeInput': this.minibatchSizeInput, 'minibatchAmountResponse': minibatchAmount, 'transactionId': txID, 'epochsArray': this.epochs }));
                  this.loading = false;
                });
            },
              err => {
                console.log(err),
                  this.loading = false;
              });
        }
        else {
          console.log(minibatchAmount);
          this.loading = false;
        }
      });
  }

  startLearning() {
    // tslint:disable-next-line: max-line-length
    this.networkService.startLearning(
      this.transactionId, 'admin', this.setting.peerFirstLimb, this.setting.workOrg
    )
      .subscribe((response) => {
        this.startLearningResponse = response.toString();
        let previewJSONObject = JSON.parse(localStorage.getItem('previewObject'));
        previewJSONObject['startLearningResponse'] = this.startLearningResponse;
        localStorage.setItem('previewObject', JSON.stringify(previewJSONObject));
      });
  }
}
