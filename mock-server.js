const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Simulate live tracking ping every 3 seconds for a tracked stolen device
  const interval = setInterval(() => {
    const latOffset = (Math.random() - 0.5) * 0.005;
    const lngOffset = (Math.random() - 0.5) * 0.005;
    
    socket.emit('device_location_update', {
      deviceId: 'D10-990-QYZ', // Using a device ID that exists in mockData
      lat: -13.9626 + latOffset,
      lng: 33.7741 + lngOffset,
      timestamp: new Date().toISOString(),
      accuracy: Math.floor(Math.random() * 50) + 10
    });
  }, 3000);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    clearInterval(interval);
  });
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Mock WebSocket server running on http://localhost:${PORT}`);
});
