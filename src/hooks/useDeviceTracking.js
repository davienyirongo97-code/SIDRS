import { useEffect } from 'react';
import { socket, connectSocket, disconnectSocket } from '../services/socket';
import { useAppStore } from '../store/useAppStore';

export function useDeviceTracking() {
  useEffect(() => {
    connectSocket();

    const onLocationUpdate = (data) => {
      // data corresponds to { deviceId, lat, lng, timestamp, accuracy }
      console.log('Received location ping via WS:', data);
      // Use getState() so this effect never needs to re-run due to action reference changes
      useAppStore.getState().updateDeviceLocation(data);
    };

    socket.on('device_location_update', onLocationUpdate);

    return () => {
      socket.off('device_location_update', onLocationUpdate);
      disconnectSocket();
    };
  }, []); // stable — no deps needed since we use getState()
}
