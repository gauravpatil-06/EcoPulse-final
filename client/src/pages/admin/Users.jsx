import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
    Users as UsersIcon,
    Search,
    Filter,
    ArrowLeft,
    RefreshCw,
    Eye,
    Trash2,
    MapPin,
    Mail,
    Phone,
    Calendar,
    Award,
    CheckCircle2,
    XCircle,
    ChevronDown,
    ArrowUpDown,
    User as UserIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const UserAvatar = ({ name, avatar, size = "w-10 h-10", className = "" }) => (
    <div className={`${size} rounded-full overflow-hidden border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-emerald-500 font-black shrink-0 ${className}`}>
        {avatar ? <img src={avatar} className="w-full h-full object-cover" alt={name} /> : (name ? name.charAt(0).toUpperCase() : '?')}
    </div>
);

const AdminUsers = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [statusUpdating, setStatusUpdating] = useState(null);
    const [timeFilter, setTimeFilter] = useState('all');

    const [activeModule, setActiveModule] = useState(sessionStorage.getItem('adminModule') || 'citizen');

    // Auto-sync state with storage
    useEffect(() => {
        const interval = setInterval(() => {
            const stored = sessionStorage.getItem('adminModule') || 'citizen';
            if (stored !== activeModule) {
                setActiveModule(stored);
            }
        }, 500);
        return () => clearInterval(interval);
    }, [activeModule]);

    const roleFilter = activeModule === 'citizen' ? 'Citizen' : 'Collector';

    useEffect(() => {
        setLoading(true);
        fetchUsers();
    }, [activeModule]);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`/api/admin/users`, {
                headers: { 'x-auth-token': token },
                params: {
                    role: roleFilter
                }
            });
            setUsers(res.data || []);
        } catch (err) {
            console.error('Failed to fetch users:', err);
            toast.error('Failed to sync live data');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchUsers();
        setTimeout(() => setIsRefreshing(false), 500);
    };

    const toggleStatus = async (userId, currentStatus) => {
        try {
            setStatusUpdating(userId);
            const token = localStorage.getItem('token');
            await axios.put(`/api/admin/users/${userId}/status`, { isActive: !currentStatus }, {
                headers: { 'x-auth-token': token }
            });
            toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
            fetchUsers();
        } catch (err) {
            toast.error('Failed to update user status');
        } finally {
            setStatusUpdating(null);
        }
    };

    const [deletingUserId, setDeletingUserId] = useState(null);

    const handleConfirmDelete = async () => {
        if (!deletingUserId) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/admin/users/${deletingUserId}`, {
                headers: { 'x-auth-token': token }
            });
            // Update local state after successful server deletion
            setUsers(users.filter(u => u._id !== deletingUserId));
            toast.success('User record permanently deleted');
        } catch (err) {
            console.error('Delete error:', err);
            toast.error(err.response?.data?.message || 'Failed to delete user');
        } finally {
            setDeletingUserId(null);
        }
    };

    const filteredUsers = useMemo(() => {
        let result = users.filter(user => {
            // Search Match
            const nameMatch = (user.name || '').toLowerCase().includes(searchTerm.toLowerCase());
            const emailMatch = (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
            const zoneMatch = (user.zone || '').toLowerCase().includes(searchTerm.toLowerCase());
            const areaMatch = (user.area || '').toLowerCase().includes(searchTerm.toLowerCase());
            const searchMatch = nameMatch || emailMatch || zoneMatch || areaMatch;

            // Date filtering
            const dateObj = new Date(user.createdAt);
            const now = new Date();
            let fromDate = null;

            if (timeFilter === '7d') fromDate = new Date(now.setDate(now.getDate() - 7));
            else if (timeFilter === 'monthly') fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
            else if (timeFilter === 'yearly') fromDate = new Date(now.getFullYear(), 0, 1);

            const dateMatch = fromDate ? dateObj >= fromDate : true;
            return searchMatch && dateMatch;
        });

        if (sortBy === 'newest') return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        if (sortBy === 'oldest') return result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        return result;
    }, [users, searchTerm, sortBy]);

    // Removed syncing records progress bar as per user request

    return (
        <div className="space-y-6 animate-fade-in pb-10 max-w-full">
            {/* Header Area */}
            <PageHeader
                title={activeModule === 'citizen' ? 'Manage Citizens' : 'Manage Swachhta Mitra'}
                subtitle={`Review and manage all registered ${activeModule === 'citizen' ? 'citizens' : 'city workers'} across zones.`}
                icon={activeModule === 'citizen' ? UserIcon : UsersIcon}
                right={
                    <div className="flex items-center gap-2">
                        <div className="hidden lg:flex items-center gap-3 px-6 py-2.5 bg-emerald-600 rounded-full shadow-lg shadow-emerald-600/25 border border-transparent hover:border-white/50 transition-all cursor-default relative overflow-hidden min-w-[200px]">
                            <div className="relative z-10 w-full text-center sm:text-left">
                                <p className="text-[10px] font-bold text-white/90 tracking-wide uppercase">Total {activeModule === 'citizen' ? 'Citizens' : 'Mitra'}</p>
                                <div className="flex items-baseline gap-1.5 justify-center sm:justify-start">
                                    <span className="text-3xl font-black tabular-nums text-white leading-tight">{filteredUsers.length}</span>
                                    <span className="text-[11px] font-black text-white/80 uppercase">Active</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className={`shrink-0 p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-gray-500 hover:text-emerald-500 transition-all hover:shadow-md ${isRefreshing ? 'cursor-not-allowed opacity-50' : ''}`}
                        >
                            <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : 'hover:rotate-180 transition-transform duration-500'} />
                        </button>
                    </div>
                }
            />

            {/* Filter Bar */}
            <div className="space-y-4">
                <div className="flex flex-row items-center gap-3">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by name, email, area or zone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 sm:pl-11 pr-4 h-[40px] sm:h-[44px] bg-white dark:bg-gray-900 border-2 border-slate-100 dark:border-gray-800 rounded-xl focus:border-emerald-500 text-[11px] sm:text-[13px] text-gray-900 dark:text-white outline-none transition-all placeholder-gray-400 shadow-sm font-medium"
                        />
                    </div>

                    <button
                        onClick={() => setSortBy(prev => prev === 'newest' ? 'oldest' : 'newest')}
                        className="shrink-0 flex items-center justify-center gap-2 px-3 sm:px-4 h-[40px] sm:h-[44px] rounded-xl text-[11px] sm:text-[12px] font-black capitalize transition-all bg-white dark:bg-gray-900 border-2 border-slate-100 dark:border-gray-800 text-gray-600 hover:text-emerald-500 shadow-sm min-w-max"
                    >
                        <ArrowUpDown size={14} className="text-emerald-500" />
                        <span className="hidden sm:inline">{sortBy === 'newest' ? 'Newest First' : 'Oldest First'}</span>
                        <span className="inline sm:hidden">{sortBy === 'newest' ? 'Newest' : 'Oldest'}</span>
                    </button>
                </div>

                {/* Time Presets Row - Dedicated Line */}
                <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 dark:bg-emerald-500/5 rounded-xl border border-slate-100 dark:border-white/5 w-fit overflow-x-auto hide-scrollbar">
                    {[
                        { id: 'all', label: 'All' },
                        { id: '7d', label: 'Last 7 Days' },
                        { id: 'monthly', label: 'Monthly' },
                        { id: 'yearly', label: 'Yearly' }
                    ].map((filter) => (
                        <button
                            key={filter.id}
                            onClick={() => setTimeFilter(filter.id)}
                            className={`px-3 py-1.5 rounded-lg text-[12px] font-black transition-all whitespace-nowrap active:scale-95 ${timeFilter === filter.id
                                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                                : 'bg-white dark:bg-[#0B1121] text-slate-500 border border-slate-200 dark:border-white/10'
                                }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Premium Table Content */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-3xl shadow-xl overflow-hidden overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[1200px]">
                    <thead className="text-center">
                        <tr className="bg-emerald-500/10 dark:bg-emerald-500/5 border-b-2 border-gray-800/20 dark:border-white/30">
                            <th className="px-5 py-4 text-[11px] font-black text-gray-800 dark:text-gray-200 uppercase tracking-widest whitespace-nowrap text-center border-r border-gray-800/10 dark:border-white/20">Full Name</th>
                            <th className="px-5 py-4 text-[11px] font-black text-gray-800 dark:text-gray-200 uppercase tracking-widest whitespace-nowrap text-center border-r border-gray-800/10 dark:border-white/20">Email Address</th>
                            <th className="px-5 py-4 text-[11px] font-black text-gray-800 dark:text-gray-200 uppercase tracking-widest whitespace-nowrap text-center border-r border-gray-800/10 dark:border-white/20">Phone Number</th>
                            <th className="px-5 py-4 text-[11px] font-black text-gray-800 dark:text-gray-200 uppercase tracking-widest whitespace-nowrap text-center border-r border-gray-800/10 dark:border-white/20">Zone</th>
                            <th className="px-5 py-4 text-[11px] font-black text-gray-800 dark:text-gray-200 uppercase tracking-widest whitespace-nowrap text-center border-r border-gray-800/10 dark:border-white/20">City</th>

                            <th className="px-5 py-4 text-[11px] font-black text-gray-800 dark:text-gray-200 uppercase tracking-widest whitespace-nowrap text-center border-r border-gray-800/10 dark:border-white/20">Joined Date</th>
                            <th className="px-5 py-4 text-[11px] font-black text-gray-800 dark:text-gray-200 uppercase tracking-widest whitespace-nowrap text-center border-r border-gray-800/10 dark:border-white/20">Latest Badges Earned</th>
                            <th className="px-5 py-4 text-[11px] font-black text-gray-800 dark:text-gray-200 uppercase tracking-widest whitespace-nowrap text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/10 dark:divide-white/20">
                        <AnimatePresence mode='popLayout'>
                            {filteredUsers.length > 0 ? filteredUsers.map((u, i) => (
                                <motion.tr
                                    key={u._id || i}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.2, delay: i * 0.03 }}
                                    className={`hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group ${!u.isActive ? 'opacity-70 grayscale-[0.5]' : ''}`}
                                >
                                    {/* Full Name */}
                                    <td className="px-5 py-4 border-r border-gray-800/10 dark:border-white/20 whitespace-nowrap min-w-[200px]">
                                        <div className="flex items-center gap-3">
                                            <UserAvatar name={u.name} avatar={u.avatar} size="w-9 h-9" />
                                            <span className="text-sm font-black text-gray-900 dark:text-white">{u.name}</span>
                                        </div>
                                    </td>

                                    {/* Email */}
                                    <td className="px-5 py-4 border-r border-gray-800/10 dark:border-white/20 whitespace-nowrap">
                                        <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
                                            <span className="text-xs font-bold">{u.email}</span>
                                        </div>
                                    </td>

                                    {/* Phone */}
                                    <td className="px-5 py-4 border-r border-gray-800/10 dark:border-white/20 text-center whitespace-nowrap">
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{(u.phone || '910000000000').toString().replace('+', '')}</span>
                                    </td>

                                    {/* Zone */}
                                    <td className="px-5 py-4 border-r border-gray-800/10 dark:border-white/20 text-center whitespace-nowrap">
                                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 capitalize">
                                            {u.zone} Zone
                                        </span>
                                    </td>

                                    {/* City */}
                                    <td className="px-5 py-4 border-r border-gray-800/10 dark:border-white/20 text-center font-bold text-xs text-slate-600 dark:text-slate-400 capitalize whitespace-nowrap">
                                        {u.city || 'Pune'}
                                    </td>



                                    {/* Joined Date */}
                                    <td className="px-5 py-4 border-r border-gray-800/10 dark:border-white/20 text-center whitespace-nowrap">
                                        <div className="flex flex-col items-center gap-0.5">
                                            <span className="text-[11px] font-black text-slate-700 dark:text-slate-300">
                                                {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Badges Earned */}
                                    <td className="px-5 py-4 border-r border-gray-800/10 dark:border-white/20 text-center whitespace-nowrap min-w-[180px]">
                                        <div className="flex flex-wrap items-center justify-center gap-1">
                                            {u.badges && u.badges.length > 0 ? (
                                                u.badges.slice(0, 2).map((badge, idx) => (
                                                    <span key={idx} className="text-[9px] font-black px-2 py-0.5 bg-amber-50 dark:bg-amber-950/20 text-amber-600 border border-amber-500/20 rounded-md">
                                                        {badge}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-[10px] font-bold text-slate-400">New Member</span>
                                            )}
                                        </div>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-center gap-3">
                                            <button
                                                onClick={() => setDeletingUserId(u._id)}
                                                className="p-2 text-rose-500 hover:text-rose-700 transition-all"
                                                title="Delete Record"
                                            >
                                                <Trash2 size={18} strokeWidth={2.5} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            )) : (
                                <tr>
                                    <td colSpan="10" className="py-20 text-center">
                                        <UserIcon size={40} className="mx-auto text-slate-100 dark:text-white/5 mb-4" />
                                        <p className="text-sm font-bold text-slate-400 italic">No users found matching your search.</p>
                                    </td>
                                </tr>
                            )}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {/* ---------- DELETE CONFIRMATION MODAL ---------- */}
            <AnimatePresence>
                {deletingUserId && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-[4px] p-6 lg:pl-[260px]"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-3xl p-10 w-full max-w-[360px] shadow-2xl text-center border border-slate-100"
                        >
                            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-6 border border-red-100">
                                <Trash2 size={28} />
                            </div>

                            <h3 className="text-[1.25rem] font-black text-slate-800 mb-3 tracking-tight">Delete Record?</h3>
                            <p className="text-[14px] font-bold text-slate-500 mb-10 leading-relaxed">
                                Are you sure you want to delete this report?
                            </p>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setDeletingUserId(null)}
                                    className="flex-1 py-4 text-[14px] font-black bg-[#f8fafc] text-slate-600 rounded-2xl hover:bg-slate-100 transition-all border border-slate-100"
                                >
                                    No, keep it
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    className="flex-1 py-4 text-[14px] font-black bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all"
                                >
                                    Yes, delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminUsers;