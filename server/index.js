/*
 * node.js and socket.io tests
 */

const express = require("express");
const app = express();
const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 3010 });
const path = require("path");

app.get("/", (req, res) => {
  res.sendFile(path.resolve("index.html"));
});

app.use("/static", express.static("app"));
// setup

const PORT = 3000;
const HOST = "127.0.0.1";

//Holds the players inputs
const playersData = {
  players: {}
};

// Broadcast to all connections.
wss.broadcast = data => {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

function getPlayersData() {
  // send an update message. 
  return JSON.stringify({
    type: "update",
    timestamp: Date.now(),
    data: Array.from(Object.values(playersData.players))
  });
}

function createPlayer() {
  const player = {
    id: Math.random().toString(36).substring(7),
    // Randomly generates in the area. 
    x: Math.floor(Math.random() * Math.floor(800)),
    y: Math.floor(Math.random() * Math.floor(600)),
    user_name: "Placeholder"
  };
  console.log('player in node js code');
  playersData.players[player.id] = player;
  return player;
}

// runs updates every interval here. 
setInterval(() => {
  wss.broadcast(getPlayersData());
}, 100);

// updates to the webserver. 
wss.on("connection", ws => {
  const player = createPlayer();
  ws.id = player.id;
  // send the init message. 
  ws.send(JSON.stringify({
    type: "init",
    timestamp: Date.now(),
    data: player
  }));
  // getting input messages from each local browser runtime. 
  ws.on("message", data => {
    const message = JSON.parse(data);
    switch (message.type) {
      case "input":
        playersData.players[message.data.id] = message.data;
        break;
    }
  });
  //Player leaves, delete data from list
  ws.on("close", () => {
    delete playersData.players[ws.id];
  });
});

app.listen(PORT);

console.log("Server running at " + HOST + ":" + PORT + "/");
