"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http = require('http');
var WebSocketServer = require('websocket').server;
var EventEmitterService = /** @class */ (function () {
    function EventEmitterService() {
    }
    EventEmitterService.prototype.connect = function () {
        var server = http.createServer();
        server.listen(9898);
        var wsServer = new WebSocketServer({
            httpServer: server
        });
        wsServer.on('request', function (request) {
            var connection = request.accept(null, request.origin);
            connection.on('message', function (message) {
                console.log('Received Message:', message.utf8Data);
                connection.sendUTF('Hi this is WebSocket server!');
            });
            connection.on('close', function (reasonCode, description) {
                console.log('Client has disconnected.');
            });
        });
    };
    return EventEmitterService;
}());
exports.EventEmitterService = EventEmitterService;
//# sourceMappingURL=event-emitter.service.js.map