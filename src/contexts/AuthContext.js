import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/api/client';
import { useNavigate } from 'react-router-dom';
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const login = async (email, password) => {
        const resp = await api.post('/auth-local/login', { email, password });
        const t = resp.data.token;
        localStorage.setItem('dj_token', t);
        setToken(t);
        setUser({ email });
        navigate('/dashboard');
    };
    const signup = async (email, password) => {
        const resp = await api.post('/auth-local/signup', { email, password });
        const t = resp.data.token;
        localStorage.setItem('dj_token', t);
        setToken(t);
        setUser({ email });
        navigate('/dashboard');
    };
    const logout = () => {
        localStorage.removeItem('dj_token');
        setToken(null);
        setUser(null);
        navigate('/login');
    };
    // Persist login on refresh
    useEffect(() => {
        const stored = localStorage.getItem('dj_token');
        if (stored) {
            setToken(stored);
            // decode email simply (in real app verify with backend)
            const payload = JSON.parse(atob(stored.split('.')[1]));
            setUser({ email: payload.email });
        }
    }, []);
    return (_jsx(AuthContext.Provider, { value: { token, user, login, logout, signup }, children: children }));
};
export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx)
        throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
