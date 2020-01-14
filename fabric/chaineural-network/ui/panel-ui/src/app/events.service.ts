import { Injectable } from '@angular/core';
import { WebSocketHandlerService } from './websocket-handler.service';
import { ContractEvent } from 'src/common/models';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  events: ContractEvent[] = [];
  newestEvent:ContractEvent;
  observableNewestEvent;
  constructor(private webSocketHandlerService: WebSocketHandlerService) {
    console.log('eventService')
    // this.observableNewestEvent = new BehaviorSubject<ContractEvent>(this.newestEvent);
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
    // this.newestEvent = contractEvent;
    this.eventChange();
  }

  getEvents() {
    return this.events;
  }
}
