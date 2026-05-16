import { io } from 'socket.io-client';

let socketInstance = null;

export const initializeSocket = (projectId) => {
  if (!projectId) {
    console.error('Project ID is required to initialize the socket.');
    return;
  }

  // In dev: use VITE_API_URL (localhost:3000)
  // In production: use the same origin the app is served from (Render URL)
  const SOCKET_URL = import.meta.env.VITE_API_URL || window.location.origin;

  socketInstance = io(SOCKET_URL, {
    auth: {
      token: localStorage.getItem('token'), // Pass the token for authentication
    },
    query: {
      projectId, // Pass the project ID as a query parameter
    },
    transports: ['websocket'], // Ensure WebSocket transport is used
  });

  socketInstance.on('connect', () => {
    // console.log('Socket connected:', socketInstance.id);
  });

  socketInstance.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message);
  });

  socketInstance.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  return socketInstance;
};

export const receiveMessage = (eventName, cb) => {
  if (!socketInstance) {
    console.error('Socket is not initialized.');
    return;
  }
  socketInstance.on(eventName, cb);
};

export const sendMessage = (eventName, data) => {
  if (!socketInstance) {
    console.error('Socket is not initialized.');
    return;
  }
  socketInstance.emit(eventName, data);
};

