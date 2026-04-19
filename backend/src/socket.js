/**
 * Socket.io — Real-time event broadcasting
 * Used for live device detection alerts to police dashboard
 */

const { Server } = require('socket.io');

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: { origin: process.env.CLIENT_URL || '*' },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Police/MACRA can subscribe to a specific district's alerts
    socket.on('subscribe_district', (district) => {
      socket.join(`district:${district}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  console.log('Socket.io initialized');
}

/**
 * Emit a device detection event to all connected clients
 * Optionally target a specific district room
 */
function emitDetection(event) {
  if (!io) return;

  // Broadcast to everyone
  io.emit('device_location_update', event);

  // Also emit to the specific district room
  if (event.district) {
    io.to(`district:${event.district}`).emit('district_alert', event);
  }
}

module.exports = { initSocket, emitDetection };
