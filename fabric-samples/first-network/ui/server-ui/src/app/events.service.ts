import { Injectable } from '@angular/core';
import { WebSocketHandlerService } from './websocket-handler.service';
import { ContractEvent } from 'src/common/models';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  events: ContractEvent[] = [];
  observableEvents;

  constructor(private webSocketHandlerService: WebSocketHandlerService) {
    console.log('eventService')
    this.observableEvents = new BehaviorSubject<ContractEvent[]>(this.events);
    this.webSocketHandlerService.getInitEpochsLedgerEventMessage().subscribe((data: string) => {
      this.pushEvent(data);
      console.log(data);
    });
    this.webSocketHandlerService.getInitMinibatchEventMessage().subscribe((data: string) => {
      this.pushEvent(data);
      console.log(data);
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
    this.observableEvents.next(this.events);
  }

  pushEvent(data: string) {
    let contractEvent = <ContractEvent>JSON.parse(data);
    contractEvent.payload = contractEvent.payload.toString();
    this.events.push(contractEvent);
    this.eventChange();
  }

  getEvents() {
    return this.events;
  }
}
