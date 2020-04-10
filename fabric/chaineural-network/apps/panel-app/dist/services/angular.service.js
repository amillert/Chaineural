"use strict";
var express = require('express');
var SSEChannel = require('sse-pubsub');
var channel = new SSEChannel();
var EventEmitterService = /** @class */ (function () {
    function EventEmitterService() {
        var app = express();
        app.get('/events', function (req, res) { return channel.subscribe(req, res); });
        app.listen(3001);
    }
    EventEmitterService.prototype.emitMessage = function (eventname, message) {
        channel.publish("Hello everyone!", 'myEvent');
    };
    return EventEmitterService;
}());
//# sourceMappingURL=angular.service.js.map