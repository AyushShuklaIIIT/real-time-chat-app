import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Auth from './components/Auth';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';

const ChatLayout = () => {
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <div className="flex h-screen w-full bg-[#0f172a] overflow-hidden text-white font-sans">
      <Sidebar
        className={`${selectedChat ? 'hidden lg:flex' : 'flex'}`}
        selectedChatId={selectedChat?._id}
        onSelectChat={(chat, type) => setSelectedChat({ ...chat, type })}
      />

      <div className={`flex-1 flex flex-col h-full ${selectedChat ? 'flex' : 'hidden lg:flex'}`}>
        <ChatWindow
          key={selectedChat ? selectedChat._id : 'welcome'}
          selectedChat={selectedChat}
          onBack={() => setSelectedChat(null)}
        />
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#0f172a] text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" />;
  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <ChatLayout />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/chat" />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;