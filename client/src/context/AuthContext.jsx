import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// 🔥 SETUP GLOBAL AXIOS INTERCEPTOR FOR AUTOMATIC TOKEN ATTACHMENT
axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers['x-auth-token'] = token;
    return config;
}, (error) => {
    return Promise.reject(error);
});

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser && savedUser !== 'undefined') {
            try {
                let parsedUser = JSON.parse(savedUser);
                if (parsedUser.role === 'collector') parsedUser.role = 'Swachhta Mitra';
                return parsedUser;
            } catch (e) {
                return null;
            }
        }
        return null;
    });
    const [loading, setLoading] = useState(!user && !!localStorage.getItem('token'));
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                // Ensure header is set for initial profile call
                axios.defaults.headers.common['x-auth-token'] = token;
                try {
                    const res = await axios.get('/api/auth/profile');
                    let freshUser = res.data;
                    if (freshUser.role === 'collector') freshUser.role = 'Swachhta Mitra';
                    setUser(freshUser);
                    localStorage.setItem('user', JSON.stringify(freshUser));
                } catch (err) {
                    console.error('Error fetching user profile:', err);
                    if (!user) { // If no cached user, then logout
                        localStorage.removeItem('user');
                        localStorage.removeItem('token');
                        setUser(null);
                        setToken(null);
                    }
                }
            } else {
                delete axios.defaults.headers.common['x-auth-token'];
                setUser(null);
            }
            setLoading(false);
        };

        loadUser();
    }, [token]);

    const signup = async (userData) => {
        try {
            const res = await axios.post('/api/auth/signup', userData);
            let user = res.data.user;
            if (user.role === 'collector') user.role = 'Swachhta Mitra';
            
            // 👤 Cleanup before session start
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('citizen_dashboard_data');
            localStorage.removeItem('collector_dashboard_data');

            // ✅ SET HEADER IMMEDIATELY (Fixes race condition)
            axios.defaults.headers.common['x-auth-token'] = res.data.token;
            
            setToken(res.data.token);
            setUser(user);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(user));
            return { ...res.data, user };
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Registration failed');
        }
    };

    const login = async (email, password) => {
        try {
            const res = await axios.post('/api/auth/login', { email, password });
            let user = res.data.user;
            if (user.role === 'collector') user.role = 'Swachhta Mitra';
            
            // 👤 Cleanup before session start
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('citizen_dashboard_data');
            localStorage.removeItem('collector_dashboard_data');

            // ✅ SET HEADER IMMEDIATELY (Fixes race condition)
            axios.defaults.headers.common['x-auth-token'] = res.data.token;
            
            setToken(res.data.token);
            setUser(user);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(user));
            return { ...res.data, user };
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Login failed');
        }
    };

    const googleLogin = async (credentialToken, selectedRole) => {
        try {
            const res = await axios.post('/api/auth/google', { token: credentialToken, role: selectedRole });
            let user = res.data.user;
            if (user.role === 'collector') user.role = 'Swachhta Mitra';
            
            // 👤 Cleanup
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            
            // ✅ SET HEADER IMMEDIATELY
            axios.defaults.headers.common['x-auth-token'] = res.data.token;

            setToken(res.data.token);
            setUser(user);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(user));
            return { ...res.data, user };
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Google Login failed');
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('citizen_dashboard_data');
        localStorage.removeItem('collector_dashboard_data');
        delete axios.defaults.headers.common['x-auth-token'];
        
        // ✅ redirect to login for a fresh start
        window.location.href = "/login";
    };

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, signup, login, googleLogin, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};
