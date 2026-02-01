import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    // 1. If no token, just exit.
    // The CLEANUP function from the previous run handles the reset.
    if (!token) {
        return;
    }

    // 2. Define the socket setup
    console.log("🔌 Initializing Socket Connection...");
    
    const newSocket = io('http://127.0.0.1:5000', {
      auth: { token },
      transports: ['websocket', 'polling'], 
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 3000,
    });

    // 3. Save it to state
    setSocket(newSocket);

    // 4. Cleanup function
    // This runs automatically when 'token' changes (e.g., logout) or component unmounts.
    return () => {
      console.log("🔌 Cleanup: Disconnecting socket...");
      newSocket.disconnect();
      setSocket(null); // <--- We clear the state HERE, safely.
    };
  }, [token]); 

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};