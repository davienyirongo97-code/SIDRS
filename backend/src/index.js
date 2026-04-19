/**
 * SDIRS Backend — Entry Point
 * Malawi MACRA · Stolen Device Identification & Recovery System
 */

require('dotenv').config();
const http = require('http');
const app = require('./app');
const { initSocket } = require('./socket');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Attach Socket.io for real-time events
initSocket(server);

server.listen(PORT, () => {
  console.log(`SDIRS Backend running on http://localhost:${PORT}`);
});
