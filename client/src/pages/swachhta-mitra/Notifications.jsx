import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
    Bell,
    Clock,
    Calendar,
    Camera,
    CheckCircle2,
    Truck,
    AlertCircle,
    ChevronRight,
    Loader2,
    CheckCheck,
    Trash2,
    MapPin,
    ArrowLeft
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import toast from 'react-hot-toast';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isClearModalOpen, setIsClearModalOpen] = useState(false);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`/api/notifications?t=${Date.now()}`, {
                headers: { 
                    'x-auth-token': token,
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            console.log("Collector Notifications API Response:", res.data);
            const data = Array.isArray(res.data) ? res.data : (res.data.notifications || []);
            setNotifications(data);
        } catch (err) {
            console.error('Fetch notification error:', err);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/notifications/${id}/read`, {}, {
                headers: { 'x-auth-token': token }
            });
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error('Mark read error:', err);
        }
    };

    const markAllRead = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/notifications/read-all`, {}, {
                headers: { 'x-auth-token': token }
            });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            toast.success('All marked as read');
        } catch (err) {
            toast.error('Failed to update notifications');
        }
    };

    const clearAllNotifications = async () => {
        setIsClearModalOpen(false);
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/notifications/clear-all`, {
                headers: { 'x-auth-token': token }
            });
            setNotifications([]);
            toast.success('Notifications cleared');
        } catch (err) {
            console.error('Clear all error:', err);
            toast.error('Failed to clear notifications');
        }
    };

    const getIcon = (type, title) => {
        if (type === 'Badge' || title.includes('🏆')) return <span className="text-xl">🏆</span>;
        if (type === 'Reward' || title.includes('points') || title.includes('PTS')) return <span className="text-xl">💰</span>;
        if (title.includes('Cleaned') || title.includes('✅') || title.includes('Completed') || title.includes('Resolved')) return <CheckCircle2 className="text-emerald-500" size={20} />;
        if (title.includes('Request') || title.includes('Accepted') || title.includes('📢')) return <Truck className="text-indigo-500" size={20} />;
        if (title.includes('Evidence') || title.includes('📸')) return <Camera className="text-blue-500" size={20} />;
        if (type === 'Status Update' || title.includes('🚧')) return <AlertCircle className="text-amber-500" size={20} />;
        return <Bell className="text-blue-500" size={20} />;
    };

    return (
        <div className="space-y-2 max-w-7xl mx-auto animate-fade-in font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <PageHeader
                    title="Notifications"
                    subtitle="Stay updated on your request activities"
                    icon={Bell}
                />
                
                <div className="flex flex-row items-center justify-end gap-2 shrink-0">
                    {notifications.some(n => !n.isRead) && (
                        <button 
                            onClick={markAllRead}
                            className="px-4 max-sm:px-2.5 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-[12px] max-sm:text-[11px] font-black text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:border-emerald-200 dark:hover:border-emerald-500/20 transition-all flex items-center gap-1.5 sm:gap-2 shadow-sm active:scale-[0.97] group"
                        >
                            <CheckCheck size={14} className="group-hover:scale-110 transition-transform" />
                            Mark all as read
                        </button>
                    )}
                    {notifications.length > 0 && (
                        <button 
                            onClick={() => setIsClearModalOpen(true)}
                            className="px-4 max-sm:px-2.5 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-[12px] max-sm:text-[11px] font-black text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:border-rose-200 dark:hover:border-rose-500/20 transition-all flex items-center gap-1.5 sm:gap-2 shadow-sm active:scale-[0.97] group"
                        >
                            <Trash2 size={14} className="group-hover:rotate-12 transition-transform" />
                            Clear all
                        </button>
                    )}
                </div>
            </div>

            <div className="min-h-[500px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 opacity-60">
                        <Loader2 className="animate-spin text-emerald-500 mb-4" size={40} />
                        <p className="text-[13px] font-black text-slate-400">Loading assignments...</p>
                    </div>
                ) : notifications.length > 0 ? (
                    <div className="grid gap-3 sm:gap-4">
                        {notifications.map((notif, idx) => (
                            <motion.div
                                key={notif._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => !notif.isRead && markAsRead(notif._id)}
                                className={`group relative p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                                    notif.isRead 
                                    ? 'bg-white/40 dark:bg-white/5 border-slate-100 dark:border-white/5' 
                                    : 'bg-white dark:bg-[#0B1121] border-emerald-500/20 shadow-lg shadow-emerald-500/5'
                                }`}
                            >


                                <div className="flex gap-4 items-start text-left">
                                    <div className={`w-12 h-12 flex items-center justify-center rounded-full shadow-sm shrink-0 ${
                                        notif.isRead ? 'bg-slate-50 dark:bg-white/5 text-slate-400' : 'bg-emerald-50 dark:bg-emerald-500/10'
                                    }`}>
                                        {getIcon(notif.type, notif.title + ' ' + notif.message)}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-x-2 gap-y-1.5 mb-2 sm:mb-1">
                                            <h3 className={`text-[15px] sm:text-[16px] font-black tracking-tight leading-none ${
                                                notif.isRead ? 'text-slate-500' : 'text-slate-900 dark:text-white'
                                            }`}>
                                                {notif.title}
                                            </h3>
                                            <div className="flex items-center gap-3 shrink-0">
                                                <span className="text-[11px] font-black text-slate-400 uppercase flex items-center gap-1.5">
                                                    <Calendar size={11} strokeWidth={3} />
                                                    {new Date(notif.createdAt).toLocaleDateString()}
                                                </span>
                                                <span className="text-[11px] font-black text-slate-400 uppercase flex items-center gap-1.5">
                                                    <Clock size={11} strokeWidth={3} />
                                                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                </span>
                                            </div>
                                        </div>
                                        <p className={`text-[13px] sm:text-[14px] leading-relaxed mb-3 ${
                                            notif.isRead ? 'text-slate-400' : 'text-slate-600 dark:text-slate-300 font-semibold'
                                        }`}>
                                            {notif.message}
                                        </p>
                                        
                                        <div className="flex items-center gap-3">
                                             <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 dark:bg-white/5 text-[10px] font-black text-slate-500">
                                                 <AlertCircle size={10} />
                                                 {notif.type}
                                                 {(notif.type === 'Reward' || notif.type === 'Badge') && notif.points > 0 && (
                                                     <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black rounded-md shrink-0">
                                                        +{notif.points} pts
                                                     </span>
                                                 )}
                                              </div>
                                             {!notif.isRead && (
                                                 <span className="text-[10px] font-black text-emerald-600 pl-2 border-l border-slate-200 dark:border-white/10">
                                                     New Alert
                                                 </span>
                                             )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-center opacity-60">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
                            <Bell size={32} className="text-slate-300" />
                        </div>
                        <h3 className="text-[18px] font-black text-slate-800 dark:text-white tracking-tighter">No Notifications Yet</h3>
                        <p className="text-[13.5px] font-bold text-slate-500 max-w-[200px] mt-2 leading-relaxed">
                            Updates on your activities will appear here
                        </p>
                    </div>
                )}
            </div>
            {/* ---------- CLEAR ALL CONFIRMATION MODAL ---------- */}
            <AnimatePresence>
                {isClearModalOpen && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm lg:pl-[260px]">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-[#0B1121] rounded-[2rem] p-6 max-sm:p-5 max-w-[320px] w-full shadow-2xl border border-slate-100 dark:border-white/5 text-center"
                        >
                            <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Trash2 size={32} className="text-rose-500" />
                            </div>
                            
                            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2">Clear Notifications?</h3>
                            <p className="text-[13px] max-sm:text-[12.5px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed mb-8 px-4">
                                All notifications will be permanently removed from your history.
                            </p>

                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => setIsClearModalOpen(false)}
                                    className="py-3.5 px-4 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 font-black text-[14px] rounded-2xl transition-all active:scale-95"
                                >
                                    No, keep it
                                </button>
                                <button 
                                    onClick={clearAllNotifications}
                                    className="py-3.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[14px] rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                                >
                                    Yes, delete
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Notifications;
