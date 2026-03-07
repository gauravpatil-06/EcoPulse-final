import React from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { useState, useEffect, useMemo } from 'react';
import {
    LayoutDashboard,
    PlusCircle,
    List,
    Award,
    User,
    LogOut,
    X,
    Recycle,
    Moon,
    Sun,
    Bell,
    FileText,
    Users as UsersIcon,
    Truck,
    Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const ModuleSidebar = ({ isMobileOpen, closeMobile, role }) => {
    const { logout, user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [pickupCount, setPickupCount] = useState(0);
    const [notifCount, setNotifCount] = useState(0);

    useEffect(() => {
        if (user) {
            fetchCounts();
            const interval = setInterval(fetchCounts, 5000); // 5s refresh for live-feel
            return () => clearInterval(interval);
        }
    }, [role, user]);

    const fetchCounts = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            // Fetch Pickups if collector
            if (role === 'Swachhta Mitra') {
                const res = await axios.get('/api/reports?status=Pending', {
                    headers: { 'x-auth-token': token }
                });
                // Count reports matching current user's zone (backend already filters this strictly)
                const pendingCount = Array.isArray(res.data.reports) ? res.data.reports.length : 0;
                setPickupCount(pendingCount);
            }

            // Fetch Unread Notifications for everyone
            const notifRes = await axios.get(`/api/notifications?t=${Date.now()}`, {
                headers: { 'x-auth-token': token }
            });
            
            const rawData = notifRes.data;
            const notifs = Array.isArray(rawData) ? rawData : (rawData.notifications || []);
            const unread = notifs.filter(n => !n.isRead).length;
            setNotifCount(unread);
        } catch (err) {
            console.error('Failed to fetch counts:', err);
        }
    };

    const menuItems = {
        citizen: [
            { name: 'Dashboard', path: '/citizen/dashboard', icon: LayoutDashboard },
            { name: 'Record', path: '/citizen/my-reports', icon: List },
            { name: 'Badges', path: '/citizen/badges', icon: Award },
            { name: 'Notification', path: '/citizen/notification', icon: Bell },
            { name: 'Profile', path: '/citizen/profile', icon: User },
        ],
        admin_citizen: [
            { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
            { name: 'Manage Citizen', path: '/admin/users', icon: UsersIcon },
            { name: 'All Reports', path: '/admin/reports', icon: FileText },
        ],
        admin_mitra: [
            { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
            { name: 'Manage Swachhta Mitra', path: '/admin/users', icon: UsersIcon },
            { name: 'All Pickups', path: '/admin/reports', icon: Truck },
        ],
        'Swachhta Mitra': [
            { name: 'Dashboard', path: '/swachhta-mitra/dashboard', icon: LayoutDashboard },
            { name: 'All Pickups', path: '/swachhta-mitra/pickups', icon: Truck },
            { name: 'Badges', path: '/swachhta-mitra/badges', icon: Award },
            { name: 'Notification', path: '/swachhta-mitra/notification', icon: Bell },
            { name: 'Profile', path: '/swachhta-mitra/profile', icon: User },
        ]
    };

    const currentItems = useMemo(() => {
        let baseItems = [];
        if (role === 'admin') {
            const activeModule = sessionStorage.getItem('adminModule') || 'citizen';
            baseItems = activeModule === 'citizen' ? menuItems.admin_citizen : menuItems.admin_mitra;
        } else {
            baseItems = menuItems[role] || menuItems['citizen'];
        }
        return baseItems.map(item => {
            if (role === 'Swachhta Mitra' && item.name === 'All Pickups') {
                return { ...item, badge: pickupCount > 0 ? pickupCount : null };
            }
            if (item.name === 'Notification') {
                return { ...item, badge: notifCount > 0 ? notifCount : null };
            }
            return item;
        });
    }, [role, pickupCount, notifCount]);

    const sidebarContent = (
        <div className="w-[260px] h-screen bg-white dark:bg-[#0B1121] flex flex-col p-4 relative font-sans transition-colors duration-300">
            {/* Logo Section */}
            <div className="mb-4 px-1 pb-4 border-b border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-lg shadow-emerald-600/20 shrink-0">
                        <Recycle size={22} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-[1.3rem] font-black text-[#1a202c] dark:text-white tracking-tighter leading-none pt-1">
                        EcoPulse
                    </h1>
                </div>

                {/* Mobile Close Button */}
                <button 
                    onClick={closeMobile} 
                    className="lg:hidden absolute top-8 right-6 p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-all"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar px-1">
                {currentItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        onClick={closeMobile}
                    >
                        {({ isActive }) => (
                            <div className={`
                                flex items-center gap-4 px-4 py-2.5 rounded-2xl transition-all duration-200
                                ${isActive 
                                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                                    : 'text-[#4a5568] dark:text-slate-400 hover:bg-emerald-50/50 dark:hover:bg-white/5 hover:text-emerald-500'
                                }
                            `}>
                                <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-[0.95rem] tracking-tight" style={{ fontWeight: isActive ? 700 : 600 }}>
                                    {item.name}
                                </span>
                                {item.badge && (
                                    <span className={`ml-auto w-5 h-5 flex items-center justify-center text-[10px] font-black rounded-full shadow-sm transition-all shrink-0 ${
                                        isActive ? 'bg-white text-emerald-600' : 'bg-rose-500 text-white shadow-rose-500/20'
                                    }`}>
                                        {item.badge}
                                    </span>
                                )}
                            </div>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom Footer Section */}
            <div className="mt-auto px-1">
                <div className="h-[1px] bg-gray-100 dark:bg-white/5 mb-6" />

                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center gap-4 px-4 py-2.5 rounded-2xl text-[#4a5568] dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white/5 font-semibold text-sm transition-all mb-4"
                >
                    {theme === 'light' ? <Moon size={18} strokeWidth={2} /> : <Sun size={18} strokeWidth={2} />}
                    <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                </button>

                {/* User Row with Integrated Logout */}
                <div className="flex items-center justify-between px-2 gap-3 mb-2">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden shrink-0 border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-900/10">
                             <img 
                                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=10b981&color=fff&bold=true`} 
                                alt="avatar" 
                                className="w-full h-full object-cover"
                             />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-[#1a202c] dark:text-white truncate tracking-tight leading-tight">{user?.name}</span>
                            <span className="text-[0.65rem] text-gray-400 truncate tracking-tight capitalize">{user?.role}</span>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-white/5 rounded-xl transition-all flex-shrink-0"
                    >
                        <LogOut size={18} strokeWidth={2.5} />
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden lg:block sticky top-0 h-screen z-30">
                {sidebarContent}
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileOpen && (
                    <div className="fixed inset-0 z-[100] flex lg:hidden">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeMobile}
                            className="fixed inset-0 bg-slate-900/10 backdrop-blur-[2px]"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            style={{ position: 'relative', zIndex: 101, height: '100%' }}
                        >
                            {sidebarContent}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ModuleSidebar;
