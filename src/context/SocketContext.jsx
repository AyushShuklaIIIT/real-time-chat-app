import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();
const socketURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) {
        return;
    }

    console.log("🔌 Initializing Socket Connection...");
    
    const newSocket = io(socketURL, {
      auth: { token },
      transports: ['websocket', 'polling'], 
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 3000,
    });

    setSocket(newSocket);

    return () => {
      console.log("🔌 Cleanup: Disconnecting socket...");
      newSocket.disconnect();
      setSocket(null);
    };
  }, [token]); 

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};