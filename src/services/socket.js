import { io } from 'socket.io-client';

// Connect to the mock backend running locally
const SOCKET_URL = process.env.REACT_APP_WEBSOCKET_URL || 'http://localhost:4000';

export const socket = io(SOCKET_URL, {
  autoConnect: false, // Wait until explicit connect call
});

export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};
