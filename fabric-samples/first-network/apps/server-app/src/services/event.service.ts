const express = require("express");
const cors = require("cors");
import * as path from "path";

const app = express();
app.use(cors());
app.set("port", process.env.PORT || 3002);

let http = require("http").Server(app);
// set up socket.io and bind it to our
// http server.
let io = require("socket.io")(http);
io.origins('*:*')
app.get("/events", (req: any, res: any) => {
  res.se(path.resolve("./client/index.html"));
});

export function listen() {
  const server = http.listen(3002, function () {
    console.log("listening on *:3002");
  });
}
// whenever a user connects on port 3002 via
// a websocket, log that a user has connected
let panelSocket: any;
io.on("connection", function (socket: any) {
  console.log("a user connected");
  panelSocket = socket;
});


export function sendMessage(eventname, message) {
    panelSocket.emit(eventname, message, function (message: any) {
      console.log(message);
    });
}