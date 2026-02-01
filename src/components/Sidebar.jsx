import React, { useEffect, useState } from 'react';
import { chatAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LogOut, Plus, Search } from 'lucide-react';
import CreateRoomModal from './createRoomModal'; // Import the new modal

const Sidebar = ({ onSelectChat, selectedChatId, className }) => {
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState('rooms'); // 'rooms' | 'users'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data State
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, roomsRes] = await Promise.all([chatAPI.getUsers(), chatAPI.getRooms()]);
        setUsers(usersRes.data);
        setRooms(roomsRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const getFilteredItems = () => {
    const data = activeTab === 'rooms' ? rooms : users;
    return data.filter(item => {
      if (!item) return false;
      const name = (item.username || item.name || "").toLowerCase();
      const safeSearch = (searchQuery || "").toLowerCase();
      return name.includes(safeSearch);
    });
  };

  const handleRoomCreated = (newRoom) => {
    setRooms(prev => [...prev, newRoom]);
    onSelectChat(newRoom, 'room');
  };

  return (
    <>
      <div className={`w-full lg:w-80 glass-effect border-r border-slate-700/50 flex flex-col h-full ${className}`}>
        {/* User Header */}
        <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">
              {user?.username?.[0].toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-white text-sm">{user?.username}</p>
              <p className="text-xs text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-400 rounded-full"></span> Online
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsModalOpen(true)} className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors" title="Create Room">
              <Plus size={20} className="text-slate-400" />
            </button>
            <button onClick={logout} className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors" title="Logout">
              <LogOut size={20} className="text-slate-400" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 flex gap-2 mb-2">
          {['rooms', 'users'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all capitalize ${
                activeTab === tab ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:bg-slate-700/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Lists */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-2 pb-4 space-y-1">
          {getFilteredItems().map((item) => {
            const id = item._id;
            const name = item.name || item.username;
            const isSelected = selectedChatId === id;
            
            return (
              <div
                key={id}
                onClick={() => onSelectChat(item, activeTab === 'rooms' ? 'room' : 'private')}
                className={`p-3 rounded-xl cursor-pointer flex items-center gap-3 transition-all ${
                  isSelected ? 'bg-indigo-600/30 border border-indigo-500/50' : 'hover:bg-slate-700/50'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-white ${
                  activeTab === 'rooms' ? 'bg-linear-to-br from-purple-500 to-pink-600' : 'bg-linear-to-br from-emerald-500 to-teal-600'
                }`}>
                  {name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{name}</p>
                  <p className="text-sm text-slate-400 truncate">
                    {activeTab === 'rooms' ? `${item.members?.length || 0} members` : 'Click to chat'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Render Modal */}
      <CreateRoomModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        users={users}
        onRoomCreated={handleRoomCreated}
      />
    </>
  );
};

export default Sidebar;