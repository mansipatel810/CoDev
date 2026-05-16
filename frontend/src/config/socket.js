import { io } from 'socket.io-client';

let socketInstance = null;

export const initializeSocket = (projectId) => {
  if (!projectId) {
    console.error('Project ID is required to initialize the socket.');
    return;
  }

  // import.meta.env.MODE is set by Vite itself — "development" or "production"
  // Cannot be overridden by user env vars, so this is always reliable
  const SOCKET_URL = import.meta.env.MODE === 'development'
    ? 'http://localhost:3000'
    : window.location.origin;

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

