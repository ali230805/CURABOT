import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();
const socketBaseUrl =
  process.env.REACT_APP_SOCKET_URL ||
  (process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL.replace(/\/api\/?$/, '')
    : '');

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user && socketBaseUrl) {
      const newSocket = io(socketBaseUrl, {
        transports: ['websocket', 'polling'],
      });
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Socket connected');
        newSocket.emit('join-chat', user.id);
      });

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};   
