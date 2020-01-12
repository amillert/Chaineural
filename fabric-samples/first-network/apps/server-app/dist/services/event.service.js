"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var cors = require("cors");
var path = __importStar(require("path"));
var app = express();
app.use(cors());
app.set("port", process.env.PORT || 3002);
var http = require("http").Server(app);
// set up socket.io and bind it to our
// http server.
var io = require("socket.io")(http);
io.origins('*:*');
app.get("/events", function (req, res) {
    res.se(path.resolve("./client/index.html"));
});
function listen() {
    var server = http.listen(3002, function () {
        console.log("listening on *:3002");
    });
}
exports.listen = listen;
// whenever a user connects on port 3002 via
// a websocket, log that a user has connected
var panelSocket;
io.on("connection", function (socket) {
    console.log("a user connected");
    panelSocket = socket;
});
function sendMessage(eventname, message) {
    panelSocket.emit(eventname, message, function (message) {
        console.log(message);
    });
}
exports.sendMessage = sendMessage;
//# sourceMappingURL=event.service.js.map