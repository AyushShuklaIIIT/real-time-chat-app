import React, { useEffect, useState, useRef } from 'react';
import { Send, ArrowLeft, MoreVertical, Phone, Video, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { chatAPI } from '../services/api';

const ChatWindow = ({ selectedChat, onBack }) => {
  const { user } = useAuth();
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME; 
  const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET; 

  const formatMessageTime = (msg) => {
    const dateStr = msg.createdAt || msg.timestamp;
    if (!dateStr) return '...';
    try {
      return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '...';
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if(!globalThis.confirm('Delete this message?')) return;
    try {
      await chatAPI.deleteMessage(messageId);
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    } catch {
      alert("Failed to delete.");
    }
  };

  const getID = (id) => {
    if (!id) return null;
    if (typeof id === 'object') return id._id ? String(id._id) : String(id);
    return String(id);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { 
        alert("File size too large (Max 5MB)");
        return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      sendMessage(data.secure_url, 'image');
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload image");
    } finally {
      setIsUploading(false);
      e.target.value = null; 
    }
  };

  const renderContentWithLinks = (text) => {
    if (!text) return null;
    const urlRegex = /((?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        const href = part.startsWith('http') ? part : `https://${part}`;
        return (
          <a key={index} href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline font-medium hover:text-blue-300 break-all" onClick={(e) => e.stopPropagation()}>{part}</a>
        );
      }
      return part;
    });
  };

  useEffect(() => {
    if (!selectedChat || !socket) return;
    const loadHistory = async () => {
      try {
        const { data } = await chatAPI.getHistory(selectedChat._id, selectedChat.type);
        setMessages(data);
        if (selectedChat.type === 'room') socket.emit('join_room', selectedChat._id);
      } catch (err) { console.error(err); }
    };
    setTyping('');
    loadHistory();
  }, [selectedChat, socket]);

  useEffect(() => {
    if (!socket || !selectedChat) return;

    const handleReceiveMessage = (newMessage) => {
      const msgSender = getID(newMessage.sender_id);
      const msgReceiver = getID(newMessage.receiver_id);
      const msgRoom = getID(newMessage.room_id);
      const currentChatId = getID(selectedChat._id);

      const isGroupMatch = selectedChat.type === 'room' && msgRoom === currentChatId;
      const isPrivateMatch = selectedChat.type === 'private' && (msgSender === currentChatId || msgReceiver === currentChatId);

      if (isGroupMatch || isPrivateMatch) {
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const handleUserTyping = ({ username, isTyping, chatId }) => {
        if (getID(chatId) === getID(selectedChat._id)) setTyping(isTyping ? `${username} is typing...` : '');
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('user_typing', handleUserTyping);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_typing', handleUserTyping);
    };
  }, [socket, selectedChat, user._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing, isUploading]);

  const sendMessage = (content, type = 'text') => {
    if (!content.trim() && type === 'text') return;
    if (!socket) return;

    const messageData = {
      content: content,
      type: type, 
      sender_id: user, 
      room_id: selectedChat._id, 
      typeContext: selectedChat.type, 
      timestamp: new Date().toISOString()
    };

    
    socket.emit('send_message', { 
        ...messageData, 
        sender_id: user._id,
        type: selectedChat.type,
        messageType: type 
    });
    
    setInput('');
    socket.emit('typing', { chatId: selectedChat._id, isTyping: false });
  };

  const handleSend = (e) => {
    e.preventDefault();
    sendMessage(input, 'text');
  };

  const handleTyping = (e) => {
      setInput(e.target.value);
      if(socket) {
          socket.emit('typing', { chatId: selectedChat._id, isTyping: true });
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => {
             socket.emit('typing', { chatId: selectedChat._id, isTyping: false });
          }, 2000);
      }
  };

  if (!selectedChat) return <div className="hidden lg:flex flex-1 items-center justify-center text-slate-500">Select a chat</div>;

  return (
    <div className="flex-1 flex flex-col h-full w-full relative bg-[#0f172a]">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50 glass-effect flex items-center justify-between z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="lg:hidden p-2 -ml-2 hover:bg-slate-700/50 rounded-lg text-slate-200">
            <ArrowLeft size={20} />
          </button>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-lg
            ${selectedChat.type === 'room' ? 'bg-linear-to-br from-purple-500 to-pink-600' : 'bg-linear-to-br from-emerald-500 to-teal-600'}`}>
            {(selectedChat.name || selectedChat.username)[0].toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">{selectedChat.name || selectedChat.username}</h3>
            <p className="text-xs text-slate-400 h-4">
              {typing ? <span className="text-indigo-400 animate-pulse">{typing}</span> : 'Online'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
            <button className="p-2 hover:bg-slate-700/50 rounded-lg text-slate-400"><Phone size={20} /></button>
            <button className="p-2 hover:bg-slate-700/50 rounded-lg text-slate-400"><Video size={20} /></button>
            <button className="p-2 hover:bg-slate-700/50 rounded-lg text-slate-400"><MoreVertical size={20} /></button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin bg-slate-900/50">
        {messages.map((msg, idx) => {
          const isOwn = getID(msg.sender_id) === getID(user._id);
          const isImage = msg.type === 'image' || msg.messageType === 'image';

          return (
            <div key={idx} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} message-enter group`}>
               {!isOwn && (
                 <div className="w-8 h-8 rounded-full bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xs font-bold text-white mr-2 shrink-0 shadow-md">
                   {(msg.sender_id?.username?.[0] || '?').toUpperCase()}
                 </div>
               )}
               
              {isOwn && (
                <button 
                    onClick={() => handleDeleteMessage(msg._id)}
                    className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity p-2 text-slate-500 hover:text-red-400 self-center"
                    title="Delete Message"
                >
                    <Trash2 size={16} />
                </button>
              )}

              <div className={`relative max-w-[85%] lg:max-w-[70%] px-4 py-2.5 rounded-2xl shadow-sm ${
                isOwn ? 'bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-br-sm' 
                      : 'bg-slate-800 border border-slate-700/50 text-slate-200 rounded-bl-sm'
              }`}>
                {!isOwn && selectedChat.type === 'room' && (
                    <p className="text-xs text-indigo-400 mb-1 font-medium">{msg.sender_id?.username}</p>
                )}
                
                {isImage ? (
                    <div className="mb-1">
                        <img 
                            src={msg.content} 
                            alt="Shared" 
                            className="rounded-lg max-h-60 w-auto object-cover border border-white/10"
                            loading="lazy"
                        />
                    </div>
                ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-all">
                        {renderContentWithLinks(msg.content)}
                    </p>
                )}

                <p className={`text-[10px] mt-1 text-right ${isOwn ? 'text-indigo-200' : 'text-slate-500'}`}>
                    {formatMessageTime(msg)}
                </p>
              </div>
            </div>
          );
        })}
        {isUploading && (
            <div className="flex justify-end pr-4">
                 <div className="bg-slate-800 rounded-xl px-4 py-2 flex items-center gap-2 text-xs text-slate-400">
                    <Loader2 className="animate-spin" size={14} /> Uploading image...
                 </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-700/50 glass-effect bg-[#0f172a]">
        <form onSubmit={handleSend} className="flex gap-2 items-end">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
          
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-colors"
          >
            <ImageIcon size={20} />
          </button>

          <input
            type="text"
            value={input}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button type="submit" className="p-3 bg-linear-to-r from-indigo-600 to-purple-600 rounded-xl text-white hover:shadow-lg transition-all">
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;