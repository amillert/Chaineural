import { Injectable } from '@angular/core';
import { EventsService } from './events.service';
import { ContractEvent } from 'src/common/models';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { SharedModule } from './shared.module';

@Injectable({
  providedIn: 'root'
})
export class EventsModule {
  events: ContractEvent[] = [];
  newestEvent:ContractEvent;
  observableNewestEvent;
  constructor(private eventsService: EventsService, private sharedModule: SharedModule) {
    this.eventsService.getInitEpochsLedgerEventMessage().subscribe((data: string) => {
      this.pushEvent(data);
    });
    this.eventsService.getInitMinibatchEventMessage().subscribe((data: string) => {
      this.pushEvent(data);
    });
    this.eventsService.getFinishMinibatchEventMessage().subscribe((data: string) => {
      this.pushEvent(data);
    });
    this.eventsService.getFinalMinibatchEventMessage().subscribe((data: string) => {
      this.pushEvent(data);
    });
    this.eventsService.getEpochIsValidEventMessage().subscribe((data: string) => {
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
    this.sharedModule.emitContractEventChange(contractEvent);
    this.eventChange();
  }

  getEvents() {
    return this.events;
  }
}
