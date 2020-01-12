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

  sendMessage(msg: string) {
    this.socket.emit("message", msg);
  }
  getMessage() {
    return this.socket
      .fromEvent("message").pipe(
        map(data => data));
  }
  getInitMessage() {
    return this.socket
      .fromEvent("init").pipe(
        map(data => data));
  }
}