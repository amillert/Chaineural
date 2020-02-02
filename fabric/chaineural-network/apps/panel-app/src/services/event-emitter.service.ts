import * as contractEventService from "./contract-event-service"
import * as path from "path";
const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.set("port", process.env.PORT || 3002);
const http = require("http").Server(app);
const io = require("socket.io")(http);
io.origins('*:*')
let panelSocket: any = null;
let channelName: string, chaincodeId: string, eventsName: string[];

app.get("/events", (req: any, res: any) => {
  res.se(path.resolve("./client/index.html"));
});

export function listen(channel_name, chaincode_id, events_name) {
  channelName = channel_name;
  chaincodeId = chaincode_id;
  eventsName = events_name;
  const server = http.listen(3002, function () {
    console.log("listening events on*:3002");
  });
}

io.on("connection", function (socket: any) {
  console.log("a user connected");
  panelSocket = socket;
  contractEventService.registerChaincodeEvents(channelName, chaincodeId, eventsName);
});

export function sendMessage(eventname, message) {
  panelSocket.emit(eventname, message, function (message: any) {
    console.log(message);
  });
}