import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Trophy, Medal, Crown, Zap, 
    CheckSquare, RefreshCw, Info, 
    Search, Trash2, TrendingUp, 
    ArrowUpDown, User as UserIcon,
    Star, FileText, CheckCircle2, Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import PageHeader from '../components/PageHeader';
import { toast } from 'react-hot-toast';

const UserAvatar = ({ name, avatar, size = "w-10 h-10", className = "" }) => (
    <div className={`${size} rounded-full overflow-hidden border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-emerald-500 font-black shrink-0 ${className}`}>
        {avatar ? <img src={avatar} className="w-full h-full object-cover" alt={name} /> : (name ? name.charAt(0).toUpperCase() : '?')}
    </div>
);

export const Leaderboard = () => {
    const { user: currentUser } = useAuth();
    const { theme } = useTheme();
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [deletingId, setDeletingId] = useState(null);
    const [filters, setFilters] = useState({
        searchTerm: '',
        timeFilter: 'all',
        sortBy: 'latest'
    });

    const isDark = theme === 'dark';

    const filterOpts = [
        { id: 'all', label: 'All Rankers' },
        { id: 'top10', label: 'Top 10' },
        { id: 'top50', label: 'Top 50' },
        { id: 'top100', label: 'Top 100' }
    ];

    const fetchLeaderboard = async () => {
        try {
            const res = await axios.get('/api/leaderboard');
            setLeaderboard(res.data || []);
        } catch (error) {
            console.error('Failed to fetch leaderboard data', error);
            toast.error('Failed to sync live rankings');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchLeaderboard();
        setRefreshKey(prev => prev + 1);
        setTimeout(() => {
            setIsRefreshing(false);
        }, 100); // ⚡ Ultra-fast: 0.1s delay for near-instant data sync feel
    };

    const confirmDelete = async () => {
        if (!deletingId) return;
        try {
            setLeaderboard(leaderboard.filter(u => u.id !== deletingId));
            toast.success('Entry removed from leaderboard');
        } catch (error) {
            toast.error('Failed to remove entry');
        } finally {
            setDeletingId(null);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const handleTimePillClick = (id) => {
        setFilters(prev => ({ ...prev, timeFilter: id }));
    };

    const filteredLeaderboard = useMemo(() => {
        let result = leaderboard.filter(u => u.role !== 'admin');

        if (filters.searchTerm) {
            const query = filters.searchTerm.toLowerCase().trim();
            result = result.filter(u => u.name.toLowerCase().includes(query));
        }

        if (filters.timeFilter === 'top10') result = result.slice(0, 10);
        else if (filters.timeFilter === 'top50') result = result.slice(0, 50);
        else if (filters.timeFilter === 'top100') result = result.slice(0, 100);

        if (filters.sortBy === 'oldest') {
            result.reverse();
        }

        return result;
    }, [leaderboard, filters]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#0B1121] flex flex-col items-center justify-center transition-colors">
                <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                <p className="mt-4 text-emerald-500 font-bold uppercase tracking-widest text-[11px]">Loading...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10 max-w-[1440px] mx-auto px-[12px] md:px-[40px] lg:px-[60px] pt-24 min-h-screen bg-white dark:bg-[#0B1121] transition-colors">
            {/* Header Area */}
            <PageHeader
                icon={Trophy}
                title="Global Leaderboard"
                subtitle="Tracking top performers and consistency across the entire platform."
                right={
                    <div className="flex items-center gap-2">
                        <motion.div
                            key={refreshKey}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4 }}
                            className="hidden lg:flex items-center gap-3 px-6 py-2.5 bg-emerald-600 rounded-full shadow-lg shadow-emerald-600/25 border border-transparent hover:border-white/50 transition-all cursor-default relative overflow-hidden min-w-[220px]"
                        >
                            <div className="absolute inset-0 opacity-[0.1] pointer-events-none"
                                style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '12px 12px' }}>
                            </div>

                            <div className="absolute inset-0 pointer-events-none opacity-[0.25]">
                                <svg width="100%" height="100%" viewBox="0 0 200 60" preserveAspectRatio="none">
                                    <path d="M0,55 L20,48 L40,52 L60,40 L80,45 L100,30 L120,35 L140,15 L160,20 L180,5 L200,8" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M0,55 L20,48 L40,52 L60,40 L80,45 L100,30 L120,35 L140,15 L160,20 L180,5 L200,8 L200,60 L0,60 Z" fill="white" opacity="0.2" />
                                    <circle cx="180" cy="5" r="3" fill="white" className="animate-pulse" />
                                </svg>
                            </div>

                            <div className="relative z-10 w-full text-center sm:text-left">
                                <p className="text-[10px] font-bold text-white/90 tracking-wide uppercase">Top Contributors</p>
                                <div className="flex items-baseline gap-1.5 justify-center sm:justify-start">
                                    <span className="text-3xl font-black tabular-nums text-white leading-tight">{filteredLeaderboard.length}</span>
                                    <span className="text-[11px] font-black text-white/80 uppercase">Active</span>
                                </div>
                                <p className="text-[9px] font-semibold text-white/60 italic mt-0.5 whitespace-nowrap">Actively competing for Rank 1</p>
                            </div>
                        </motion.div>
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className={`shrink-0 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-gray-500 hover:text-emerald-500 transition-all hover:shadow-md ${isRefreshing ? 'cursor-not-allowed opacity-50' : ''}`}
                            title="Refresh Data"
                        >
                            <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : 'hover:scale-110'} />
                        </button>
                    </div>
                }
            />

            <motion.div
                key={refreshKey}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }} // ⚡ Faster entry for better UX
                className="space-y-6"
            >
                {/* Filter Bar */}
                <div className="flex flex-row items-center gap-2">
                    <div className="relative flex-1 group">
                        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isRefreshing ? 'text-emerald-500 animate-pulse' : 'text-gray-400'}`} size={16} />
                        <input
                            type="text"
                            placeholder="Search by contributor name..."
                            value={filters.searchTerm}
                            onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                            className="w-full pl-11 pr-4 h-[38px] bg-transparent border-2 border-gray-100 dark:border-gray-800 rounded-xl focus:border-emerald-500 text-[13px] text-gray-900 dark:text-white outline-none transition-all placeholder-gray-400 shadow-sm"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setFilters(prev => ({ ...prev, sortBy: prev.sortBy === 'latest' ? 'oldest' : 'latest' }))}
                            className="flex items-center gap-1.5 px-4 h-[38px] rounded-xl text-[10px] font-black capitalize transition-all bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 text-gray-500 hover:text-emerald-500 shadow-sm"
                        >
                            <ArrowUpDown size={11} className="text-emerald-500" />
                            {filters.sortBy === 'latest' ? 'Newest' : 'Oldest'}
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    {filterOpts.map(pill => (
                        <button
                            key={pill.id}
                            onClick={() => handleTimePillClick(pill.id)}
                            className={`px-3.5 py-1.5 rounded-lg text-[11px] font-black capitalize transition-all whitespace-nowrap ${filters.timeFilter === pill.id
                                ? 'bg-emerald-600 text-white shadow-lg border-none'
                                : 'bg-transparent text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 border-2 border-gray-100 dark:border-gray-800'
                                }`}
                        >
                            {pill.label}
                        </button>
                    ))}
                </div>

                {/* Table Area */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-3xl shadow-xl overflow-hidden overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[1250px]">
                        <thead className="text-center">
                            <tr className="bg-emerald-500/10 dark:bg-emerald-500/5 border-b-2 border-gray-800/20 dark:border-white/30">
                                <th className="px-3 py-3 text-[11px] font-black text-gray-800 dark:text-gray-200 uppercase tracking-widest whitespace-nowrap text-center border-r border-gray-800/10 dark:border-white/20 w-20">Rank No</th>
                                <th className="px-[15px] py-3 text-[11px] font-black text-gray-800 dark:text-gray-200 uppercase tracking-widest whitespace-nowrap text-center border-r border-gray-800/10 dark:border-white/20">Contributor</th>
                                <th className="px-5 py-3 text-[11px] font-black text-gray-800 dark:text-gray-200 uppercase tracking-widest whitespace-nowrap text-center border-r border-gray-800/10 dark:border-white/20">Role</th>
                                <th className="px-5 py-3 text-[11px] font-black text-gray-800 dark:text-gray-200 uppercase tracking-widest whitespace-nowrap text-center border-r border-gray-800/10 dark:border-white/20">Total Score</th>
                                <th className="px-5 py-3 text-[11px] font-black text-gray-800 dark:text-gray-200 uppercase tracking-widest whitespace-nowrap text-center border-r border-gray-800/10 dark:border-white/20">Daily Score</th>
                                <th className="px-5 py-3 text-[11px] font-black text-gray-800 dark:text-gray-200 uppercase tracking-widest whitespace-nowrap text-center border-r border-gray-800/10 dark:border-white/20">Reports</th>
                                <th className="px-5 py-3 text-[11px] font-black text-gray-800 dark:text-gray-200 uppercase tracking-widest whitespace-nowrap text-center border-r border-gray-800/10 dark:border-white/20">Resolved</th>
                                <th className="px-5 py-3 text-[11px] font-black text-gray-800 dark:text-gray-200 uppercase tracking-widest whitespace-nowrap text-center border-r border-gray-800/10 dark:border-white/20">Badges</th>
                                <th className="px-5 py-3 text-[11px] font-black text-gray-800 dark:text-gray-200 uppercase tracking-widest whitespace-nowrap text-center">Success Rate %</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/10 dark:divide-white/20">
                            <AnimatePresence mode='popLayout'>
                                {filteredLeaderboard.map((u, i) => (
                                    <motion.tr
                                        key={u.id || i}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className={`hover:bg-[#47C4B7]/5 transition-colors group ${u.id === currentUser?.id ? 'bg-emerald-500/5' : ''}`}
                                    >
                                        {/* Rank No */}
                                        <td className="px-5 py-3 text-center border-r border-gray-800/10 dark:border-white/20">
                                            <div className="flex flex-col items-center justify-center">
                                                <span className="text-xs font-black text-gray-800 dark:text-gray-200">{String(i + 1).padStart(2, '0')}</span>
                                            </div>
                                        </td>

                                        {/* User Name */}
                                        <td className="px-[15px] py-3 border-r border-gray-800/10 dark:border-white/20">
                                           <div className="flex items-center gap-3">
                                                <UserAvatar name={u.name} avatar={u.avatar} size="w-9 h-9" className={i === 0 ? 'border-amber-400' : ''} />
                                                <div className="flex flex-col">
                                                    <span className="text-xs sm:text-sm font-black text-gray-900 dark:text-white whitespace-nowrap flex items-center gap-2">
                                                        {u.name}
                                                        {u.id === currentUser?.id && <span className="px-2 py-0.5 bg-emerald-500 text-[9px] text-white rounded-full">YOU</span>}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Role */}
                                        <td className="px-6 py-3 text-center border-r border-gray-800/10 dark:border-white/20">
                                             <span className={`text-[11px] font-black capitalize tracking-wider ${
                                                u.role === 'admin' ? 'text-purple-600' :
                                                u.role === 'Swachhta Mitra' ? 'text-blue-600' : 'text-emerald-600'
                                             }`}>
                                                {u.role}
                                             </span>
                                        </td>

                                        {/* Total Score */}
                                        <td className="px-6 py-3 text-center border-r border-gray-800/10 dark:border-white/20">
                                            <div className="flex flex-col items-center">
                                                <span className="text-sm font-black text-amber-600 dark:text-amber-500">{u.totalScore}</span>
                                            </div>
                                        </td>

                                        {/* Daily Score */}
                                        <td className="px-6 py-3 text-center border-r border-gray-800/10 dark:border-white/20">
                                            <div className="flex flex-col items-center">
                                                <span className="text-sm font-black text-emerald-600">{u.dailyScore > 0 ? `+${u.dailyScore}` : '0'}</span>
                                            </div>
                                        </td>

                                        {/* Reports */}
                                        <td className="px-6 py-3 text-center border-r border-gray-800/10 dark:border-white/20">
                                            <div className="flex flex-col items-center">
                                                <span className="text-sm font-black text-slate-700 dark:text-slate-200">{u.totalReports}</span>
                                            </div>
                                        </td>

                                        {/* Resolved */}
                                        <td className="px-6 py-3 text-center border-r border-gray-800/10 dark:border-white/20 font-black text-emerald-500">
                                            <div className="flex flex-col items-center">
                                                <span className="text-sm font-black">{u.resolvedReports}</span>
                                            </div>
                                        </td>

                                        {/* Badges */}
                                        <td className="px-6 py-3 text-center border-r border-gray-800/10 dark:border-white/20">
                                            <div className="flex flex-col items-center">
                                                <span className="text-sm font-black text-gray-800 dark:text-gray-200">{u.badgeCount}</span>
                                            </div>
                                        </td>

                                        {/* Success Rate */}
                                        <td className="px-6 py-3 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-24 h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${u.successRate}%` }}
                                                        className="h-full bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                                                    />
                                                </div>
                                                <span className="text-[11px] font-black text-gray-900 dark:text-white uppercase">{u.successRate}%</span>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>

                    {filteredLeaderboard.length === 0 && (
                        <div className="py-24 text-center">
                            <Info size={40} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-sm font-bold text-gray-400 italic">No contributors found matching your criteria.</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default Leaderboard;
