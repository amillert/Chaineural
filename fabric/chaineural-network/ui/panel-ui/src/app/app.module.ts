import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {NgbModule, NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from './shared.module';
import {NgxGraphModule,  }from '@swimlane/ngx-graph';
import {NgxChartsModule} from '@swimlane/ngx-charts';
import { PreviewComponent } from './preview/preview.component'
import { EventsService } from './events.service';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { EventsComponent } from './events/events.component';
import { CommonModule } from '@angular/common';
 
const config: SocketIoConfig = { url: 'http://localhost:3002', options: {} };


@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    PageNotFoundComponent,
    PreviewComponent,
    EventsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    BrowserAnimationsModule,
    NgbModule,
    HttpClientModule,
    NgxGraphModule,
    NgxChartsModule,
    SocketIoModule.forRoot(config)
  ],
  providers: [SharedModule, EventsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
