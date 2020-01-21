import { Component, OnInit } from '@angular/core';
import { NetworkService } from '../network.service';
import { SharedService } from '../shared.service';
import { Setting } from '../shared/models/setting';
import { Epoch, ContractEvent, Minibatch } from 'src/common/models';
import { Subscription } from 'rxjs/internal/Subscription';
import { EventsService } from '../events.service';
import { repeatWhen } from 'rxjs/operators';

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
  workersAmount: string;
  synchronizationHyperparameter: string;
  featuresSize: string;
  hiddenSize: string;
  outputSize: string;
  ETA: string;

  transactionId = '';

  //== START LEARNING ==
  startLearningResponse: string;

  // EVENTS SERVICE
  events: ContractEvent[];
  eventsResults: [string, Map<string, string>][];
  eventsMapByEpoch: Map<string, Map<string, string>>;
  currentlyProvidedMinibatchesByEpochCount: Map<string, number>;
  currectOrgsWork = {};
  constructor(private networkService: NetworkService, private sharedService: SharedService, private eventsService: EventsService) {
    this.loadLocalStorage();
    this.setting = sharedService.getSetting();
    this.events = eventsService.getEvents();
    this.eventsMapByEpoch = new Map<string, Map<string, string>>();
    this.eventsResults = []
    if (this.epochs != undefined) {
      this.currentlyProvidedMinibatchesByEpochCount = new Map<string, number>();
      for (const epoch of this.epochs) {
        this.eventsResults.push([epoch.epochName, new Map<string, string>()]);
        this.eventsMapByEpoch.set(epoch.epochName, new Map<string, string>());
        this.currentlyProvidedMinibatchesByEpochCount.set(epoch.epochName, 0);
      }
      if (this.events.length > 0) {
        console.log('this.eventsMapByEpoch');
        console.log(this.eventsMapByEpoch);
        for (let i = 1; i < this.events.length; i++) {
          const JSONObj = JSON.parse(this.events[i].payload);
          if (this.events[i]['byOrg'] === this.events[i]['org']) {
            if (['InitMinibatchEvent', 'FinishMinibatchEvent', 'FinalMinibatchEvent'].includes(this.events[i].event_name)) {
              let eventsMapByOrg = this.eventsMapByEpoch.get(JSONObj['epochName']);
              JSONObj['eventName'] = this.events[i].event_name;
              eventsMapByOrg.set(this.events[i]['byOrg'], JSONObj);
              this.eventsMapByEpoch.set(JSONObj['epochName'], eventsMapByOrg);
            } else if (this.events[i].event_name === 'EpochIsValidEvent') {
              this.epochs.filter(e => e.epochName === JSONObj['epochName'])[0].valid = JSONObj['valid'];
            }
            if ('InitMinibatchEvent' === this.events[i].event_name && this.events[i].peer === 'peer0') {
              let learnedCount = this.currentlyProvidedMinibatchesByEpochCount.get(JSONObj['epochName'])
              this.currentlyProvidedMinibatchesByEpochCount.set(JSONObj['epochName'], learnedCount !== undefined ? learnedCount += 1 : 1);
            }
          }
        }
        this.eventsResults = Array.from(this.eventsMapByEpoch);
        console.log(this.eventsResults);
      }
    }
  }

  ngOnInit() {
    this.sharedService.settingChangeEmitted$.subscribe(
      (setting: Setting) => {
        this.setting = setting;
      });
    this.sharedService.contractEventChangeEmitted$.subscribe(
      (newestEvent: ContractEvent) => {
        console.log('newestEvent');
        console.log(newestEvent);
        const JSONObj = JSON.parse(newestEvent.payload);
        if (newestEvent['byOrg'] === newestEvent['org']) {
          if (['InitMinibatchEvent', 'FinishMinibatchEvent', 'FinalMinibatchEvent'].includes(newestEvent.event_name)) {
            let idx = this.eventsResults.findIndex(a => a[0] === JSONObj['epochName']);
            if (idx > -1) {
              let epochMap = this.eventsResults[idx][1];
              JSONObj['eventName'] = newestEvent.event_name;
              epochMap.set(newestEvent['byOrg'], JSONObj)
              this.eventsResults[idx][1] = epochMap;
              console.log('this.eventsResults');
              console.log(this.eventsResults);
            }
          }else if (newestEvent.event_name === 'EpochIsValidEvent') {
            this.epochs.filter(e => e.epochName === JSONObj['epochName'])[0].valid = JSONObj['valid'];
          }
          if ('InitMinibatchEvent' === newestEvent.event_name && newestEvent.peer === 'peer0') {
            let providedCount = this.currentlyProvidedMinibatchesByEpochCount.get(JSONObj['epochName'])
            console.log('=7=');
            console.log(providedCount);
            this.currentlyProvidedMinibatchesByEpochCount.set(JSONObj['epochName'], providedCount !== undefined ? providedCount += 1 : 1);
          }
        }

      });
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
      this.workersAmount = previewJSONObject['workersAmount'];
      this.synchronizationHyperparameter = previewJSONObject['synchronizationHyperparameter'];
      this.featuresSize = previewJSONObject['featuresSize'];
      this.hiddenSize = previewJSONObject['hiddenSize'];
      this.outputSize = previewJSONObject['outputSize'];
      this.ETA = previewJSONObject['ETA'];
    };
  }

  getPercentage(learnedMinibatchCount, totalMinibatchAmount) {
    return (learnedMinibatchCount / totalMinibatchAmount).toFixed(2).toString() + '%'
  }

  onKey(event: any) { // without type info
    // this.epochsAmountInput = event.target.value;
    this.epochsAmountInput = '2';
  }

  onMinibatchSizeKey(event: any) { // without type info
    // this.minibatchSizeInput = event.target.value;
    this.minibatchSizeInput = '200';
  }

  onWorkersAmount(event: any) { // without type info
    // this.workersAmount = event.target.value;
    this.workersAmount = '4';
  }

  onSynchronizationHyperparameter(event: any) { // without type info
    this.synchronizationHyperparameter = event.target.value;
    this.synchronizationHyperparameter = '1';
  }

  onFeaturesSize(event: any) { // without type info
    // this.featuresSize = event.target.value;
    this.featuresSize = '8';
  }

  onHiddenSize(event: any) { // without type info
    // this.hiddenSize = event.target.value;
    this.hiddenSize = '3';
  }

  onOutputSize(event: any) { // without type info
    // this.outputSize = event.target.value;
    this.outputSize = '1';
  }

  onETA(event: any) { // without type info
    // this.ETA = event.target.value;
    this.ETA = '0.01';
  }

  showAverageDetails(epochName){
    const idx = this.epochs.findIndex(a => a.epochName);
    if(idx > -1){
    this.networkService.getAveragesForEpoch(epochName).subscribe((response: any) => {
      this.epochs[idx].avgLearningTime = response[0];
      this.epochs[idx].avgLoss = response[1];
    });
  }
  }
  initEpochsLedger() {
    this.loading = true;
    // tslint:disable-next-line: max-line-length
    this.networkService.getMinibatchAmount(this.minibatchSizeInput)
      .subscribe((minibatchAmount) => {
        this.minibatchAmountResponse = minibatchAmount;
        if (minibatchAmount !== 'FAILED') {
          console.log('this.epochsAmountInput');
          console.log(this.epochsAmountInput);
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
                  this.epochs = epochsResp.sort(function (a, b) {
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
                  localStorage.setItem('previewObject', JSON.stringify(
                    {
                      'epochsAmountInput': this.epochsAmountInput,
                      'minibatchSizeInput': this.minibatchSizeInput,
                      'minibatchAmountResponse': minibatchAmount,
                      'transactionId': txID,
                      'epochsArray': this.epochs,
                      'workersAmount': this.workersAmount,
                      'synchronizationHyperparameter': this.synchronizationHyperparameter,
                      'featuresSize': this.featuresSize,
                      'hiddenSize': this.hiddenSize,
                      'outputSize': this.outputSize,
                      'ETA': this.ETA,
                    }));
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
      this.transactionId, 'admin', this.setting.peerFirstLimb, this.setting.workOrg, this.epochsAmountInput,
      this.workersAmount, this.synchronizationHyperparameter, this.featuresSize, this.hiddenSize, this.outputSize, this.ETA
    )
      .subscribe((response) => {
        this.startLearningResponse = response.toString();
        let previewJSONObject = JSON.parse(localStorage.getItem('previewObject'));
        previewJSONObject['startLearningResponse'] = this.startLearningResponse;
        localStorage.setItem('previewObject', JSON.stringify(previewJSONObject));
      });
  }
}
