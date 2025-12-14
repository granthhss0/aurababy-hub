import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://aurababy-hub.onrender.com",
    methods: ["GET", "POST"]
  }
});

const players = {};

io.on("connection", (socket) => {
  socket.on("join", (data) => {
    players[socket.id] = {
      id: socket.id,
      username: data.username,
      x: 200,
      y: 200,
      character: data.character,
      admin: data.admin || false
    };
  });

  socket.on("move", ({ x, y }) => {
    if (!players[socket.id]) return;
    players[socket.id].x = x;
    players[socket.id].y = y;
  });

  socket.on("character", (character) => {
    if (!players[socket.id]) return;
    players[socket.id].character = character;
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
  });
});

// broadcast state ~30fps
setInterval(() => {
  io.emit("state", players);
}, 33);

server.listen(process.env.PORT || 3000, () => {
  console.log("Socket server running");
});
