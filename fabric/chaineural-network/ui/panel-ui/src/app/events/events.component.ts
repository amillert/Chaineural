import { Component, OnInit } from '@angular/core';
import { EventsModule } from '../events.module';
import { ContractEvent } from 'src/common/models';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})
export class EventsComponent implements OnInit {
  events: ContractEvent[] = [];
  currentPayload: string;
  private subscription: Subscription;
  constructor(private eventsModule: EventsModule) { 
    this.events = this.eventsModule.getEvents(); 
    console.log(this.events);
  }

  ngOnInit() {
    // this.subscription = this.eventsService.observableNewestEvent
    // .subscribe(newestEvent => {
    // this.events.push(newestEvent);
    // });
  }

  loadPayload(payload){
    this.currentPayload = payload;
  }
}