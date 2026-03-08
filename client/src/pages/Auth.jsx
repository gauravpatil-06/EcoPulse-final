import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Eye, EyeOff, Recycle, User, Mail, Lock,
    Phone, MapPin, ShieldCheck, ArrowLeft, ArrowRight,
    LogIn, UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import ResetPasswordModal from '../components/ResetPasswordModal';
import GoogleAuthButton from '../components/GoogleAuthButton';

export const Auth = () => {
    const location = useLocation();
    // Check if we should start in signup mode based on path
    const isSignupInitial = location.pathname === '/signup';

    const [isLogin, setIsLogin] = useState(!isSignupInitial);
    const [isAdminLogin, setIsAdminLogin] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const { login, signup } = useAuth();
    const navigate = useNavigate();

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        city: '',
        zone: '',
        role: 'citizen'
    });
    const [isDetectingAddress, setIsDetectingAddress] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Update isLogin when location changes (e.g. clicking Nav links)
    useEffect(() => {
        setIsLogin(location.pathname !== '/signup');
    }, [location.pathname]);

    useEffect(() => {
        // Clear sensitive form data and error when switching login modes
        setFormData(prev => ({ ...prev, email: '', password: '' }));
        setError('');
    }, [isAdminLogin, isLogin]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isLogin) {
                const data = await login(formData.email, formData.password);
                const role = data.user.role;

                if (isAdminLogin && role !== 'admin') {
                    throw new Error('Not authorized as an admin');
                }

                // 🔥 Direct Dashboard Redirection
                const roleMap = {
                    "Swachhta Mitra": "swachhta-mitra/dashboard",
                    "citizen": "citizen/dashboard",
                    "admin": "admin/selection"
                };
                const rolePath = roleMap[role] || 'citizen/dashboard';
                navigate(`/${rolePath}`, { replace: true });
            } else {
                if (formData.password.length < 8) {
                    setError('Password must be at least 8 characters long');
                    setIsLoading(false);
                    return;
                }
                if (formData.phone.length !== 10) {
                    setError('Phone number must be exactly 10 digits');
                    setIsLoading(false);
                    return;
                }
                const data = await signup(formData);
                const role = data.user.role;

                // 🔥 Direct Dashboard Redirection
                const roleMap = {
                    "Swachhta Mitra": "swachhta-mitra/dashboard",
                    "citizen": "citizen/dashboard",
                    "admin": "admin/selection"
                };
                const rolePath = roleMap[role] || 'citizen/dashboard';
                navigate(`/${rolePath}`, { replace: true });
            }
        } catch (err) {
            setError(err.message || (isLogin ? 'Login failed' : 'Registration failed'));
        } finally {
            setIsLoading(false);
        }
    };

    const geolocate = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        setIsDetectingAddress(true);
        setError('');

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

                    if (!GOOGLE_KEY) {
                        const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
                        const addr = res.data.address;

                        const cityVal = addr.county || addr.city_district || addr.state_district || 'Pune';
                        const display_name = res.data.display_name || '';

                        // Deep Zone Scan
                        let zoneVal = '';
                        const fullAddr = (display_name || '').toLowerCase();
                        if (fullAddr.match(/akurdi|pimpri/)) zoneVal = 'East';
                        else if (fullAddr.match(/wakad|hinjewadi/)) zoneVal = 'West';
                        else if (fullAddr.match(/nigdi|bhosari/)) zoneVal = 'North';
                        else if (fullAddr.match(/hadapsar/)) zoneVal = 'South';

                        setFormData(prev => ({
                            ...prev,
                            city: cityVal,
                            zone: zoneVal || prev.zone
                        }));
                        return;
                    }

                    // Use Google Maps API
                    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_KEY}`);
                    const data = response.data;

                    if (data.status === 'OK' && data.results.length > 0) {
                        const result = data.results[0];
                        const components = result.address_components;

                        let cityVal = 'Pune';
                        const district = components.find(c => c.types.includes('administrative_area_level_2'));
                        if (district) cityVal = district.long_name;

                        const landmarkVal = result.formatted_address;

                        // Deep Zone Scan
                        let zoneVal = '';
                        const fullAddr = (landmarkVal || '').toLowerCase();
                        if (fullAddr.match(/akurdi|pimpri/)) zoneVal = 'East';
                        else if (fullAddr.match(/wakad|hinjewadi/)) zoneVal = 'West';
                        else if (fullAddr.match(/nigdi|bhosari/)) zoneVal = 'North';
                        else if (fullAddr.match(/hadapsar/)) zoneVal = 'South';

                        setFormData(prev => ({
                            ...prev,
                            city: cityVal,
                            zone: zoneVal || prev.zone
                        }));
                    } else {
                        throw new Error(data.status);
                    }
                } catch (err) {
                    console.warn('Primary geocoding failed, falling back to basic detection.');
                    const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
                    const addr = res.data.address;
                    const fullAddr = res.data.display_name || '';

                    let zoneVal = '';
                    if (fullAddr.match(/akurdi|pimpri/i)) zoneVal = 'East';
                    else if (fullAddr.match(/wakad|hinjewadi/i)) zoneVal = 'West';
                    else if (fullAddr.match(/nigdi|bhosari/i)) zoneVal = 'North';
                    else if (fullAddr.match(/hadapsar/i)) zoneVal = 'South';

                    setFormData(prev => ({
                        ...prev,
                        city: addr.county || addr.city_district || 'Pune',
                        zone: zoneVal || prev.zone
                    }));
                } finally {
                    setIsDetectingAddress(false);
                }
            },
            (error) => {
                setIsDetectingAddress(false);
                setError('Unable to retrieve your location. Please enter it manually.');
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-[#f0f9ff] dark:bg-[#020617] p-4 sm:p-6 lg:p-12 relative overflow-hidden transition-colors duration-500 font-sans">
            {/* Background Glows (Subtle Teal/Emerald) */}
            <div className="absolute w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] -top-20 -left-20 animate-pulse pointer-events-none" />
            <div className="absolute w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[100px] -bottom-20 -right-20 animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />

            {/* Split Layout Card */}
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex flex-col sm:flex-row w-full max-w-[800px] sm:min-h-[550px] bg-white dark:bg-gray-950 rounded-[1rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] border border-gray-100 dark:border-white/5 relative z-10"
            >
                {/* LEFT SIDE: Branding & Illustration */}
                <div className="flex flex-col w-full sm:w-[48%] bg-[#288379] relative overflow-hidden">
                    {/* Top Section: Text & Branding */}
                    <div className="flex flex-col sm:h-1/2 justify-start p-10 sm:p-8 relative z-10">
                        {/* Decorative Geometric Shapes */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />

                        {/* Logo & Top Branding */}
                        <div className="flex items-center gap-3 mb-10">
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md border border-white/30">
                                <Recycle size={20} className="text-white" strokeWidth={2.5} />
                            </div>
                            <span className="text-2xl font-black tracking-tight text-white">EcoPulse</span>
                        </div>

                        {/* Welcome Text Section */}
                        <div className="space-y-4">
                            <h2 className="text-[26px] font-black text-white leading-[1.1] tracking-tight">
                                {isLogin ? "Welcome Back !" : "Welcome !"}
                            </h2>
                            <p className="text-white/80 font-medium text-[13px] leading-relaxed max-w-[280px]">
                                {isLogin
                                    ? "Login to access your eco-dashboard and manage city cleanup efforts effortlessly"
                                    : "Create an account to start your journey towards a cleaner, greener sustainable city"
                                }
                            </p>
                        </div>
                    </div>

                    {/* Bottom illustration placement - Hidden on mobile */}
                    <div className="hidden sm:block h-1/2 relative z-10 overflow-hidden">
                        <img
                            src="/eco_city_illustration.png"
                            alt="Sustainable Clean City Dashboard Illustration"
                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105 opacity-80"
                        />
                        <div className="absolute inset-0 bg-[#288379]/20" />
                    </div>
                </div>

                {/* RIGHT SIDE: Auth Form */}
                <div className="flex-1 flex flex-col items-center justify-center py-10 sm:py-6 px-6 sm:px-10 overflow-y-auto">
                    <div className="w-full max-w-[320px]">
                        {/* Header Section */}
                        <div className="text-center sm:text-left mb-8">
                            <h3 className="text-[22px] font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">
                                {isLogin ? 'Sign In' : 'Create Account'}
                            </h3>
                            <p className="text-[12px] font-medium text-gray-500 dark:text-gray-400">
                                {isLogin ? 'Enter your credentials to continue' : 'Register to get started'}
                            </p>
                        </div>

                        {/* Admin / User Segmented Toggle */}
                        {isLogin && (
                            <div className="flex p-1.5 bg-gray-100/80 dark:bg-gray-800/40 rounded-2xl mb-8 sm:mb-6 relative border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
                                <button
                                    type="button"
                                    onClick={() => { setIsAdminLogin(false); setError(''); }}
                                    className={`flex-1 py-2.5 text-[14px] font-bold rounded-xl z-10 transition-all flex items-center justify-center gap-2 ${!isAdminLogin ? 'bg-white dark:bg-gray-700 text-[#288379] shadow-lg shadow-black/5 ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                >
                                    <User size={16} strokeWidth={2.5} />
                                    User Login
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setIsAdminLogin(true); setError(''); }}
                                    className={`flex-1 py-2.5 text-[14px] font-bold rounded-xl z-10 transition-all flex items-center justify-center gap-2 ${isAdminLogin ? 'bg-white dark:bg-gray-700 text-[#288379] shadow-lg shadow-black/5 ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                >
                                    <ShieldCheck size={16} strokeWidth={2.5} />
                                    Admin Login
                                </button>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <AnimatePresence mode="popLayout">
                                {!isLogin && (
                                    <motion.div
                                        key="register-fields"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-4"
                                    >
                                        <div className="space-y-1">
                                            <label className="text-[14px] font-semibold text-gray-700 dark:text-gray-300 ml-1">Full Name</label>
                                            <div className="relative group">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#288379] transition-colors" size={18} />
                                                <input
                                                    type="text"
                                                    name="name"
                                                    required
                                                    autoComplete="name"
                                                    placeholder="Enter your full name"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-2 text-[14px] bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md outline-none focus:border-[#288379] focus:ring-1 focus:ring-[#288379] text-gray-900 dark:text-white transition-all placeholder-gray-400"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[14px] font-semibold text-gray-700 dark:text-gray-300 ml-1">Phone Number</label>
                                            <div className="relative group">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#288379] transition-colors" size={18} />
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    required
                                                    autoComplete="tel"
                                                    placeholder="e.g. 9876543210"
                                                    maxLength="10"
                                                    value={formData.phone}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                                                        setFormData({ ...formData, phone: val });
                                                    }}
                                                    className="w-full pl-10 pr-4 py-2 text-[14px] bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md outline-none focus:border-[#288379] focus:ring-1 focus:ring-[#288379] text-gray-900 dark:text-white transition-all placeholder-gray-400"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between ml-1">
                                                <label className="text-[14px] font-semibold text-gray-700 dark:text-gray-300">City *</label>
                                                <button
                                                    type="button"
                                                    onClick={geolocate}
                                                    disabled={isDetectingAddress}
                                                    className="text-[11px] flex items-center gap-1 text-[#288379] font-bold hover:underline disabled:opacity-50"
                                                >
                                                    {isDetectingAddress ? (
                                                        <><div className="w-3 h-3 border-2 border-[#288379] border-t-transparent rounded-full animate-spin mr-1" /> Detecting...</>
                                                    ) : (
                                                        <><MapPin size={12} /> Auto-Fill Details</>
                                                    )}
                                                </button>
                                            </div>
                                            <div className="relative group">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#288379] transition-colors" size={18} />
                                                <input
                                                    type="text"
                                                    name="city"
                                                    required
                                                    placeholder="e.g. Pune"
                                                    value={formData.city}
                                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-2 text-[14px] bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md outline-none focus:border-[#288379] focus:ring-1 focus:ring-[#288379] text-gray-900 dark:text-white transition-all placeholder-gray-400"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[14px] font-semibold text-gray-700 dark:text-gray-300 ml-1">Zone *</label>
                                                <div className="relative group">
                                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#288379] transition-colors" size={18} />
                                                    <select
                                                        name="zone"
                                                        required
                                                        value={formData.zone}
                                                        onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                                                        className="w-full text-center pr-2 py-2 text-[14px] bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md outline-none focus:border-[#288379] focus:ring-1 focus:ring-[#288379] text-gray-900 dark:text-white transition-all appearance-none cursor-pointer"
                                                    >
                                                        <option value="" className="text-center">Select Zone</option>
                                                        <option value="North" className="text-center">North Zone</option>
                                                        <option value="South" className="text-center">South Zone</option>
                                                        <option value="East" className="text-center">East Zone</option>
                                                        <option value="West" className="text-center">West Zone</option>
                                                        <option value="Central" className="text-center">Central Zone</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[14px] font-semibold text-gray-700 dark:text-gray-300 ml-1">Type</label>
                                                <div className="relative group">
                                                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#288379] transition-colors" size={18} />
                                                    <select
                                                        name="role"
                                                        required
                                                        value={formData.role}
                                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                                        className="w-full text-center pr-2 py-2 text-[14px] bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md outline-none focus:border-[#288379] focus:ring-1 focus:ring-[#288379] text-gray-900 dark:text-white transition-all appearance-none cursor-pointer"
                                                    >
                                                        <option value="citizen" className="text-center">Citizen</option>
                                                        <option value="Swachhta Mitra" className="text-center">Swachhta Mitra</option>
                                                        <option value="admin" className="text-center">Admin</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-1">
                                <label className="text-[14px] font-semibold text-gray-700 dark:text-gray-300 ml-1">Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#288379] transition-colors" size={18} />
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        autoComplete="email"
                                        placeholder="Enter your email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 text-[14px] bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md outline-none focus:border-[#288379] focus:ring-1 focus:ring-[#288379] text-gray-900 dark:text-white transition-all placeholder-gray-400"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[14px] font-semibold text-gray-700 dark:text-gray-300 ml-1">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#288379] transition-colors" size={18} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        required
                                        autoComplete={isLogin ? "current-password" : "new-password"}
                                        placeholder="Enter your password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full pl-10 pr-10 py-2 text-[14px] bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md outline-none focus:border-[#288379] focus:ring-1 focus:ring-[#288379] text-gray-900 dark:text-white transition-all placeholder-gray-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#288379] transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {isLogin && (
                                <div className="flex justify-between items-center py-1">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#288379] focus:ring-[#288379] bg-white dark:bg-gray-900 cursor-pointer" />
                                        <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">Remember me</span>
                                    </label>
                                    <button type="button" onClick={() => setIsResetModalOpen(true)} className="text-[12px] font-bold text-[#288379] hover:text-[#1d6b63] hover:underline transition-all">
                                        Forgot password?
                                    </button>
                                </div>
                            )}

                            <div className="pt-2">
                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="mb-4"
                                        >
                                            <p className="text-[12px] font-bold text-red-500 text-center">{error}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-2.5 bg-[#288379] hover:bg-[#1d6b63] text-white font-bold rounded-xl shadow-lg shadow-[#288379]/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-[15px]"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            {isLogin ? <LogIn size={18} /> : <ArrowRight size={18} />}
                                            <span>{isLogin ? (isAdminLogin ? 'Sign In as Admin' : 'Sign In') : 'Sign Up'}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Social Login */}
                        {!isAdminLogin && (
                            <div className="mt-6 space-y-4">
                                {isLogin && (
                                    <>
                                        <div className="relative">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t border-gray-100 dark:border-gray-800"></div>
                                            </div>
                                            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-gray-400">
                                                <span className="bg-white dark:bg-gray-950 px-3">OR</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-center w-full">
                                            <GoogleAuthButton isLogin={isLogin} setError={setError} selectedRole={formData.role} />
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Toggle Login/Register Mode */}
                        <div className="mt-6 text-center text-[13px] text-gray-500 dark:text-gray-400 space-y-4">
                            <div>
                                {isLogin ? (
                                    <>Don't have an account? <button onClick={() => navigate('/signup')} className="font-bold text-[#288379] hover:underline transition-all ml-1">Sign up</button></>
                                ) : (
                                    <>Already have an account? <button onClick={() => navigate('/login')} className="font-bold text-[#288379] hover:underline transition-all ml-1">Sign in</button></>
                                )}
                            </div>

                            <button
                                onClick={() => navigate('/')}
                                className="flex items-center justify-center gap-1.5 font-bold text-[#288379] hover:text-[#1d6b63] transition-all mx-auto group"
                            >
                                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-all" />
                                Back to Home
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            <ResetPasswordModal
                isOpen={isResetModalOpen}
                onClose={() => setIsResetModalOpen(false)}
            />
        </div>
    );
};

export default Auth;
