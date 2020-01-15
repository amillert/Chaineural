import { Component, OnInit } from '@angular/core';
import { NetworkService } from '../network.service';
import { SharedService } from '../shared.service';
import { Setting } from '../shared/models/setting';
import { Epoch, ContractEvent } from 'src/common/models';
import { Subscription } from 'rxjs/internal/Subscription';
import { EventsService } from '../events.service';

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

  // EVENTS SERVICE
  events: ContractEvent[];
  eventsMapByEpoch: Map<string, Map<string, string>>;
  private subscription: Subscription;

  currectOrgsWork = {};
  constructor(private networkService: NetworkService, private sharedService: SharedService, private eventsService: EventsService) {
    this.loadLocalStorage();
    this.setting = sharedService.getSetting();
    this.events = eventsService.getEvents();
    if (this.events.length > 0) {
      console.log('this.events ');
      console.log(this.events);
      this.eventsMapByEpoch = new Map<string, Map<string, string>>();
      for (const epoch of this.epochs) {
        this.eventsMapByEpoch.set(epoch.epochName, new Map<string, string>());
      }
      console.log('this.eventsMapByEpoch');
      console.log(this.eventsMapByEpoch);
      for (let i = 1; i < this.events.length; i++) {
        const JSONObj = JSON.parse(this.events[i].payload);
        if (['InitMinibatchEvent', 'FinishMinibatchEvent', 'FinalMinibatchEvent'].includes(this.events[i].event_name)) {
          let eventsMapByOrg = this.eventsMapByEpoch.get(JSONObj['epochName']);
          eventsMapByOrg.set(this.events[i]['byOrg'],this.events[i]['payload']);
          this.eventsMapByEpoch.set(JSONObj['epochName'], eventsMapByOrg);
        } else if (this.events[i].event_name === 'EpochIsValidEvent') {
          this.epochs.filter(e => e.epochName === JSONObj['epochName'])[0].valid = JSONObj['valid'];
        }
      }
      console.log(this.events);
      console.log('this.eventsMapByEpoch2');
      console.log(this.eventsMapByEpoch);
      console.log(this.eventsMapByEpoch.get('epoch8').size);

    }
  }

  ngOnInit() {
    this.sharedService.contractEventChangeEmitted$.subscribe(
      (newEvent: ContractEvent) => {
        // this.eventsMapByOrg.set(newEvent.byOrg, newEvent.payload);
        // if (newEvent.event_name === 'EpochIsValidEvent') {
        //   let epochIsValid = JSON.parse(newEvent.payload);
        //   this.epochs.filter(e => e.epochName === epochIsValid['epochName'])[0].valid = epochIsValid['valid'];
        // }
        // console.log('this.eventsMapByOrg');
        // console.log(this.eventsMapByOrg);
      });
    this.sharedService.settingChangeEmitted$.subscribe(
      (setting: Setting) => {
        this.setting = setting;
      });
    // this.subscription = this.eventsService.observableNewestEvent
    //   .subscribe(newestEvent => {
    //     this.events.push(newestEvent);
    //   });
  }

  private loadLocalStorage() {
    let previewObject = localStorage.getItem('previewObject');
    if (previewObject !== null) {
      let previewJSONObject = JSON.parse(previewObject);
      this.epochsAmountInput = previewJSONObject['epochsAmountInput'];
      this.minibatchSizeInput = previewJSONObject['minibatchSizeInput'];
      this.minibatchAmountResponse = previewJSONObject['minibatchAmountResponse'];
      this.transactionId = previewJSONObject['transactionId'];
      this.epochs = previewJSONObject['epochsArray'];
      this.epochsCount = this.epochs.length.toString();
      this.startLearningResponse = previewJSONObject['startLearningResponse'];
    };
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
                  console.log(responsePayloads);
                  let array = JSON.parse(responsePayloads);
                  let epochsResp: Epoch[] = [];
                  for (let epochJSON of array) {
                    epochsResp.push(<Epoch>JSON.parse(epochJSON));
                  }
                  this.epochs = epochsResp.sort(function(a, b){
                    var matches = a.epochName.match(/(\d+)/);
                    var aNumber = +matches[0];
                    var matches = b.epochName.match(/(\d+)/);
                    var bNumber = +matches[0];
                    if (aNumber < bNumber) //sort string ascending
                     return -1;
                    if (aNumber > bNumber)
                     return 1;
                    return 0; //default return value (no sorting)
                   });
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
