import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
    Sparkles, LogIn, ArrowRight, BookOpen,
    CheckCircle2, Star, Target, Zap, Clock,
    BarChart3, FolderOpen, Flame, Rocket,
    Layers, Layout, LayoutDashboard, Calendar,
    FileText, TrendingUp, ShieldCheck, ZapOff,
    Check, User, Moon, Sun, ChevronRight, Menu, X, Recycle, MapPin, Truck, Leaf, Mail, Globe
} from 'lucide-react';

import { AboutLandingPage } from './AboutLandingPage';

// Simple Wrapper for Check icon to avoid name collision
const CheckLucide = ({ size, strokeWidth }) => <Check size={size} strokeWidth={strokeWidth} />;

// Fast Animated Counter Component
const AnimatedCounter = ({ target, duration = 1 }) => {
    const [count, setCount] = React.useState(0);
    const numericValue = parseInt(target.replace(/[^0-9]/g, ''), 10);
    const suffix = target.replace(/[0-9,]/g, '');
    const hasComma = target.includes(',');

    React.useEffect(() => {
        let startTime;
        let animationFrame;

        const updateCount = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
            // Use easeOutExo for a "fast then pop" feel
            const easeOutQuad = 1 - (1 - progress) * (1 - progress);
            const currentCount = Math.floor(easeOutQuad * numericValue);
            
            setCount(currentCount);

            if (progress < 1) {
                animationFrame = requestAnimationFrame(updateCount);
            }
        };

        animationFrame = requestAnimationFrame(updateCount);
        return () => cancelAnimationFrame(animationFrame);
    }, [numericValue, duration]);

    const formatNumber = (num) => {
        if (hasComma) return num.toLocaleString('en-IN') + suffix;
        return num + suffix;
    };

    return <>{formatNumber(count)}</>;
};

const Home = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();
    const { user } = useAuth();
    
    // 🔥 Reload -> Home Logic (Modern API)
    React.useEffect(() => {
        const navEntries = performance.getEntriesByType("navigation");
        const isReload = navEntries.length > 0 && navEntries[0].type === "reload";
        
        if (user && isReload) {
            navigate('/home');
        }
    }, [user, navigate]);

    // Determine active tab from current route
    const isAbout = location.pathname === '/about';
    const activeTab = isAbout ? 'About' : 'Home';

    const [activeFeature, setActiveFeature] = React.useState(null);
    const [activeStep, setActiveStep] = React.useState(null);
    const [activeStat, setActiveStat] = React.useState(null);
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const isDark = theme === 'dark';

    // Stats Data
    const stats = [
        { label: 'Total Reports', value: '1,200+', icon: <FileText /> },
        { label: 'Active Citizens', value: '850+', icon: <User /> },
        { label: 'Reports Resolved', value: '98%', icon: <CheckCircle2 /> },
        { label: 'Cities Covered', value: '1,000+', icon: <MapPin /> }
    ];

    // Feature Cards
    const features = [
        {
            icon: <MapPin className="text-emerald-500" />,
            title: "Live Reporting",
            desc: "Report garbage issues with photos and real-time location instantly."
        },
        {
            icon: <Truck className="text-emerald-500" />,
            title: "Smart Pickup",
            desc: "Swachhta Mitras get optimized routes and instant notifications for efficient collection."
        },
        {
            icon: <BarChart3 className="text-emerald-500" />,
            title: "Admin Portal",
            desc: "Manage the entire city's waste flow with advanced data analytics and heatmaps."
        },
        {
            icon: <Leaf className="text-emerald-500" />,
            title: "Eco Rewards",
            desc: "Earn badges and reward points for every report you help resolve in your area."
        },
        {
            icon: <Target className="text-emerald-500" />,
            title: "Community Goals",
            desc: "Set and track cleaning goals for your neighborhood to win special awards."
        },
        {
            icon: <Flame className="text-emerald-500" />,
            title: "Rewards & Badges",
            desc: "Earn exclusive badges and reward points for consistent cleanup contributions."
        },
        {
            icon: <Calendar className="text-emerald-500" />,
            title: "Historical Trends",
            desc: "Analyze waste patterns over time to predict and prevent future issues."
        },
        {
            icon: <ShieldCheck className="text-emerald-500" />,
            title: "Secure & Verified",
            desc: "Every report is verified by AI and community moderators for maximum accuracy."
        }
    ];

    // How It Works Steps
    const steps = [
        { title: 'Report Issue', desc: 'Take a photo of the waste, add a quick description, and our GPS handles the exact location.' },
        { title: 'Smart Assignment', desc: 'The system automatically notifies the nearest Swachhta Mitra and provides them with optimized routes.' },
        { title: 'Clean & Reward', desc: 'Once resolved, the citizen gets a notification and earns Eco-Points for contributing to a cleaner city.' }
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-[#0B1121] text-slate-900 dark:text-slate-100 overflow-x-hidden selection:bg-emerald-500/30 relative font-sans transition-colors duration-500">
            {/* Background Animations */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-teal-500/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.01]" style={{ backgroundImage: 'radial-gradient(#10b981 0.5px, transparent 0.5px)', backgroundSize: '30px 30px' }}></div>
            </div>

            <div className="relative z-10">
                {activeTab === 'Home' ? (
                    <>
                        {/* HERO SECTION */}
                        <section className="pt-24 sm:pt-28 pb-4 sm:pb-8 px-[12px] md:px-[30px] lg:px-[50px] max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                            >
                                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[11px] sm:text-xs font-bold mb-8 shadow-sm">
                                    <Sparkles size={14} />
                                    Making cities smarter & cleaner, one report at a time
                                </div>
                                <h1 className="text-[14px] sm:text-4xl lg:text-5xl xl:text-6xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight mb-1 max-w-4xl">
                                    EcoPulse Smart <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 text-[0.85em]">Waste Management</span>
                                </h1>
                                <p className="text-[8px] sm:text-base lg:text-xl text-slate-500 dark:text-slate-400 font-medium mb-2 max-w-2xl leading-relaxed">
                                    A centralized platform connecting citizens, Swachhta Mitras, and admins to build a sustainable and waste-free future through data-driven action.
                                </p>

                                <div className="space-y-4 mb-10">
                                    {[
                                        'Live GPS-tagged reporting with photos',
                                        'Optimized collection for waste workers',
                                        'Award-winning analytics for admins',
                                        'Built-in reward system for active citizens'
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                                            <div className="w-4 h-4 rounded-full bg-emerald-500 p-0.5 flex items-center justify-center text-white scale-110">
                                                <Check size={10} strokeWidth={4} />
                                            </div>
                                            <span className="text-[8px] sm:text-sm lg:text-base font-semibold">{item}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-row items-center gap-3 sm:gap-6">
                                    <button
                                        onClick={() => navigate('/signup')}
                                        className="flex-1 sm:flex-none px-6 sm:px-10 py-3.5 sm:py-4 bg-emerald-600 text-white rounded-xl font-black text-xs sm:text-base shadow-2xl shadow-emerald-200 dark:shadow-emerald-900/20 hover:bg-emerald-700 hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
                                    >
                                        Get Started
                                        <ArrowRight size={18} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            navigate('/about');
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="flex-1 sm:flex-none px-6 sm:px-10 py-3.5 sm:py-4 bg-transparent border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 rounded-xl font-black text-xs sm:text-base hover:bg-emerald-500/5 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
                                    >
                                        Learn More
                                    </button>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                                className="relative hidden md:block"
                            >
                                <div className="max-w-xl ml-auto relative">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        whileHover={{ scale: 1.02 }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                        className="relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 shadow-3xl overflow-hidden p-6 cursor-default transition-all duration-500"
                                    >
                                        <motion.div
                                            initial={{ x: 20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: 1 }}
                                            className="absolute top-6 right-6 bg-white dark:bg-slate-800 rounded-2xl px-4 py-2 shadow-xl border border-slate-100 dark:border-white/5 flex items-center gap-3 z-20"
                                        >
                                            <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                                                <Leaf size={12} className="text-white fill-white" />
                                            </div>
                                            <span className="text-[10px] sm:text-xs font-black text-emerald-600">Top Citizen 🌿</span>
                                        </motion.div>

                                        <div className="space-y-6">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">City Health Index</p>
                                                <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter flex items-baseline gap-2">
                                                    95<span className="text-xl text-slate-400 font-bold ml-1">%</span>
                                                </h2>
                                                <p className="text-xs font-bold text-slate-500 mt-2">Cleanliness score increased by 5% this month</p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                                                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1.5">Efficiency</p>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center text-[11px] text-white font-black">88</div>
                                                        <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Collection Optimized</span>
                                                    </div>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                                                    <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1.5">New Reports</p>
                                                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">12 Urgent in Pune</span>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Recent Pickup Activity</p>
                                                {[
                                                    { name: 'Station Road Waste', time: '12m ago', role: 'Resolved', color: '#10b981' },
                                                    { name: 'Market Area Cleaning', time: 'Ongoing', role: 'In Progress', color: '#3b82f6' }
                                                ].map((item, i) => (
                                                    <div
                                                        key={i}
                                                        className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                                                                <Truck size={14} />
                                                            </div>
                                                            <div>
                                                                <p className="text-[11px] font-black text-slate-800 dark:text-slate-100">{item.name}</p>
                                                                <p className="text-[9px] text-slate-400 font-bold mt-0.5">{item.time}</p>
                                                            </div>
                                                        </div>
                                                        <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: item.color }}>{item.role}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="pt-2">
                                                <div className="flex items-center justify-between mb-3">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly Cleanup Growth</p>
                                                    <div className="text-[11px] font-black text-emerald-600 flex items-center gap-1">
                                                        +15% <TrendingUp size={12} />
                                                    </div>
                                                </div>
                                                <div className="flex items-end justify-between gap-2 h-20 px-1">
                                                    {[40, 55, 38, 70, 85, 95, 100].map((h, i) => (
                                                        <motion.div
                                                            key={i}
                                                            initial={{ height: 0 }}
                                                            animate={{ height: `${h}%` }}
                                                            transition={{ duration: 1.5, delay: 1 + (i * 0.1), ease: "circOut" }}
                                                            className="flex-1 rounded-t-lg bg-emerald-500 shadow-lg shadow-emerald-500/20"
                                                            style={{ opacity: 0.3 + (i * 0.1) }}
                                                        ></motion.div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>

                                    <div className="absolute -z-10 -top-16 -right-16 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full animate-pulse"></div>
                                    <div className="absolute -z-10 -bottom-16 -left-16 w-72 h-72 bg-teal-500/10 blur-[80px] rounded-full"></div>
                                </div>
                            </motion.div>
                        </section>

                        {/* STATS SECTION */}
                        <section className="py-8 sm:py-12 px-[12px] md:px-[30px] lg:px-[50px] max-w-[1440px] mx-auto">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                                {[
                                    { label: 'Total Reports', value: '1,200+', icon: <FileText size={22} />, color: 'bg-emerald-500/10 text-emerald-600' },
                                    { label: 'Active Citizens', value: '850+', icon: <User size={22} />, color: 'bg-blue-500/10 text-blue-600' },
                                    { label: 'Reports Resolved', value: '98%', icon: <CheckCircle2 size={22} />, color: 'bg-teal-500/10 text-teal-600' },
                                    { label: 'Cities Covered', value: '1,000+', icon: <MapPin size={22} />, color: 'bg-purple-500/10 text-purple-600' }
                                ].map((stat, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        whileTap={{ scale: 0.97 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1, duration: 0.8 }}
                                        className="p-5 sm:p-6 bg-white dark:bg-[#060B18] rounded-2xl border-2 border-slate-100 dark:border-white/[0.05] shadow-xl dark:shadow-none hover:border-emerald-500/30 hover:scale-105 transition-all duration-500 cursor-default text-left relative overflow-hidden flex flex-col justify-center"
                                    >
                                        <div className="flex items-center gap-4 mb-2">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${stat.color} group-hover:scale-110 transition-transform duration-500`}>
                                                {React.cloneElement(stat.icon, { size: 16 })}
                                            </div>
                                            <h4 className="text-lg sm:text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                                                <AnimatedCounter target={stat.value} duration={2} />
                                            </h4>
                                        </div>
                                        <p className="text-[8px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 pl-14">
                                            {stat.label}
                                        </p>
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 dark:bg-white/[0.02] rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/5 transition-colors duration-700"></div>
                                    </motion.div>
                                ))}
                            </div>
                        </section>

                        {/* WHY CHOOSE ECOPULSE */}
                        <section className="py-6 sm:py-8 px-[12px] md:px-[30px] lg:px-[50px] max-w-[1440px] mx-auto text-center">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="mb-10 sm:mb-12"
                            >
                                <h2 className="text-[10px] sm:text-4xl font-black text-slate-900 dark:text-white mb-1 sm:mb-4 tracking-tight">Why Choose EcoPulse?</h2>
                                <p className="text-[8px] sm:text-lg text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
                                    A decentralized platform connecting citizens, Swachhta Mitras, and admins to build a sustainable city with modern technology.
                                </p>
                            </motion.div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                                {features.map((feature, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        whileTap={{ scale: 0.97, borderColor: "#10b981" }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.05, duration: 0.8 }}
                                        className="p-3.5 sm:p-6 bg-white dark:bg-[#060B18] rounded-2xl border-2 border-slate-100 dark:border-white/[0.05] shadow-sm dark:shadow-none text-left hover:border-emerald-500/50 hover:scale-105 transition-all duration-500 cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-2.5 sm:gap-4 mb-2.5 sm:mb-5">
                                            <div className="w-7 h-7 sm:w-14 sm:h-14 bg-emerald-500/10 rounded-lg sm:rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 shrink-0">
                                                {React.cloneElement(feature.icon, { className: "w-3.5 h-3.5 sm:w-6 sm:h-6", strokeWidth: 2.5 })}
                                            </div>
                                            <h3 className="text-[9px] sm:text-xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">{feature.title}</h3>
                                        </div>
                                        <p className="text-[8px] sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{feature.desc}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </section>

                        {/* HOW IT WORKS */}
                        <section className="py-10 sm:py-12 border-t border-slate-100 dark:border-white/5">
                            <div className="max-w-[1440px] mx-auto px-[12px] md:px-[30px] lg:px-[50px] text-center">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="mb-10 sm:mb-12"
                                >
                                    <h2 className="text-[10px] sm:text-4xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">Simple 3-Step Action</h2>
                                    <p className="text-[8px] sm:text-lg text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
                                        How we transform city cleanliness through collaborative effort and intelligent routing.
                                    </p>
                                </motion.div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative mt-10 sm:mt-12">
                                    {steps.map((step, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 30 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            whileTap={{ scale: 0.97, borderColor: "#10b981" }}
                                            viewport={{ once: true }}
                                            transition={{ delay: i * 0.15, duration: 0.8 }}
                                            className="p-6 bg-white dark:bg-[#060B18] rounded-2xl border-2 border-slate-100 dark:border-white/[0.05] shadow-sm dark:shadow-none hover:border-emerald-500/50 hover:scale-105 transition-all duration-500 cursor-pointer group relative overflow-hidden text-left"
                                        >
                                            <div className="flex items-center gap-2.5 sm:gap-4 mb-3 sm:mb-5">
                                                <div className="w-5 h-5 sm:w-10 sm:h-10 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-600 text-[9px] sm:text-lg font-black relative z-10 shadow-sm transition-all duration-700 border border-emerald-500/20 overflow-hidden shrink-0">
                                                    {i + 1}
                                                </div>
                                                <h3 className="text-[9px] sm:text-xl font-black text-slate-900 dark:text-white relative z-10 tracking-tight transition-colors group-hover:text-emerald-600">
                                                    {step.title}
                                                </h3>
                                            </div>
                                            <p className="text-[8px] sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed relative z-10">
                                                {step.desc}
                                            </p>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* CTA SECTION */}
                        <section className="py-6 sm:py-8 px-[12px] md:px-[30px] lg:px-[50px]">
                            <div className="max-w-[1440px] mx-auto">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    className="bg-emerald-600 rounded-3xl p-8 sm:p-14 text-center text-white relative overflow-hidden shadow-2xl shadow-emerald-600/30 group"
                                >
                                    <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000"></div>
                                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/20 rounded-full blur-[70px] translate-y-1/2 -translate-x-1/2"></div>
                                    <div className="relative z-10">
                                        <h2 className="text-xl sm:text-5xl font-black mb-3 leading-tight tracking-tight">Ready to make <br />a difference?</h2>
                                        <p className="text-xs sm:text-lg text-emerald-50 mb-6 max-w-2xl mx-auto font-medium opacity-90 leading-relaxed">
                                            Sign up today and start reporting waste issues in your area. Together we can build a cleaner, greener city with EcoPulse.
                                        </p>
                                        <button
                                            onClick={() => navigate('/signup')}
                                            className="px-8 py-3 bg-white text-emerald-700 font-bold rounded-xl text-sm sm:text-lg shadow-xl hover:bg-emerald-50 transition-all hover:scale-105 active:scale-95 shadow-white/10"
                                        >
                                            Join EcoPulse Now
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        </section>

                        {/* FOOTER */}
                        <footer className="pt-10 pb-6 border-t border-slate-200 dark:border-white/5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 transition-all duration-700 relative z-10 overflow-hidden">
                            <div className="max-w-[1440px] mx-auto px-[12px] md:px-[30px] lg:px-[50px]">
                                {/* Centered Brand Area */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="flex flex-col items-center text-center mb-8"
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-md shadow-emerald-500/20 group cursor-pointer hover:rotate-12 transition-transform">
                                            <Recycle className="text-white w-5 h-5" strokeWidth={2.5} />
                                        </div>
                                        <h2 className="text-xl font-black transition-colors">EcoPulse</h2>
                                    </div>
                                    <p className="max-w-xl text-[10px] sm:text-base text-slate-400 dark:text-slate-500 font-medium leading-relaxed">
                                        A powerful waste management workspace to track city cleanliness, stay focused on sustainability, and build consistent green habits with clarity and control.
                                    </p>
                                </motion.div>

                                <div className="h-[1px] w-full bg-slate-100/10 dark:bg-slate-900/10 mb-8"></div>

                                {/* 4-Column Grid */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 md:gap-16 mb-10 text-left">
                                    {/* User Module */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <h4 className="text-[10px] md:text-sm lg:text-base font-black mb-4 uppercase tracking-wider">User Module</h4>
                                        <ul className="space-y-2">
                                            {['Dashboard', 'My Reports', 'Eco Rewards', 'Community Goals', 'Profile'].map((item, i) => (
                                                <li key={item}>
                                                    <button
                                                        className="text-[8px] sm:text-base text-slate-400 dark:text-slate-600 hover:text-emerald-500 dark:hover:text-emerald-600 font-bold transition-all flex items-center gap-2 group hover:translate-x-1"
                                                        onClick={() => navigate(item === 'Dashboard' ? '/citizen/dashboard' : '/')}
                                                    >
                                                        <ChevronRight size={10} className="text-emerald-500 opacity-50 group-hover:opacity-100 transition-all" />
                                                        {item}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </motion.div>

                                    {/* Admin Module */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <h4 className="text-[10px] md:text-sm lg:text-base font-black mb-4 uppercase tracking-wider">Admin Module</h4>
                                        <ul className="space-y-2">
                                            {['Dashboard', 'User Management', 'Zone Controls', 'Heatmaps', 'Analytics'].map((item, i) => (
                                                <li key={item}>
                                                    <button
                                                        className="text-[8px] sm:text-base text-slate-400 dark:text-slate-600 hover:text-emerald-500 dark:hover:text-emerald-600 font-bold transition-all flex items-center gap-2 group hover:translate-x-1"
                                                    >
                                                        <ChevronRight size={10} className="text-emerald-500 opacity-50 group-hover:opacity-100 transition-all" />
                                                        {item}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </motion.div>

                                    {/* Quick Links */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <h4 className="text-[10px] md:text-sm lg:text-base font-black mb-4 uppercase tracking-wider">Quick Links</h4>
                                        <ul className="space-y-2">
                                            {['Home', 'About', 'Login', 'Signup'].map((link) => (
                                                <li key={link}>
                                                    <button
                                                        onClick={() => {
                                                            if (link === 'Home') {
                                                                navigate('/home');
                                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                                            }
                                                            else if (link === 'About') {
                                                                navigate('/about');
                                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                                            }
                                                            else navigate(`/${link.toLowerCase()}`);
                                                        }}
                                                        className="text-[8px] sm:text-base text-slate-400 dark:text-slate-600 hover:text-emerald-500 dark:hover:text-emerald-600 font-bold transition-all flex items-center gap-2 group hover:translate-x-1"
                                                    >
                                                        <ChevronRight size={10} className="text-emerald-500 opacity-50 group-hover:opacity-100 transition-all" />
                                                        {link}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </motion.div>

                                    {/* Contact Info */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.4 }}
                                        className="space-y-6"
                                    >
                                        <h4 className="text-[10px] md:text-sm lg:text-base font-black mb-4 uppercase tracking-wider">Contact Us</h4>
                                        <ul className="space-y-3">
                                            <li className="flex items-center gap-4 group cursor-pointer">
                                                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                                    <Globe size={14} />
                                                </div>
                                                <span className="text-[8px] sm:text-base text-slate-400 dark:text-slate-600 font-bold">www.ecopulse.com</span>
                                            </li>
                                            <li className="flex items-center gap-4 group cursor-pointer">
                                                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                                    <Zap size={14} />
                                                </div>
                                                <span className="text-[8px] sm:text-base text-slate-400 dark:text-slate-600 font-bold">Support Center</span>
                                            </li>
                                        </ul>
                                    </motion.div>
                                </div>

                                <div className="h-[1px] w-full bg-slate-100/10 dark:bg-slate-900/10 mb-8"></div>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    className="text-center"
                                >
                                    <p className="text-slate-500 dark:text-slate-400 font-bold text-[9px] sm:text-sm tracking-wide">
                                        © 2026 EcoPulse System. All rights reserved.
                                    </p>
                                </motion.div>
                            </div>
                        </footer>
                    </>
                ) : (
                    <AboutLandingPage onBackToHome={() => navigate('/home')} />
                )}
            </div>
        </div>
    );
};

export default Home;
