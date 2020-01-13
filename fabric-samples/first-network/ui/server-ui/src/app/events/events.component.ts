import { Component, OnInit } from '@angular/core';
import { WebSocketHandlerService } from '../websocket-handler.service';
import { EventsService } from '../events.service';
import { ContractEvent } from 'src/common/models';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})
export class EventsComponent implements OnInit {
  events: ContractEvent[];
  private subscription: Subscription;
  constructor(private eventsService: EventsService) { 
    this.events = eventsService.getEvents();
  }

  ngOnInit() {
    this.subscription = this.eventsService.observableEvents
    .subscribe(events => {
    this.events = events;
    });
  }

}