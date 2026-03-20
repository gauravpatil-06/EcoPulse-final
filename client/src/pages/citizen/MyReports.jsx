import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
    Trash2,
    Edit,
    Clock,
    CheckCircle2,
    AlertCircle,
    MapPin,
    Calendar,
    ArrowLeft,
    Loader2,
    X,
    Filter,
    Search,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    RotateCw,
    FileText as FileTextIcon,
    PlusCircle,
    Map,
    Phone,
    Maximize,
    Minimize2,
    Eye,
    Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import useDebounce from '../../hooks/useDebounce';
import PageHeader from '../../components/PageHeader';
import toast from 'react-hot-toast';

const MyReports = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const locationState = useLocation();

    // Hover styles matching Dashboard
    const cardBaseStyle = {
        transition: 'transform 0.28s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.28s ease, border-color 0.28s ease',
    };
    const cardHoverStyle = {
        transform: 'scale(1.01) translateY(-2px)',
        boxShadow: '0 20px 40px -8px rgba(16, 185, 129, 0.12)',
        borderColor: 'rgba(16, 185, 129, 0.3)',
    };

    const [hoveredCard, setHoveredCard] = useState(null);

    // Core Data
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Sync Filters State
    const queryParams = new URLSearchParams(locationState.search);
    const initialStatus = queryParams.get('status') || 'All';

    const [filters, setFilters] = useState({
        status: initialStatus,
        topic: '', // search query
        from: '',
        to: '',
        timeFilter: 'all',
        urgency: 'All',
        sortBy: 'newest'
    });

    // Deletion Modal State
    const [deletingReportId, setDeletingReportId] = useState(null);

    const handleConfirmDelete = async () => {
        if (!deletingReportId) return;
        const snapshot = [...reports];
        const idToRemove = deletingReportId;

        // --- INSTANT OPTIMISTIC DELETE ---
        const updatedReports = reports.filter(r => r._id !== idToRemove);
        setReports(updatedReports);
        setDeletingReportId(null);
        
        toast.success('Report removed from list');

        try {
            const token = localStorage.getItem('token');
            // Silent background sync
            axios.delete(`/api/reports/${idToRemove}`, {
                headers: { 'x-auth-token': token }
            });
        } catch (err) {
            // Rollback silently on sync failure or later on refetch
            console.error('Delete sync failed:', err);
        }
    };

    const [expandedReports, setExpandedReports] = useState(new Set());
    const [viewingReport, setViewingReport] = useState(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const [isEvidenceView, setIsEvidenceView] = useState(false);
    const [isZoomedFromThumbnail, setIsZoomedFromThumbnail] = useState(false);
    const [cardImageIndexes, setCardImageIndexes] = useState({});

    // 🧱 DERIVED SOURCE (Always up to date with mode)
    const allPhotos = viewingReport?.photos || [];
    const initialCount = viewingReport?.initialPhotoCount !== undefined ? Number(viewingReport.initialPhotoCount) : (allPhotos.length > 0 ? 1 : 0);
    const citizenPhotos = allPhotos.slice(0, initialCount);
    const evidencePhotos = allPhotos.slice(initialCount);
    const displayPhotos = isEvidenceView ? evidencePhotos : citizenPhotos;

    // Touch handlers for swipe
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd || displayPhotos.length <= 1) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            setActiveImageIndex((prev) => (prev < displayPhotos.length - 1 ? prev + 1 : 0));
        }
        if (isRightSwipe) {
            setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : displayPhotos.length - 1));
        }
    };

    // 🚀 Performance Cache: Store full report details to avoid re-fetching
    const [fetchedReports, setFetchedReports] = useState({});

    const prefetchReport = async (reportId) => {
        if (fetchedReports[reportId]) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`/api/reports/${reportId}`, {
                headers: { 'x-auth-token': token }
            });
            setFetchedReports(prev => ({ ...prev, [reportId]: res.data }));
        } catch (err) {
            console.error('Prefetch error:', err);
        }
    };

    const handleViewReport = async (report) => {
        try {
            setIsEvidenceView(false); // 🔥 ALWAYS RESET: Entering Normal Details Mode
            setActiveImageIndex(0); // 🔥 ALWAYS RESET: Start from first photo
            
            // Check cache first for instant load
            let fullData = fetchedReports[report._id];
            
            // Show what we have initially (for the card data)
            setViewingReport(fullData || report);
            
            if (!fullData) {
                const token = localStorage.getItem('token');
                const res = await axios.get(`/api/reports/${report._id}`, {
                    headers: { 'x-auth-token': token }
                });
                fullData = res.data;
                setFetchedReports(prev => ({ ...prev, [report._id]: fullData }));
                setViewingReport(fullData);
            }
        } catch (err) {
            console.error('Failed to load full report details:', err);
        }
    };

    const handleViewEvidence = async (report) => {
        try {
            let fullReport = fetchedReports[report._id];
            
            if (!fullReport) {
                const token = localStorage.getItem('token');
                const res = await axios.get(`/api/reports/${report._id}`, {
                    headers: { 'x-auth-token': token }
                });
                fullReport = res.data;
                setFetchedReports(prev => ({ ...prev, [report._id]: fullReport }));
            }

            setIsEvidenceView(true);
            setViewingReport(fullReport);
            setIsZoomed(true);
            setIsZoomedFromThumbnail(true);
            setActiveImageIndex(0);
        } catch (err) {
            console.error('Failed to load evidence:', err);
            toast.error('Failed to load evidence images');
        }
    };

    const toggleExpandReport = (reportId) => {
        setExpandedReports(prev => {
            const next = new Set(prev);
            if (next.has(reportId)) next.delete(reportId);
            else next.add(reportId);
            return next;
        });
    };

    const debouncedSearch = useDebounce(filters.topic, 500);

    useEffect(() => {
        fetchReports();
        const interval = setInterval(fetchReports, 15000); // ⚡ Reduced frequency for performance
        return () => clearInterval(interval);
    }, []); 

    // ⚡ IMAGE PRELOADER (Memory Safe: Next/Prev Only)
    useEffect(() => {
        if (viewingReport && displayPhotos.length > 0) {
            const current = activeImageIndex;
            const preloadIndexes = [current, current + 1, current - 1];

            preloadIndexes.forEach(i => {
                const targetIdx = i < 0 ? displayPhotos.length - 1 : i % displayPhotos.length;
                const src = displayPhotos[targetIdx];
                if (src) {
                    const img = new Image();
                    img.src = src;
                }
            });
        }
    }, [viewingReport, isEvidenceView, activeImageIndex]);

    const fetchReports = async () => {
        try {
            // Only show spinner if no data exists (prevents flickering on filter/search)
            if (reports.length === 0) {
                setLoading(true);
            }
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/reports', {
                headers: { 'x-auth-token': token },
                params: {
                    // Fetch everything for the user to enable instant local filtering
                    sortBy: 'newest' 
                }
            });

            // Removed large console log for performance
            // console.log("API Full Response:", res.data);

            // 🛡️ SAFE DATA HANDLING (Supports both array and object)
            const dataReceived = res.data;
            let finalReports = [];

            if (Array.isArray(dataReceived)) {
                finalReports = dataReceived; 
            } else if (dataReceived && dataReceived.reports) {
                finalReports = dataReceived.reports;
            } else if (dataReceived && typeof dataReceived === 'object' && !dataReceived.reports) {
                // If it's an object but doesn't have .reports, maybe it's the data itself?
                // But as per our backend, it should be in .reports.
                finalReports = [];
            }

            console.log(`Setting state with ${finalReports.length} reports.`);
            setReports(finalReports);
            setFetchedReports({}); // CLEAR CACHE so hover/click gets fresh evidence if updated
            setError(''); // Clear any previous errors
        } catch (err) {
            console.error("FETCH ERROR:", err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to fetch reports.');
            toast.error('Could not load reports.');
        } finally {
            setLoading(false);
        }
    };

    const filteredReports = useMemo(() => {
        let result = reports.filter(report => {
            // Instant Search (Local)
            const searchText = debouncedSearch.toLowerCase();
            const searchMatch = !searchText || 
                (report.area || '').toLowerCase().includes(searchText) || 
                (report.location || '').toLowerCase().includes(searchText) || 
                (report.landmark || '').toLowerCase().includes(searchText) || 
                (report.description || '').toLowerCase().includes(searchText);

            // Instant Status Filter (Local)
            const statusMatch = filters.status === 'All' || report.status === filters.status;

            // Instant Urgency Filter (Local)
            const urgencyMatch = filters.urgency === 'All' || report.urgency === filters.urgency;

            // Date Filtering
            const dateObj = new Date(report.createdAt);
            let fromDate = filters.from ? new Date(filters.from) : null;
            let toDate = filters.to ? new Date(filters.to) : null;

            if (filters.timeFilter !== 'all' && !filters.from && !filters.to) {
                const now = new Date();
                if (filters.timeFilter === '7d') fromDate = new Date(now.setDate(now.getDate() - 7));
                if (filters.timeFilter === 'monthly') fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
                if (filters.timeFilter === 'yearly') fromDate = new Date(now.getFullYear(), 0, 1);
            }

            let dateMatch = true;
            if (fromDate) dateMatch = dateMatch && dateObj >= fromDate;
            if (toDate) {
                const end = new Date(toDate);
                end.setHours(23, 59, 59, 999);
                dateMatch = dateMatch && dateObj <= end;
            }

            return searchMatch && statusMatch && urgencyMatch && dateMatch;
        });

        // Instant Sorting (Local)
        return result.sort((a, b) => {
            if (filters.sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
            if (filters.sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);

            const priorityMap = { 'High': 3, 'Medium': 2, 'Low': 1 };
            if (filters.sortBy === 'priority-high') return (priorityMap[b.urgency] || 0) - (priorityMap[a.urgency] || 0);
            if (filters.sortBy === 'priority-low') return (priorityMap[a.urgency] || 0) - (priorityMap[b.urgency] || 0);
            return 0;
        });
    }, [reports, filters, debouncedSearch]);

    const groupReportsByDate = (reportsList) => {
        const groups = {};
        reportsList.forEach(report => {
            const dateStr = new Date(report.createdAt).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
            }).toUpperCase();
            if (!groups[dateStr]) groups[dateStr] = [];
            groups[dateStr].push(report);
        });
        return Object.entries(groups).sort((a, b) => new Date(b[0]) - new Date(a[0]));
    };

    const groupedEntries = groupReportsByDate(filteredReports);

    return (
        <div className="space-y-4 max-w-7xl mx-auto animate-fade-in font-sans">
            <PageHeader
                title="All Record"
                subtitle="View and manage your entire report history"
                icon={FileTextIcon}
            />

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col gap-3 sm:gap-4 mb-2"
            >
                {/* Search Bar Row */}
                <div className="flex items-center gap-2 w-full">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={14} />
                        <input
                            type="text"
                            placeholder="Search area, landmark or description..."
                            value={filters.topic}
                            onChange={(e) => setFilters({ ...filters, topic: e.target.value })}
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#0B1121] border border-slate-200 dark:border-white/10 rounded-xl focus:ring-1 focus:ring-emerald-500/30 focus:border-emerald-500 text-[13px] font-medium text-slate-700 dark:text-white outline-none transition-all placeholder-slate-400 shadow-sm"
                        />
                    </div>
                    {/* Add Button - Integrated Laptop Spot */}
                    <button
                        onClick={() => navigate('/citizen/report')}
                        className="hidden sm:flex shrink-0 items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-[1.02] active:scale-95 group"
                    >
                        <PlusCircle size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                        <span className="text-[13px]">Add Record</span>
                    </button>
                </div>

                {/* High-Fidelity Multi-Tier Filter Hub - Synced Mobile/Desktop Views */}
                <div className="flex flex-col sm:flex-row sm:flex-wrap items-center gap-x-2 gap-y-3">
                    {/* TIER 1: Time Controls - Slider on Mobile, Integrated on Desktop */}
                    <div className="flex items-center gap-2 max-sm:w-full max-sm:overflow-x-auto max-sm:pb-1 max-sm:hide-scrollbar shrink-0">
                        {/* Date Block */}
                        <div className="flex items-center gap-1.5 shrink-0">
                            <div className="flex items-center px-2 py-1.5 rounded-lg bg-transparent text-slate-500 border border-slate-200 dark:border-slate-800">
                                <input
                                    type={filters.from ? "date" : "text"}
                                    placeholder="DD-MM-YYYY"
                                    onFocus={(e) => (e.target.type = "date")}
                                    onBlur={(e) => !e.target.value && (e.target.type = "text")}
                                    value={filters.from}
                                    onChange={e => setFilters({ ...filters, from: e.target.value, timeFilter: 'all' })}
                                    className="bg-transparent border-none text-[12px] font-black focus:ring-0 p-0 w-[95px] outline-none uppercase"
                                />
                            </div>
                            <div className="flex items-center px-2 py-1.5 rounded-lg bg-transparent text-slate-500 border border-slate-200 dark:border-slate-800">
                                <input
                                    type={filters.to ? "date" : "text"}
                                    placeholder="DD-MM-YYYY"
                                    onFocus={(e) => (e.target.type = "date")}
                                    onBlur={(e) => !e.target.value && (e.target.type = "text")}
                                    value={filters.to}
                                    onChange={e => setFilters({ ...filters, to: e.target.value, timeFilter: 'all' })}
                                    className="bg-transparent border-none text-[12px] font-black focus:ring-0 p-0 w-[95px] outline-none uppercase"
                                />
                            </div>
                        </div>

                        {/* Presets Block */}
                        <div className="flex items-center gap-1 shrink-0">
                            {[{ id: '7d', label: 'Last 7 Days' }, { id: 'monthly', label: 'Monthly' }, { id: 'yearly', label: 'Yearly' }].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setFilters({ ...filters, timeFilter: item.id, from: '', to: '' })}
                                    className={`px-3 py-1.5 rounded-lg text-[12px] font-black transition-all whitespace-nowrap ${filters.timeFilter === item.id
                                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                                        : 'bg-white dark:bg-[#0B1121] text-slate-500 border border-slate-200 dark:border-white/10'
                                        }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* TIER 2: Status Selection - Grid/Wrap on Mobile & Desktop */}
                    <div className="flex items-center gap-1 shrink-0 max-sm:w-full max-sm:flex-wrap">
                        {['All', 'Pending', 'In Progress', 'Resolved'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilters({ ...filters, status })}
                                className={`px-3 py-1.5 rounded-lg text-[12px] font-black capitalize transition-all whitespace-nowrap ${filters.status === status
                                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                                    : 'bg-white dark:bg-[#0B1121] text-slate-500 border border-slate-200 dark:border-white/10'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    {/* TIER 3: Operational Routing - Dropdowns + Mobile Add Button */}
                    <div className="flex items-center gap-1.5 shrink-0 max-sm:w-full max-sm:flex-wrap">
                        <div className="relative group shrink-0">
                            <select
                                value={filters.urgency}
                                onChange={(e) => setFilters({ ...filters, urgency: e.target.value })}
                                className="appearance-none pl-2.5 pr-7 py-1.5 rounded-lg text-[12px] font-black bg-white dark:bg-[#0B1121] text-slate-500 border border-slate-200 dark:border-white/10 focus:ring-1 focus:ring-emerald-500/30 outline-none shadow-sm cursor-pointer"
                            >
                                <option value="All">All Urgency</option>
                                <option value="High">High Only</option>
                                <option value="Medium">Medium Only</option>
                                <option value="Low">Low Only</option>
                            </select>
                            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                        <div className="relative group shrink-0">
                            <select
                                value={filters.sortBy}
                                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                                className="appearance-none pl-2.5 pr-7 py-1.5 rounded-lg text-[12px] font-black bg-white dark:bg-[#0B1121] text-slate-500 border border-slate-200 dark:border-white/10 focus:ring-1 focus:ring-emerald-500/30 outline-none shadow-sm cursor-pointer"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="priority-high">Priority (H-L)</option>
                                <option value="priority-low">Priority (L-H)</option>
                            </select>
                            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                        {/* Mobile Add Button - Integrated Tier 3 */}
                        <button
                            onClick={() => navigate('/citizen/report')}
                            className="sm:hidden flex shrink-0 items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white font-black rounded-lg shadow-lg shadow-emerald-500/20 active:scale-95 transition-all outline-none"
                        >
                            <PlusCircle size={14} />
                            <span className="text-[11.5px]">Add</span>
                        </button>
                    </div>
                </div>
            </motion.div>

            <div className="min-h-[500px] flex flex-col">
                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] pb-24 sm:pb-0">
                        <div className="relative">
                            <Loader2 className="animate-spin text-emerald-500" size={42} strokeWidth={2.5} />
                            <div className="absolute inset-0 blur-xl bg-emerald-500/20 rounded-full animate-pulse" />
                        </div>
                        <p className="mt-4 text-slate-400 font-black text-[13px] tracking-tight animate-pulse opacity-60">Syncing your reports...</p>
                    </div>
                ) : groupedEntries.length > 0 ? (
                    <div className="space-y-6">
                        {groupedEntries.map(([date, groupReports]) => (
                            <div key={date}>
                                <div className="flex items-center gap-4 mb-3 px-2">
                                    <div className="bg-[#f1f5f9] px-4 py-1.5 rounded-full flex items-center gap-2 border border-slate-100/50 shrink-0">
                                        <Calendar size={14} className="text-[#10b981]" />
                                        <span className="text-[12px] font-black text-[#1a3353] tracking-wider">{date}</span>
                                    </div>
                                    <div className="h-[1px] flex-1 bg-slate-100/50" />
                                </div>

                                <div className="space-y-4">
                                    {groupReports.map((report, idx) => (
                                        <motion.div
                                            layout
                                            key={report._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.4, delay: idx * 0.05 }}
                                            className="bg-white dark:bg-[#0B1121] rounded-[1.5rem] p-2 pb-3.5 sm:p-3 sm:pb-4 flex flex-col sm:flex-row gap-4 transition-all border-2 border-slate-100 dark:border-white/5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]"
                                            style={{
                                                ...cardBaseStyle,
                                                ...(hoveredCard === report._id ? cardHoverStyle : {})
                                            }}
                                            onMouseEnter={() => { setHoveredCard(report._id); prefetchReport(report._id); }}
                                            onMouseLeave={() => setHoveredCard(null)}
                                        >
                                            {/* Left side Image */}
                                            <div className="relative shrink-0">
                                                <div 
                                                    className="w-full sm:w-[160px] h-[190px] sm:h-[160px] bg-[#f8fafc] rounded-2xl overflow-hidden shadow-inner border border-slate-50 group grow-0 shrink-0 cursor-zoom-in relative"
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        setIsZoomed(true);
                                                        setIsZoomedFromThumbnail(true);
                                                        await handleViewReport(report);
                                                    }}
                                                >
                                                    {(() => {
                                                        const photos = (report.photos && report.photos.length > 0) 
                                                            ? [...new Set(report.photos)].filter(Boolean)
                                                            : [];
                                                        
                                                        // Show only the first image as requested by user
                                                        const mainPhoto = photos[photos.length - 1]; // Use last uploaded as "main" or photos[0]
                                                        // Actually, common pattern is photos[0] is original, others are evidence. 
                                                        // User said "first image upload kelti tech disli pahije" (the first image uploaded should be seen)
                                                        const displayPhoto = photos[0];

                                                        if (displayPhoto) {
                                                            return (
                                                                <div className="relative w-full h-full group/thumb">
                                                                    <img 
                                                                        src={displayPhoto} 
                                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover/thumb:scale-110" 
                                                                        alt="Report Thumbnail" 
                                                                    />
                                                                    {(report.initialPhotoCount > 1 || (!report.initialPhotoCount && photos.length > 1)) && (
                                                                        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1.5 pointer-events-none">
                                                                            <ImageIcon size={10} className="text-white" />
                                                                            <span className="text-white text-[10px] font-black">
                                                                                {(report.initialPhotoCount !== undefined) ? Number(report.initialPhotoCount) : 1}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                    <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover/thumb:opacity-100">
                                                                        <Maximize size={20} className="text-white drop-shadow-lg" />
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
                                                        return (
                                                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                                                <FileTextIcon size={24} className="opacity-40" />
                                                                <span className="text-[10px] font-black mt-2 uppercase tracking-tighter opacity-40">No Image</span>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            </div>

                                            {/* Right side content */}
                                            <div className="flex-1 min-w-0 flex flex-col">
                                                {/* LAPTOP HEADER ROW */}
                                                <div className="hidden sm:flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                                                        <h3 className="text-[1rem] font-black text-[#1a202c] capitalize tracking-tight leading-tight">
                                                            {report.area || report.location}
                                                        </h3>
                                                        <div className="h-4 w-[1.5px] bg-slate-200 hidden sm:block" />
                                                        <div className="inline-flex items-center justify-center h-[22px] px-2.5 rounded-lg bg-emerald-50 border border-emerald-500/10 shadow-sm">
                                                            <span className="text-[10.5px] font-bold text-emerald-700 capitalize leading-none">
                                                                {report.garbageType} Waste
                                                            </span>
                                                        </div>
                                                        <div className="inline-flex items-center justify-center gap-1 h-[22px] px-2.5 rounded-lg bg-amber-50 border border-amber-100/50 text-amber-800 font-bold shrink-0 shadow-sm">
                                                            <span className="text-[8px] leading-none">🟡</span>
                                                            <span className="text-[10.5px] leading-none">{report.urgency} Urgency</span>
                                                        </div>
                                                    </div>
                                                    <div className={`inline-flex items-center justify-center h-[22px] px-2.5 rounded-full shadow-sm border text-[10.5px] font-bold capitalize leading-none shrink-0 ${report.status === 'Resolved'
                                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200/50'
                                                        : 'bg-amber-50 text-amber-800 border-amber-200/50'
                                                        }`}>
                                                        {report.status}
                                                    </div>
                                                </div>

                                                {/* MOBILE HEADER ROW */}
                                                <div className="flex sm:hidden flex-col gap-2.5 mb-2.5">
                                                    <h3 className="text-[0.95rem] font-black text-[#1a202c] capitalize tracking-tight leading-tight">
                                                        {report.area || report.location}
                                                    </h3>
                                                    <div className="flex items-center justify-between w-full gap-1 flex-nowrap overflow-hidden">
                                                        <div className="flex items-center gap-1 shrink-0 flex-nowrap">
                                                            <div className="inline-flex items-center justify-center h-[22px] px-1.5 rounded-lg bg-emerald-50 border border-emerald-100 shrink-0">
                                                                <span className="text-[9.5px] font-black capitalize text-emerald-700 leading-none whitespace-nowrap">
                                                                    {report.garbageType} Waste
                                                                </span>
                                                            </div>
                                                            <div className="inline-flex items-center justify-center gap-1 h-[22px] px-1.5 rounded-lg bg-amber-50 border border-amber-100 text-amber-800 shrink-0">
                                                                <span className="text-[7.5px] leading-none">🟡</span>
                                                                <span className="text-[9.5px] font-black capitalize leading-none whitespace-nowrap">
                                                                    {report.urgency} Urgency
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className={`inline-flex items-center justify-center h-[22px] px-2 rounded-full border text-[9.5px] font-black capitalize leading-none shrink-0 ${report.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                                            }`}>
                                                            {report.status}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* METADATA ROWS - LAPTOP */}
                                                <div className="hidden sm:flex flex-col gap-1.5 mb-2.5">
                                                    <div className="flex items-center gap-3 text-[11px] font-black text-[#1e293b]">
                                                        <div className="flex items-center gap-1.5 opacity-80 shrink-0">
                                                            <Clock size={11} strokeWidth={3} />
                                                            {new Date(report.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                                                        </div>
                                                        <div className="w-[1.5px] h-3 bg-slate-200 shrink-0" />
                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                            <MapPin size={11} strokeWidth={3} className="text-[#10b981] shrink-0" />
                                                            <span className="capitalize shrink-0">{report.zone} Zone</span>
                                                            {report.landmark && (
                                                                <div className="flex items-start gap-1.5 ml-3 min-w-0 w-full xl:w-auto">
                                                                    <MapPin size={11} strokeWidth={3} className="text-[#10b981] mt-[2px] shrink-0" />
                                                                    <span className="opacity-80 whitespace-normal break-words leading-tight">Near {report.landmark}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-[11px] font-black text-[#1e293b] w-full">
                                                        <a 
                                                            href={`https://www.google.com/maps/search/?api=1&query=${report.location}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1.5 opacity-80 min-w-0 hover:opacity-100 hover:text-blue-600 transition-colors group cursor-pointer"
                                                            title="Open in Google Maps"
                                                        >
                                                            <Map size={11} strokeWidth={3} className="text-blue-500 shrink-0 group-hover:scale-110 transition-transform" />
                                                            <span className="break-all sm:break-words underline decoration-blue-500/30 group-hover:decoration-blue-500 transition-colors">{report.location}</span>
                                                        </a>
                                                        <div className="w-[1.5px] h-3 bg-slate-200 shrink-0" />
                                                        <div className="flex items-center gap-1.5 opacity-80 shrink-0">
                                                            <MapPin size={11} strokeWidth={3} className="text-indigo-500 shrink-0" />
                                                            <span>{report.city || 'Pune'}</span>
                                                        </div>
                                                        {report.contactNumber && (
                                                            <>
                                                                <div className="w-[1.5px] h-3 bg-slate-200 shrink-0" />
                                                                <a 
                                                                    href={`tel:${report.contactNumber}`}
                                                                    className="flex items-center gap-1.5 opacity-80 shrink-0 hover:opacity-100 hover:text-emerald-600 transition-colors group cursor-pointer"
                                                                    title="Call Contact"
                                                                >
                                                                    <Phone size={11} strokeWidth={3} className="text-emerald-500 shrink-0 group-hover:scale-110 transition-transform" />
                                                                    <span className="underline decoration-emerald-500/30 group-hover:decoration-emerald-500 transition-colors">{report.contactNumber}</span>
                                                                </a>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* METADATA ROWS - MOBILE */}
                                                <div className="flex sm:hidden flex-col gap-1.5 mb-2.5">
                                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-black text-[#1e293b]">
                                                        <div className="flex items-center gap-1 opacity-80 shrink-0">
                                                            <Clock size={11} strokeWidth={3} />
                                                            {new Date(report.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                                                        </div>
                                                        <div className="w-[1.5px] h-3 bg-slate-200 shrink-0" />
                                                        <div className="flex items-center gap-1 opacity-80 shrink-0">
                                                            <MapPin size={10} strokeWidth={3} className="text-[#10b981]" />
                                                            <span className="capitalize">{report.zone} Zone</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                                                        {report.landmark && (
                                                            <div className="flex items-start gap-1 text-[11px] font-black text-[#1e293b] opacity-80 min-w-0 w-full sm:w-auto pb-0.5">
                                                                <MapPin size={10} strokeWidth={3} className="text-[#10b981] mt-[2px] shrink-0" />
                                                                <span className="whitespace-normal break-words leading-tight">Near {report.landmark}</span>
                                                            </div>
                                                        )}
                                                        <a 
                                                            href={`https://www.google.com/maps/search/?api=1&query=${report.location}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1 text-[11px] font-black text-[#1e293b] opacity-80 min-w-0 hover:opacity-100 hover:text-blue-600 transition-colors group cursor-pointer"
                                                            title="Open in Google Maps"
                                                        >
                                                            <Map size={10} strokeWidth={3} className="text-blue-500 shrink-0 group-hover:scale-110 transition-transform" />
                                                            <span className="break-all underline decoration-blue-500/30 group-hover:decoration-blue-500 transition-colors">{report.location}</span>
                                                        </a>
                                                        <div className="flex items-center gap-1 text-[11px] font-black text-[#1e293b] opacity-80 shrink-0">
                                                            <MapPin size={10} strokeWidth={3} className="text-indigo-500" />
                                                            <span>{report.city || 'Pune'}</span>
                                                        </div>
                                                        {report.contactNumber && (
                                                            <a 
                                                                href={`tel:${report.contactNumber}`}
                                                                className="flex items-center gap-1 text-[11px] font-black text-[#1e293b] opacity-80 shrink-0 hover:opacity-100 hover:text-emerald-600 transition-colors group cursor-pointer"
                                                                title="Call Contact"
                                                            >
                                                                <Phone size={10} strokeWidth={3} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                                                                <span className="underline decoration-emerald-500/30 group-hover:decoration-emerald-500 transition-colors">{report.contactNumber}</span>
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="relative mb-1 transition-all">
                                                    <div className="relative">
                                                        <p className={`text-[12.5px] leading-relaxed text-slate-600 dark:text-slate-300 font-medium ${expandedReports.has(report._id) ? 'whitespace-pre-line' : 'line-clamp-2 pr-16'}`}>
                                                            {report.description}
                                                        </p>
                                                        {!expandedReports.has(report._id) && report.description?.length > 50 && (
                                                            <button
                                                                onClick={() => toggleExpandReport(report._id)}
                                                                className="absolute bottom-0 right-0 px-2 py-0.5 text-[11.5px] font-black text-[#10b981] hover:text-[#059669] transition-all bg-white/80 dark:bg-black/40 rounded-lg shadow-sm border border-slate-100/50"
                                                            >
                                                                Read more
                                                            </button>
                                                        )}
                                                        {expandedReports.has(report._id) && (
                                                            <button
                                                                onClick={() => toggleExpandReport(report._id)}
                                                                className="text-[11.5px] font-black text-[#10b981] hover:text-[#059669] mt-2 flex items-center justify-end w-full hover:underline transition-all"
                                                            >
                                                                Show less
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-end gap-3 mt-1 pt-2 border-t border-slate-100">
                                                    {report.status === 'Pending' && (
                                                        <div className="flex items-center gap-2 pr-2 border-r border-slate-100">
                                                            <button
                                                                onClick={() => navigate(`/citizen/edit-report/${report._id}`)}
                                                                className="p-2 text-slate-600 hover:text-[#10b981] hover:bg-slate-50 rounded-xl transition-all"
                                                                title="Edit Report"
                                                            >
                                                                <Edit size={16} strokeWidth={2.5} />
                                                            </button>
                                                            <button
                                                                onClick={() => setDeletingReportId(report._id)}
                                                                className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                                title="Delete Report"
                                                            >
                                                                <Trash2 size={16} strokeWidth={2.5} />
                                                            </button>
                                                        </div>
                                                    )}
                                                    {report.status === 'Resolved' && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleViewEvidence(report);
                                                            }}
                                                            className="flex items-center justify-center gap-1 px-2.5 py-1 sm:px-4 sm:py-1.5 text-indigo-600 bg-indigo-50 hover:bg-white transition-all text-[11px] sm:text-[12.5px] font-black rounded-lg border border-indigo-200 active:scale-95 shadow-sm"
                                                        >
                                                            <Eye size={10} /> View Evidence
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleViewReport(report)}
                                                        className="px-2.5 py-1 sm:px-4 sm:py-1.5 bg-[#10b981] hover:bg-[#059669] text-white text-[11px] sm:text-[12.5px] font-black rounded-lg shadow-lg shadow-emerald-500/20 transition-all ml-1"
                                                    >
                                                        View Details
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 bg-slate-50/80 rounded-full flex items-center justify-center mb-5 border border-slate-100/50">
                            <FileTextIcon size={28} className="text-slate-300" />
                        </div>
                        <h3 className="text-[1.05rem] font-bold text-slate-600 tracking-tight">No records found</h3>
                        <p className="text-[0.8125rem] text-slate-400 mt-1 max-w-[250px] mx-auto leading-relaxed">
                            Try adjusting your search terms or filter settings to see more results
                        </p>
                    </div>
                )}
            </div>

            {/* ---------- VIEW REPORT MODAL ---------- */}
            <AnimatePresence>
                {viewingReport && !isZoomed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[150] flex items-center justify-center lg:pl-64 p-4 pt-20 sm:pt-4 bg-black/60 backdrop-blur-[2px]"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 30 }}
                            className="bg-white rounded-2xl w-full max-w-[420px] max-h-[80vh] sm:max-h-[85vh] overflow-hidden shadow-2xl relative border border-slate-100 flex flex-col"
                        >
                            <div className="p-2.5 pb-8 overflow-y-auto custom-scrollbar flex-1">
                                <div 
                                    className="relative group/modalimg w-full h-[190px] sm:h-[220px] rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0 mb-4 sm:mb-6 shadow-inner"
                                    onTouchStart={onTouchStart}
                                    onTouchMove={onTouchMove}
                                    onTouchEnd={onTouchEnd}
                                >
                                    {/* Close Button - Dark Circular Style */}
                                    <button
                                        onClick={() => {
                                            setViewingReport(null);
                                            setActiveImageIndex(0);
                                        }}
                                        className="absolute top-2 right-2 z-20 w-6 h-6 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all shadow-lg border border-white/10"
                                    >
                                        <X size={10} strokeWidth={3} />
                                    </button>
                                    {/* Respecting Citizen's original upload count and sequence */}
                                    {(() => {
                                        // 🛡️ Dynamic Mode-Based Filtering
                                        const allPhotos = (viewingReport.photos && viewingReport.photos.length > 0) 
                                            ? [...new Set(viewingReport.photos)].filter(Boolean)
                                            : (viewingReport.image ? [viewingReport.image] : []);
                                        
                                        const initialCount = viewingReport.initialPhotoCount !== undefined ? Number(viewingReport.initialPhotoCount) : 1;
                                        
                                        // MODE 1: Evidence View -> Show ONLY proof images (everything after initialCount)
                                        // MODE 2: Normal View -> Show ONLY citizen images (everything up to initialCount)
                                        const uniquePhotos = isEvidenceView 
                                            ? allPhotos.slice(initialCount)
                                            : allPhotos.slice(0, initialCount);

                                        const currentImg = uniquePhotos.length > 0 ? uniquePhotos[activeImageIndex] : viewingReport.image;

                                        return uniquePhotos.length > 0 || viewingReport.image ? (
                                            <>
                                                <img 
                                                    src={currentImg} 
                                                    alt={`Report Photo ${activeImageIndex + 1}`} 
                                                    className="w-full h-full object-cover transition-all duration-500 cursor-zoom-in hover:scale-105" 
                                                    onClick={() => {
                                                        setIsZoomed(true);
                                                        setIsZoomedFromThumbnail(false);
                                                    }}
                                                />
                                                
                                                {/* Navigation Arrows */}
                                                {uniquePhotos.length > 1 && (
                                                    <>
                                                        <button 
                                                            onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : uniquePhotos.length - 1))}
                                                            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/20 hover:bg-white group-hover/modalimg:translate-x-0 -translate-x-10 transition-all rounded-full text-slate-800 shadow-lg backdrop-blur-md z-10"
                                                        >
                                                            <ChevronLeft size={16} className="text-emerald-600" strokeWidth={3} />
                                                        </button>
                                                        <button 
                                                            onClick={() => setActiveImageIndex((prev) => (prev < uniquePhotos.length - 1 ? prev + 1 : 0))}
                                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/20 hover:bg-white group-hover/modalimg:translate-x-0 translate-x-10 transition-all rounded-full text-slate-800 shadow-lg backdrop-blur-md z-10"
                                                        >
                                                            <ChevronRight size={16} className="text-emerald-600" strokeWidth={3} />
                                                        </button>
                                                        
                                                        {/* Pagination Dots */}
                                                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                                                            {uniquePhotos.map((_, i) => (
                                                                <div 
                                                                    key={i} 
                                                                    className={`w-1.5 h-1.5 rounded-full transition-all ${activeImageIndex === i ? 'bg-emerald-500 w-3' : 'bg-white/60'}`}
                                                                />
                                                            ))}
                                                        </div>
                                                    </>
                                                )}
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                                <FileTextIcon size={40} className="opacity-20 mb-2" />
                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-30">No Photo Available</p>
                                            </div>
                                        );
                                    })()}
                                </div>

                                <div className="mb-8">
                                    <h2 className="text-[1.25rem] font-black text-[#1a202c] leading-[1.2] tracking-tighter mb-1.5">
                                        {viewingReport.area || viewingReport.location}
                                    </h2>
                                    <div className="flex items-center gap-2 text-[13px] font-bold text-slate-500">
                                        <Clock size={14} className="text-slate-400" />
                                        {new Date(viewingReport.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                                    </div>
                                </div>

                                <div className="space-y-4 mb-5">
                                    <div className="flex items-start gap-4">
                                        <p className="text-slate-900 dark:text-white font-black text-[13px] w-[95px] shrink-0">Garbage Type</p>
                                        <p className="text-slate-700 dark:text-slate-300 font-bold text-[11.5px] flex-1">{viewingReport.garbageType} Waste</p>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <p className="text-slate-900 font-black text-[13px] w-[95px] shrink-0">City zone</p>
                                        <p className="text-slate-700 font-bold text-[11.5px] flex-1 capitalize">{viewingReport.zone} Zone</p>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <p className="text-slate-900 font-black text-[13px] w-[95px] shrink-0">Status</p>
                                        <p className={`font-bold text-[11.5px] capitalize flex-1 ${viewingReport.status === 'Resolved' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                            {viewingReport.status}
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <p className="text-slate-900 font-black text-[13px] w-[95px] shrink-0">Coordinates</p>
                                        <div className="flex-1">
                                            <a 
                                                href={`https://www.google.com/maps/search/?api=1&query=${viewingReport.location}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-700 font-bold text-[11.5px] leading-tight underline decoration-blue-300 hover:decoration-blue-600 transition-colors"
                                                title="Open in Google Maps"
                                            >
                                                {viewingReport.location}
                                            </a>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <p className="text-slate-900 font-black text-[13px] w-[95px] shrink-0">Landmark</p>
                                        <p className="text-slate-700 font-bold text-[11.5px] flex-1">
                                            {viewingReport.landmark ? `near ${viewingReport.landmark}` : 'N/A'}
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <p className="text-slate-900 font-black text-[13px] w-[95px] shrink-0">City</p>
                                        <p className="text-slate-700 font-bold text-[11.5px] flex-1">{viewingReport.city || 'Pune'}</p>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <p className="text-slate-900 font-black text-[13px] w-[95px] shrink-0">Area</p>
                                        <p className="text-slate-700 font-bold text-[11.5px] flex-1">{viewingReport.area || 'N/A'}</p>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <p className="text-slate-900 font-black text-[13px] w-[95px] shrink-0">Urgency</p>
                                        <p className="text-slate-700 font-bold text-[11.5px] flex-1">
                                            {viewingReport.urgency} Urgency
                                        </p>
                                    </div>
                                    {viewingReport.contactNumber && (
                                        <div className="flex items-start gap-4">
                                            <p className="text-slate-900 font-black text-[13px] w-[95px] shrink-0">Contact</p>
                                            <p className="text-slate-700 font-bold text-[11.5px] flex-1">{viewingReport.contactNumber}</p>
                                        </div>
                                    )}
                                    <div className="pt-4 border-t border-slate-100">
                                        <p className="text-slate-900 font-black text-[13.5px] mb-1.5">Description:</p>
                                        <p className="text-[13.5px] leading-relaxed text-slate-500 font-semibold whitespace-pre-line pt-2">
                                            {viewingReport.description}
                                        </p>
                                    </div>
                                </div>

                                {viewingReport.status === 'Resolved' && (
                                    <div className="mt-6 px-2.5 pb-2">
                                        <button
                                            onClick={() => {
                                                const photos = viewingReport.photos || [];
                                                let evidencePhotos = [];
                                                
                                                if (viewingReport.initialPhotoCount !== undefined) {
                                                    evidencePhotos = photos.slice(Number(viewingReport.initialPhotoCount));
                                                }
                                                
                                                if (evidencePhotos.length === 0 || !evidencePhotos[0]) {
                                                    evidencePhotos = photos.length > 0 ? [photos[photos.length - 1]] : [];
                                                }
                                                
                                                if (evidencePhotos.length === 0) {
                                                    toast.error("No images found.");
                                                    return;
                                                }

                                                setViewingReport({ ...viewingReport, photos: evidencePhotos });
                                                setIsZoomed(true);
                                                setIsZoomedFromThumbnail(false);
                                                setActiveImageIndex(0);
                                            }}
                                            className="w-full flex items-center justify-center gap-1.5 px-2.5 py-3 sm:px-4 sm:py-3.5 text-indigo-600 bg-indigo-50 hover:bg-white transition-all text-[11px] sm:text-[12.5px] font-black rounded-lg border border-indigo-200 active:scale-95 shadow-lg shadow-indigo-500/5 group"
                                        >
                                            <Eye size={18} className="group-hover:scale-110 transition-transform" />
                                            View Evidence
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
                      {/* ---------- IMAGE LIGHTBOX (ZOOM VIEW) ---------- */}
            <AnimatePresence>
                {isZoomed && viewingReport && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[250] flex items-center justify-center lg:pl-64 p-4 pt-20 sm:pt-4 bg-black/95 backdrop-blur-sm touch-none"
                        onClick={() => {
                            if (isZoomedFromThumbnail) setViewingReport(null);
                            setIsZoomed(false);
                        }}
                    >
                        {(() => {
                            // 🧱 CORE LOGIC (KEEPING THIS!)
                            const allPhotos = viewingReport.photos || [];
                            const initialCount = viewingReport.initialPhotoCount !== undefined ? Number(viewingReport.initialPhotoCount) : (allPhotos.length > 0 ? 1 : 0);
                            const citizenPhotos = allPhotos.slice(0, initialCount);
                            const evidencePhotos = allPhotos.slice(initialCount);
                            const displayPhotos = isEvidenceView ? evidencePhotos : citizenPhotos;
                            const currentImg = displayPhotos.length > 0 ? displayPhotos[activeImageIndex] : viewingReport.image;

                            return (
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.9, opacity: 0 }}
                                    className="relative flex flex-col items-center max-w-[95vw] sm:max-w-4xl"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="relative bg-white p-[1px] rounded-xl shadow-2xl overflow-hidden mb-4 sm:mb-6 group transition-all border-[1px] border-white/20">
                                        {/* Close Button - BACK TO ORIGINAL STYLE */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (isZoomedFromThumbnail) setViewingReport(null);
                                                setIsZoomed(false);
                                            }}
                                            className="absolute top-1.5 right-1.5 z-[270] p-1 bg-[#222]/80 hover:bg-black text-white rounded-full transition-all shadow-lg flex items-center justify-center"
                                        >
                                            <X size={10} strokeWidth={4} />
                                        </button>

                                        <div
                                            className="relative flex items-center justify-center bg-transparent"
                                            onTouchStart={onTouchStart}
                                            onTouchMove={onTouchMove}
                                            onTouchEnd={onTouchEnd}
                                        >
                                            <img
                                                src={currentImg}
                                                alt="Zoomed Evidence"
                                                className="max-w-full max-h-[70vh] object-contain rounded-lg selection:bg-transparent"
                                                draggable={false}
                                                loading="eager" // ⚡ INSTANT LOAD
                                            />

                                            {/* Navigation - BACK TO ORIGINAL STYLE */}
                                            {displayPhotos.length > 1 && (
                                                <>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : displayPhotos.length - 1));
                                                        }}
                                                        className="absolute left-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white shadow-xl backdrop-blur-sm border border-white/10 transition-all z-[260] hidden sm:block opacity-0 group-hover:opacity-100"
                                                    >
                                                        <ChevronLeft size={16} strokeWidth={3} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveImageIndex((prev) => (prev < displayPhotos.length - 1 ? prev + 1 : 0));
                                                        }}
                                                        className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white shadow-xl backdrop-blur-sm border border-white/10 transition-all z-[260] hidden sm:block opacity-0 group-hover:opacity-100"
                                                    >
                                                        <ChevronRight size={16} strokeWidth={3} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Footer Content - BACK TO ORIGINAL STYLE */}
                                    <div className="flex flex-col items-center gap-2 text-center text-white">
                                        <h4 className="text-[15px] sm:text-[18px] font-black tracking-tight drop-shadow-md">
                                            {isEvidenceView ? 'Evidence' : 'Report'} Photo {activeImageIndex + 1} of {displayPhotos.length}
                                        </h4>
                                        <div className="flex items-center gap-2 text-white/60 text-[11px] sm:text-[12px] font-bold opacity-80">
                                            <Maximize size={14} className="mb-0.5" />
                                            <span>Pinch / Scroll to Zoom & Drag</span>
                                        </div>

                                        {/* Pagination indicator */}
                                        {displayPhotos.length > 1 && (
                                            <div className="flex gap-2 mt-2">
                                                {displayPhotos.map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={`h-1.5 rounded-full transition-all duration-300 ${activeImageIndex === i ? 'bg-emerald-500 w-8' : 'bg-white/20 w-2'}`}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })()}
                    </motion.div>
                )}
            </AnimatePresence>    </AnimatePresence>

            {/* ---------- DELETE CONFIRMATION MODAL ---------- */}
            <AnimatePresence>
                {deletingReportId && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-[4px] p-6 lg:pl-[260px]"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl p-8 w-full max-w-[340px] shadow-2xl text-center border border-slate-100"
                        >
                            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-5 border border-red-100">
                                <Trash2 size={28} />
                            </div>

                            <h3 className="text-[1.125rem] font-black text-slate-800 mb-2 tracking-tight">Delete Report?</h3>
                            <p className="text-[13px] font-medium text-slate-500 mb-8 leading-relaxed">
                                This report will be permanently removed from your history.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeletingReportId(null)}
                                    className="flex-1 py-3.5 text-[14px] font-bold bg-[#f8fafc] text-slate-600 rounded-xl hover:bg-slate-100 transition-all border border-slate-100"
                                >
                                    No, keep it
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    className="flex-1 py-3.5 text-[14px] font-bold bg-[#10b981] text-white rounded-xl hover:bg-[#059669] shadow-lg shadow-emerald-500/20 transition-all"
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

export default MyReports;
