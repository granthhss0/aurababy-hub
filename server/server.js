import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const players = {};

io.on("connection", socket => {
  socket.emit("state", players);

  socket.on("join", data => {
    players[socket.id] = {
      id: socket.id,
      username: data.username,
      character: data.character,
      x: 200,
      y: 200,
      vx: 0,
      vy: 0
    };
  });

  socket.on("move", data => {
    const p = players[socket.id];
    if (!p) return;
    p.x = data.x;
    p.y = data.y;
    p.vx = data.vx;
    p.vy = data.vy;
  });

  socket.on("chat", text => {
    const p = players[socket.id];
    if (!p) return;
    io.emit("chat", {
      id: socket.id,
      username: p.username,
      text,
      time: Date.now()
    });
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
  });
});

setInterval(() => {
  io.emit("state", players);
}, 50);

server.listen(3000, () => {
  console.log("Socket server on :3000");
});
