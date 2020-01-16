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
  transactionId = '';

  //== START LEARNING ==
  startLearningResponse: string;

  // EVENTS SERVICE
  events: ContractEvent[];
  eventsResults;
  eventsMapByEpoch: Map<string, Map<string, string>>;
  currentlyLearnedMinibatchesByEpochCount: Map<string, number>;
  currectOrgsWork = {};
  constructor(private networkService: NetworkService, private sharedService: SharedService, private eventsService: EventsService) {
    this.loadLocalStorage();
    this.setting = sharedService.getSetting();
    this.events = eventsService.getEvents();
    this.eventsMapByEpoch = new Map<string, Map<string, string>>();
    this.currentlyLearnedMinibatchesByEpochCount = new Map<string, number>();
    if (this.events.length > 0) {
      console.log('this.events ');
      console.log(this.events);
      for (const epoch of this.epochs) {
        this.eventsMapByEpoch.set(epoch.epochName, new Map<string, string>());
      }
      console.log('this.eventsMapByEpoch');
      console.log(this.eventsMapByEpoch);
      for (let i = 1; i < this.events.length; i++) {
        const JSONObj = JSON.parse(this.events[i].payload);
        if (this.events[i]['byOrg'] === this.events[i]['org']) {
          if (['InitMinibatchEvent', 'FinishMinibatchEvent', 'FinalMinibatchEvent'].includes(this.events[i].event_name)) {
            let eventsMapByOrg = this.eventsMapByEpoch.get(JSONObj['epochName']);
            eventsMapByOrg.set(this.events[i]['byOrg'], JSON.parse(this.events[i]['payload']));
            this.eventsMapByEpoch.set(JSONObj['epochName'], eventsMapByOrg);
          } else if (this.events[i].event_name === 'EpochIsValidEvent') {
            this.epochs.filter(e => e.epochName === JSONObj['epochName'])[0].valid = JSONObj['valid'];
          }
          if('InitMinibatchEvent' === this.events[i].event_name){
            let learnedCount = this.currentlyLearnedMinibatchesByEpochCount.get(JSONObj['epochName'])
            this.currentlyLearnedMinibatchesByEpochCount.set(JSONObj['epochName'],learnedCount !== undefined ? learnedCount++ : 1);
          }
        }
      }
      console.log(this.events);
      console.log('this.eventsMapByEpoch2');
      console.log(this.eventsMapByEpoch);
      this.eventsResults = Array.from(this.eventsMapByEpoch);
      console.log(this.eventsResults);
      console.log(this.currentlyLearnedMinibatchesByEpochCount);
      // console.log('Object.keys(this.eventsMapByEpoch)');
      // console.log(Object.keys(this.eventsMapByEpoch));
      // for(let epochEventsMap of Array.from(this.eventsMapByEpoch instanceof Map ? this.eventsMapByEpoch.entries() : Object.entries(this.eventsMapByEpoch))){
      //   console.log(epochEventsMap);
      //   console.log(epochEventsMap[1]);
      //   // console.log(epochEventsMap[1]as string);
      // }
    }
  }

  // constructor(private networkService: NetworkService, private sharedService: SharedService, private eventsService: EventsService) {
  //   this.loadLocalStorage();
  //   this.setting = sharedService.getSetting();
  //   this.events = eventsService.getEvents();
  //   if (this.events.length > 0) {
  //     console.log('this.events ');
  //     console.log(this.events);
  //     this.eventsMapByEpoch = new Map<string, [string, string][]>();
  //     for (const epoch of this.epochs) {
  //         this.eventsMapByEpoch.set(epoch.epochName, []);
  //     }
  //     let uniqueOrgs = this.events.map(a => a.byOrg).filter((item, i, ar) => ar.indexOf(item) === i);
  //     for(let org of uniqueOrgs){
  //       let lastEventByOrgs = this.events.reverse().findIndex(a => a.byOrg === org);
  //     }
  //     for(let event of this.events.reverse()){
  //       const JSONpayload = JSON.parse(event.payload);
  //       let array = this.eventsMapByEpoch.get(JSONpayload['epochName']);
  //       if(!array.map(a => a[0]).includes(event.byOrg)){
  //         array
  //       }
  //     }
  //     console.log('this.eventsMapByEpoch');
  //     console.log(this.eventsMapByEpoch);
  //     for (let i = 1; i < this.events.length; i++) {
  //       const JSONObj = JSON.parse(this.events[i].payload);
  //       if (['InitMinibatchEvent', 'FinishMinibatchEvent', 'FinalMinibatchEvent'].includes(this.events[i].event_name)) {

  //         let eventsMapByOrg = this.eventsMapByEpoch.get(JSONObj['epochName']);
  //         eventsMapByOrg.set(this.events[i]['byOrg'],JSON.parse(this.events[i]['payload']));
  //         this.eventsMapByEpoch.set(JSONObj['epochName'], eventsMapByOrg);
  //       } else if (this.events[i].event_name === 'EpochIsValidEvent') {
  //         this.epochs.filter(e => e.epochName === JSONObj['epochName'])[0].valid = JSONObj['valid'];
  //       }
  //     }
  //     console.log(this.events);
  //     console.log('this.eventsMapByEpoch2');
  //     console.log(this.eventsMapByEpoch);
  //     console.log(this.eventsMapByEpoch.get('epoch8').size);

  //   }
  // }
  // constructor(private networkService: NetworkService, private sharedService: SharedService, private eventsService: EventsService) {
  //   this.loadLocalStorage();
  //   this.setting = sharedService.getSetting();
  //   this.events = eventsService.getEvents();
  //   if (this.events.length > 0) {
  //     console.log('this.events ');
  //     console.log(this.events);
  //     this.eventsMapByEpoch = new Map<string, Map<string, string>>();
  //     for (const epoch of this.epochs) {
  //       this.eventsMapByEpoch.set(epoch.epochName, new Map<string, string>());
  //     }
  //     console.log('this.eventsMapByEpoch');
  //     console.log(this.eventsMapByEpoch);
  //     for (let i = 1; i < this.events.length; i++) {
  //       const JSONObj = JSON.parse(this.events[i].payload);
  //       if (['InitMinibatchEvent', 'FinishMinibatchEvent', 'FinalMinibatchEvent'].includes(this.events[i].event_name)) {
  //         let eventsMapByOrg = this.eventsMapByEpoch.get(JSONObj['epochName']);
  //         eventsMapByOrg.set(this.events[i]['byOrg'],this.events[i]['payload']);
  //         this.eventsMapByEpoch.set(JSONObj['epochName'], eventsMapByOrg);
  //       } else if (this.events[i].event_name === 'EpochIsValidEvent') {
  //         this.epochs.filter(e => e.epochName === JSONObj['epochName'])[0].valid = JSONObj['valid'];
  //       }
  //     }
  //     console.log(this.events);
  //     console.log('this.eventsMapByEpoch2');
  //     console.log(this.eventsMapByEpoch);
  //     console.log(Array.from(this.eventsMapByEpoch));

  //   }
  // }
  // constructor(private networkService: NetworkService, private sharedService: SharedService, private eventsService: EventsService) {
  //   this.loadLocalStorage();
  //   this.setting = sharedService.getSetting();
  //   this.events = eventsService.getEvents();
  //   if (this.events.length > 0) {
  //     console.log('this.events ');
  //     console.log(this.events);



  //     // for (const epoch of this.epochs) {
  //     //   this.eventsMapByEpoch.set(epoch.epochName,
  //     //     [['org1', undefined], ['org2', undefined], ['org3', undefined], ['org4', undefined]]);
  //     // }
  //     // console.log('this.eventsMapByEpoch1');
  //     // console.log(this.eventsMapByEpoch);
  //     // // let uniqueOrgs = this.events.map(a => a.byOrg).filter((item, i, ar) => ar.indexOf(item) === i);
  //     // // for(let org of uniqueOrgs){
  //     // //   let lastEventByOrgs = this.events.reverse().findIndex(a => a.byOrg === org);
  //     // // }
  //     // for (let event of this.events.reverse()) {
  //     //   const JSONpayload = JSON.parse(event.payload);
  //     //   if (['InitMinibatchEvent', 'FinishMinibatchEvent', 'FinalMinibatchEvent'].includes(event.event_name)){
  //     //     console.log('array0');
  //     //     console.log('JSONpayload');
  //     //     console.log(JSONpayload);
  //     //     let array = this.eventsMapByEpoch.get(JSONpayload['epochName']);
  //     //     console.log('array');
  //     //     console.log(array);
  //     //     var index = array.filter(a => a[1] === undefined).map(a => a[0]).indexOf(event.byOrg);

  //     //     if (index !== -1) {
  //     //       array[index] = [array[index][0],JSONpayload];
  //     //     }
  //     //     this.eventsMapByEpoch.set(JSONpayload['epochName'], array);
  //     //   }
  //     // }
  //     // console.log('this.eventsMapByEpoch');
  //     // console.log(this.eventsMapByEpoch);
  //     // for (let i = 1; i < this.events.length; i++) {
  //     //   const JSONObj = JSON.parse(this.events[i].payload);
  //     //   if (['InitMinibatchEvent', 'FinishMinibatchEvent', 'FinalMinibatchEvent'].includes(this.events[i].event_name)) {

  //     //     let eventsMapByOrg = this.eventsMapByEpoch.get(JSONObj['epochName']);
  //     //     eventsMapByOrg.set(this.events[i]['byOrg'], JSON.parse(this.events[i]['payload']));
  //     //     this.eventsMapByEpoch.set(JSONObj['epochName'], eventsMapByOrg);
  //     //   } else if (this.events[i].event_name === 'EpochIsValidEvent') {
  //     //     this.epochs.filter(e => e.epochName === JSONObj['epochName'])[0].valid = JSONObj['valid'];
  //     //   }
  //     // }
  //     console.log(this.events);
  //     console.log('this.eventsMapByEpoch2');
  //     console.log(this.eventsMapByEpoch);
  //   }
  // }
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
