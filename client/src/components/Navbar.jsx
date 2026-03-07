import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Recycle, LogOut, User as UserIcon, FileText, Award, Sun, Moon, Menu, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const navLinks = [
        { name: 'Home', path: '/home', active: location.pathname === '/home' || location.pathname === '/' },
        { name: 'Leaderboard', path: '/leaderboard', active: location.pathname === '/leaderboard' },
        { name: 'About', path: '/about', active: location.pathname === '/about' }
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 w-full z-[100] border-b border-slate-200/50 dark:border-white/5 bg-white/80 dark:bg-[#0B1121]/80 backdrop-blur-xl transition-all duration-300">
            <div className="max-w-[1440px] mx-auto px-4 md:px-[30px] lg:px-[50px] h-16 sm:h-20 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2.5 group relative z-[110]" onClick={() => setIsMenuOpen(false)}>
                    <div className="bg-emerald-600 p-1.5 rounded-xl text-white shadow-lg shadow-emerald-500/20 group-hover:rotate-12 transition-transform">
                        <Recycle size={21} />
                    </div>
                    <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter transition-colors">EcoPulse</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className={`relative font-bold transition-all text-base ${link.active ? 'text-emerald-500' : 'text-slate-500 dark:text-slate-400 hover:text-emerald-500'}`}
                        >
                            {link.name}
                            {link.active && (
                                <span className="absolute -bottom-1.5 left-0 w-full h-[2px] bg-emerald-500 rounded-full"></span>
                            )}
                        </Link>
                    ))}

                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                    >
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>

                    {/* Auth Button (Login or Dashboard) */}
                    {!user ? (
                        <Link to="/login" className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-2xl font-black text-sm shadow-xl shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95 group">
                            <UserIcon size={18} className="group-hover:scale-110 transition-transform" />
                            <span>Login</span>
                        </Link>
                    ) : (
                        <Link 
                            to={`/${user.role === 'Swachhta Mitra' ? 'swachhta-mitra' : user.role}/dashboard`} 
                            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-2xl font-black text-sm shadow-xl shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95 group"
                        >
                            <UserIcon size={18} className="group-hover:scale-110 transition-transform" />
                            <span>Dashboard</span>
                        </Link>
                    )}
                </div>

                {/* Mobile Controls */}
                <div className="flex md:hidden items-center gap-2 sm:gap-4 relative z-[110]">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                    >
                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    </button>

                    {!user ? (
                        <Link to="/login" className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
                            Login
                        </Link>
                    ) : (
                        <Link 
                            to={`/${user.role === 'Swachhta Mitra' ? 'swachhta-mitra' : user.role}/dashboard`} 
                            className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                        >
                            Dashboard
                        </Link>
                    )}

                    <button
                        onClick={toggleMenu}
                        className="p-2 rounded-xl text-slate-900 dark:text-white transition-all outline-none"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 bg-white/95 dark:bg-[#0B1121]/95 backdrop-blur-xl z-[90] md:hidden py-3 px-6 border-b border-slate-200/50 dark:border-white/5 shadow-2xl flex flex-col items-center"
                    >
                        <div className="flex flex-col items-center space-y-1 w-full">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`relative w-full max-w-[280px] text-center p-2 font-bold text-sm transition-all flex flex-col items-center group ${link.active ? 'text-emerald-500' : 'text-slate-500 dark:text-slate-400 hover:text-emerald-500'}`}
                                >
                                    <span>{link.name}</span>
                                    {link.active && (
                                        <span className="mt-1 w-8 h-[2px] bg-emerald-500 rounded-full"></span>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
