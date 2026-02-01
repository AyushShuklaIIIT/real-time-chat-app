import React, { useState } from 'react';
import { X } from 'lucide-react';
import { chatAPI } from '../services/api';

const CreateRoomModal = ({ isOpen, onClose, users, onRoomCreated }) => {
    const [roomName, setRoomName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { data } = await chatAPI.createRoom(roomName, 'group', selectedMembers);
            onRoomCreated(data);
            onClose();
            setRoomName('');
            setSelectedMembers([]);
        } catch (err) {
            console.error('Failed to create room', err);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMember = (userId) => {
        setSelectedMembers(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="glass-effect rounded-2xl p-6 w-full max-w-md bg-[#0f172a]">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">Create New Room</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Room Name</label>
                        <input
                            type="text"
                            required
                            maxLength={30}
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
                            placeholder="Enter room name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Add Members</label>
                        <div className="max-h-40 overflow-y-auto scrollbar-thin space-y-2 p-2 bg-slate-800/30 rounded-xl border border-slate-700/50">
                            {users.map(user => (
                                <label key={user._id} className="flex items-center gap-3 p-2 hover:bg-slate-700/50 rounded-lg cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedMembers.includes(user._id)}
                                        onChange={() => toggleMember(user._id)}
                                        className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xs font-semibold">
                                        {user.username[0].toUpperCase()}
                                    </div>
                                    <span className="text-white text-sm">{user.username}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all"
                    >
                        {isLoading ? 'Creating...' : 'Create Room'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateRoomModal;