import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const { login, register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (isLogin) {
                await login(formData.email, formData.password);
            } else {
                await register(formData.username, formData.email, formData.password);
            }
            navigate('/chat');
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred. Please try again.');
        }
    };

    return (
        <div className="h-screen w-full flex items-center justify-center p-4 bg-slate-900 text-white">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 w-full max-w-md">
                <h1 className="text-2xl font-bold mb-2 text-center">{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <input
                            type="text"
                            name="username"
                            autoComplete="username"
                            placeholder="Username"
                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        />
                    )}
                    <input
                        type="email"
                        name="email"
                        autoComplete="username"
                        placeholder="Email"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    <input
                        type="password"
                        name="password"
                        autoComplete={isLogin ? "current-password" : "new-password"}
                        placeholder="Password"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    {error && <div className="text-red-400 text-sm text-center">{error}</div>}
                    <button type="submit" className="w-full py-3 bg-linear-to-r from-indigo-600 to-purple-600 rounded-xl font-semibold hover:scale-[1.02] transition-transform">
                        {isLogin ? 'Sign In' : 'Sign Up'}
                    </button>
                </form>
                <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-4 text-sm text-indigo-400">
                    {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                </button>
            </div>
        </div>
    )
}

export default Auth;