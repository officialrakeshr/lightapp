const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*'
  }
});

app.use(cors());

io.on('connection', socket => {
  console.log('Client connected:', socket.id);

  socket.on('light', data => {
    console.log('Broadcasting light:', data);
    socket.broadcast.emit('light', data);
  });
   socket.on('binary', data => {
    console.log('Broadcasting binary:', data);
    socket.broadcast.emit('binary', data);
  });
});

server.listen(3000, '0.0.0.0', () => {
  console.log('Socket server running on http://0.0.0.0:3000');
});
