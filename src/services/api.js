import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL + '/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if(token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authAPI = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    register: (username, email, password) => api.post('/auth/register', { username, email, password }),
};

export const chatAPI = {
    getUsers: () => api.get('/chat/users'),
    getRooms: () => api.get('/chat/rooms'),
    createRoom: (name, type, members) => api.post('/chat/rooms', { name, type, members }),
    getHistory: (id, type) => api.get(`/chat/history/${id}?type=${type}`),
};

export default api;