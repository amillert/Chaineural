import { Injectable } from '@angular/core';
import { WebSocketHandlerService } from './websocket-handler.service';
import { ContractEvent } from 'src/common/models';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { SharedService } from './shared.service';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  events: ContractEvent[] = [];
  newestEvent:ContractEvent;
  observableNewestEvent;
  constructor(private webSocketHandlerService: WebSocketHandlerService, private sharedService: SharedService) {
    console.log('eventService')
    this.webSocketHandlerService.getInitEpochsLedgerEventMessage().subscribe((data: string) => {
      this.pushEvent(data);
    });
    this.webSocketHandlerService.getInitMinibatchEventMessage().subscribe((data: string) => {
      this.pushEvent(data);
    });
    this.webSocketHandlerService.getFinishMinibatchEventMessage().subscribe((data: string) => {
      this.pushEvent(data);
    });
    this.webSocketHandlerService.getFinalMinibatchEventMessage().subscribe((data: string) => {
      this.pushEvent(data);
    });
  }

  ngOnInit() {

  }

  eventChange() {
    // this.observableNewestEvent.next(this.newestEvent);
  }

  pushEvent(data: string) {
    let contractEvent = <ContractEvent>JSON.parse(data);
    contractEvent.payload = contractEvent.payload.toString();
    contractEvent.byOrg = JSON.parse(contractEvent.payload)['byOrg'];
    this.events.push(contractEvent);
    this.sharedService.emitContractEventChange(contractEvent);
    this.eventChange();
  }

  getEvents() {
    return this.events;
  }
}
