import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { map } from 'rxjs/operators';

export interface Message {
  author: string;
  message: string;
}

@Injectable()
export class WebSocketHandlerService {
  constructor(private socket: Socket) { }

  getMessage() {
    return this.socket
      .fromEvent('message').pipe(
        map(data => data));
  }
  getInitEpochsLedgerEventMessage() {
    return this.socket
      .fromEvent('InitEpochsLedgerEvent').pipe(
        map(data => data));
  }
  getInitMinibatchEventMessage() {
    return this.socket
      .fromEvent('InitMinibatchEvent').pipe(
        map(data => data));
  }
  getFinishMinibatchEventMessage() {
    return this.socket
      .fromEvent('FinishMinibatchEvent').pipe(
        map(data => data));
  }
  getFinalMinibatchEventMessage() {
    return this.socket
      .fromEvent('FinalMinibatchEvent').pipe(
        map(data => data));
  }
  getEpochIsValidEventMessage() {
    return this.socket
      .fromEvent('EpochIsValidEvent').pipe(
        map(data => data));
  }
}