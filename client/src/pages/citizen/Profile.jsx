import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Phone, MapPin, Award, BarChart2, CheckCircle, Clock, ShieldCheck, Trophy, Star, Zap, Shield, Target, Flame, Heart, Leaf, Recycle, Camera, MessageSquare, Share2, Users, Crown, Diamond, Gift, Edit2, X, Save, Activity, Calendar, Lock, Key } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import PageHeader from '../../components/PageHeader';

/* ─────────────────────────────────────────────────────────────────
   HoverCard Style (Matching Dashboard)
───────────────────────────────────────────────────────────────── */
const cardBaseStyle = {
    transition: 'transform 0.28s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.28s ease, border-color 0.28s ease',
};
const cardHoverStyle = {
    transform: 'scale(1.01) translateY(-2px)',
    boxShadow: '0 20px 40px -8px rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
};

const HoverCard = ({ children, className, delay }) => {
    const [hovered, setHovered] = React.useState(false);
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: delay || 0 }}
            className={className}
            style={{ ...cardBaseStyle, ...(hovered ? cardHoverStyle : {}) }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {children}
        </motion.div>
    );
};

const CitizenProfile = () => {
    const { user, updateUser, token } = useAuth();
    const { theme } = useTheme();
    const [stats, setStats] = useState({ totalRec: 0, resolvedRec: 0, pendingRec: 0 });
    const [badges, setBadges] = useState([]);
    const [loading, setLoading] = useState(true);

    // Edit Profile State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        firstName: user?.name?.split(' ')[0] || '',
        lastName: user?.name?.split(' ').slice(1).join(' ') || '',
        phone: user?.phone || '',
        city: user?.city || '',
        postalCode: user?.postalCode || ''
    });
    const [updateLoading, setUpdateLoading] = useState(false);

    // Change Password State
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordLoading, setPasswordLoading] = useState(false);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const dashboardEndpoint = (user?.role === 'collector' || user?.role === 'Swachhta Mitra')
                    ? '/api/dashboard/collector'
                    : '/api/dashboard/citizen';

                const [dashRes, badgeRes] = await Promise.all([
                    axios.get(dashboardEndpoint, { headers: { 'x-auth-token': token } }),
                    axios.get('/api/badges/user', { headers: { 'x-auth-token': token } })
                ]);

                if (user?.role === 'collector' || user?.role === 'Swachhta Mitra') {
                    setStats({
                        totalRec: dashRes.data.stats.total || 0,
                        resolvedRec: dashRes.data.stats.completed || 0, // Using completed as resolved for badges
                        pendingRec: (dashRes.data.stats.total - dashRes.data.stats.completed) || 0
                    });
                } else {
                    setStats({
                        totalRec: dashRes.data.stats.total || 0,
                        resolvedRec: dashRes.data.stats.resolved || 0,
                        pendingRec: dashRes.data.stats.pending || 0
                    });
                }
                setBadges(badgeRes.data);
            } catch (err) {
                console.error('Error fetching profile data:', err);
            } finally {
                setLoading(false);
            }
        };

        if (token && user) fetchProfileData();
    }, [token, user]);


    const handlePasswordChange = (e) => {
        setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        setPasswordLoading(true);
        try {
            await axios.put('/api/auth/change-password',
                { currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword },
                { headers: { 'x-auth-token': token } }
            );
            alert('Password updated successfully');
            setIsChangingPassword(false);
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update password');
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleOpenEdit = () => {
        setEditForm({
            firstName: user?.name?.split(' ')[0] || '',
            lastName: user?.name?.split(' ').slice(1).join(' ') || '',
            phone: user?.phone || '',
            city: user?.city || '',
            postalCode: user?.postalCode || ''
        });
        setIsEditing(true);
    };

    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setUpdateLoading(true);
        try {
            const updateData = {
                ...editForm,
                name: `${editForm.firstName} ${editForm.lastName}`.trim()
            };
            const res = await axios.put('/api/auth/profile', updateData, {
                headers: { 'x-auth-token': token }
            });
            updateUser(res.data);
            setIsEditing(false);
        } catch (err) {
            console.error('Error updating profile:', err);
            alert(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setUpdateLoading(false);
        }
    };

    const icons = [Trophy, Award, Star, Zap, Shield, Target, Flame, Heart, Leaf, Recycle, CheckCircle, MapPin, Camera, MessageSquare, Share2, Users, Crown, Diamond, Gift];
    const badgeNames = [
        "First Step", "Clean Starter", "Eco Warrior", "Waste Ninja", "City Helper",
        "Green Citizen", "Recycle Pro", "Sustainability Hero", "Earth Guard", "Nature Friend",
        "Community Star", "Clean Streets", "Green Impact", "Eco Legend", "Waste Buster",
        "Planet Saver", "Pure Heart", "Green Visionary", "City Guardian", "Eco Champion",
        "Neighborhood Hero", "Pollution Fighter", "Sky Watcher", "Water Protector", "Seed Sower",
        "Flower Power", "Forest Keeper", "Garden Sage", "Tree Hugger", "Leaf Specialist",
        "Climate Pilot", "Ocean Saver", "Reef Rescuer", "Beach Cleaner", "Stream Savior",
        "Mountain Guide", "Hillside Guard", "Plain Protector", "Ice Defender", "Arctic Hero",
        "Desert Guard", "Mist Master", "Wind Whisperer", "Solar Seeker", "Lunar Light",
        "Stellar Eco", "Galaxy Guard", "Universal Clean", "Infinity Impact", "Life Bringer",
        "Oxygen Expert", "Carbon Cutter", "Smog Smacker", "Toxin Terminator", "Hazard Hunter",
        "Bottle Baron", "Cardboard King", "Plastic Pirate", "Metal Master", "Glass Genius",
        "Organic Oracle", "Compost Captain", "Zero Hero", "Minimalist Master", "Circular Savvy",
        "Ethical Expert", "Fair Follower", "Kind Keeper", "Smart Strategist", "Clean Catalyst",
        "Spark of Hope", "Beam of Light", "Glow of Earth", "Radiant Runner", "Dazzling Defender",
        "Polished Patriot", "Shining Soul", "Eco Essence", "Nature Nurturer", "Wild Warden",
        "Animal Ally", "Bird Buddy", "Bug Boss", "Fish Friend", "Whale Watcher",
        "Tiger Trust", "Lion Loyal", "Eagle Eye", "Wolf Wisdom", "Panda Peace",
        "Green Giant", "Earth Emperor", "Biosphere Boss", "Gaia Guardian", "Eden Expert",
        "Paradise Planner", "Utopia Unit", "Nature Nexus", "World Wonder", "The Ultimate Green"
    ];

    const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    }) : 'Jan 2025';

    // 🔥 REAL DATA SYNC: Map real badges from DB to UI
    const earnedBadges = React.useMemo(() => {
        return badges.map((ub, i) => ({
            id: ub._id,
            name: ub.badgeId?.name || `Badge ${i + 1}`,
            icon: icons[i % icons.length]
        }));
    }, [badges]);

    const unlockedCount = earnedBadges.length;

    const [uploadMessage, setUploadMessage] = useState('');

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check if file is an image
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Limit size (e.g., 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('File size too large (max 2MB)');
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
            try {
                const base64data = reader.result;
                const token = localStorage.getItem('token');
                const res = await axios.put('/api/auth/profile/avatar',
                    { avatar: base64data },
                    { headers: { 'x-auth-token': token } }
                );

                // Update local user state via context
                if (res.data) {
                    updateUser(res.data);
                }

                setUploadMessage('Profile image uploaded successfully');
                setTimeout(() => setUploadMessage(''), 3000);
            } catch (err) {
                console.error(err);
                alert('Upload failed: ' + (err.response?.data?.message || err.message));
            }
        };
    };


    return (
        <div className="max-w-7xl mx-auto animate-fade-in text-[var(--text-main)]">
            <input
                type="file"
                id="avatar-upload"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
            />
            <PageHeader
                title="My Profile"
                subtitle="Manage your personal account details and security settings"
                icon={User}
            />
            {/* Profile Header Card */}
            <HoverCard className="glass-card bg-white dark:bg-[#0B1121] rounded-[2rem] p-8 mb-6 border-2 border-slate-100 dark:border-white/5 shadow-xl flex items-center gap-8 relative overflow-hidden">
                <div className="w-32 h-32 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-5xl font-black text-emerald-500/40 border-4 border-white dark:border-slate-900 shadow-lg relative">
                    {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover rounded-full" /> : user?.name?.charAt(0) || 'U'}
                    <label
                        htmlFor="avatar-upload"
                        className="absolute bottom-1 right-1 p-2 bg-white dark:bg-slate-800 rounded-full text-emerald-600 shadow-md border border-slate-100 dark:border-slate-700 cursor-pointer hover:scale-110 transition-transform z-10"
                    >
                        <Camera size={14} />
                    </label>
                </div>
                <div>
                    <h2 className="sm:text-2xl text-[1.25rem] font-black text-slate-800 dark:text-slate-100 mb-1">{user?.name}</h2>
                    <p className="text-slate-500 font-bold mb-2 capitalize">{user?.role || 'Citizen'}</p>
                    <div className="flex items-center gap-2 text-slate-400 font-medium text-sm">
                        <MapPin size={16} />
                        <span className="capitalize">{user?.zone || 'Global'}</span> Zone
                    </div>
                    {uploadMessage && (
                        <p className="text-[10px] font-bold text-emerald-500 mt-2 animate-bounce">
                            <CheckCircle size={10} className="inline mr-1" /> {uploadMessage}
                        </p>
                    )}
                </div>
            </HoverCard>

            {/* Personal Information Card */}
            <HoverCard delay={0.1} className="glass-card bg-white dark:bg-[#0B1121] rounded-[2rem] p-8 mb-6 border-2 border-slate-100 dark:border-white/5 shadow-xl relative text-slate-800 dark:text-slate-100">
                <div className="flex items-center justify-between mb-8 border-b border-slate-50 dark:border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 rounded-xl dark:bg-emerald-950/20 text-emerald-600 shrink-0">
                            <Shield size={18} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-[17px] font-black text-gray-800 dark:text-gray-200 tracking-tight">Personal Information</h3>
                    </div>
                    <button
                        onClick={handleOpenEdit}
                        className="flex items-center gap-2 px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-black text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                    >
                        <Edit2 size={16} /> Edit
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8 sm:gap-y-10">
                    <div>
                        <p className="sm:text-[14px] text-[11px] font-black text-slate-800 dark:text-slate-100 mb-1">First Name</p>
                        <p className="sm:text-[12px] text-[10px] font-bold text-slate-600 dark:text-slate-400">{user?.name?.split(' ')[0] || '———'}</p>
                    </div>
                    <div>
                        <p className="sm:text-[14px] text-[11px] font-black text-slate-800 dark:text-slate-100 mb-1">Last Name</p>
                        <p className="sm:text-[12px] text-[10px] font-bold text-slate-600 dark:text-slate-400">{user?.name?.split(' ').slice(1).join(' ') || '———'}</p>
                    </div>
                    <div>
                        <p className="sm:text-[14px] text-[11px] font-black text-slate-800 dark:text-slate-100 mb-1">Joined Date</p>
                        <p className="sm:text-[12px] text-[10px] font-bold text-slate-600 dark:text-slate-400">{memberSince || '———'}</p>
                    </div>

                    <div>
                        <p className="sm:text-[14px] text-[11px] font-black text-slate-800 dark:text-slate-100 mb-1">Email Address</p>
                        <p className="sm:text-[12px] text-[10px] font-bold text-slate-600 dark:text-slate-400 truncate pr-4">{user?.email || '———'}</p>
                    </div>
                    <div>
                        <p className="sm:text-[14px] text-[11px] font-black text-slate-800 dark:text-slate-100 mb-1">Phone Number</p>
                        <p className="sm:text-[12px] text-[10px] font-bold text-slate-600 dark:text-slate-400">{user?.phone || '———'}</p>
                    </div>
                    <div>
                        <p className="sm:text-[14px] text-[11px] font-black text-slate-800 dark:text-slate-100 mb-1">User Role</p>
                        <p className="sm:text-[12px] text-[10px] font-bold text-slate-600 dark:text-slate-400 capitalize">{user?.role || '———'}</p>
                    </div>
                </div>
            </HoverCard>

            {/* Address Card */}
            <HoverCard delay={0.2} className="glass-card bg-white dark:bg-[#0B1121] rounded-[2rem] p-8 mb-10 border-2 border-slate-100 dark:border-white/5 shadow-xl relative text-slate-800 dark:text-slate-100">
                <div className="flex items-center justify-between mb-8 border-b border-slate-50 dark:border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 rounded-xl dark:bg-emerald-950/20 text-emerald-600 shrink-0">
                            <MapPin size={18} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-[17px] font-black text-gray-800 dark:text-gray-200 tracking-tight">Address Details</h3>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8 sm:gap-y-10">
                    <div>
                        <p className="sm:text-[14px] text-[11px] font-black text-slate-800 dark:text-slate-100 mb-1">Assigned Zone</p>
                        <p className="sm:text-[12px] text-[10px] font-bold text-slate-600 dark:text-slate-400 capitalize">{user?.zone || '———'} Zone</p>
                    </div>
                    <div>
                        <p className="sm:text-[14px] text-[11px] font-black text-slate-800 dark:text-slate-100 mb-1">City</p>
                        <p className="sm:text-[12px] text-[10px] font-bold text-slate-600 dark:text-slate-400">{user?.city || '———'}</p>
                    </div>
                    <div>
                        <p className="sm:text-[14px] text-[11px] font-black text-slate-800 dark:text-slate-100 mb-1">Postal Code</p>
                        <p className="sm:text-[12px] text-[10px] font-bold text-slate-600 dark:text-slate-400">{user?.postalCode || '———'}</p>
                    </div>
                </div>
            </HoverCard>

            {/* Profile Content - Earned Badges Section */}
            <HoverCard delay={0.3} className="mb-12 text-slate-800 dark:text-slate-100">
                <div className="glass-card bg-white dark:bg-[#0B1121] border-2 border-slate-100 dark:border-white/5 p-8 rounded-[2rem] shadow-xl">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-50 rounded-xl dark:bg-emerald-950/20 text-emerald-600 shrink-0">
                                <Trophy size={18} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-[17px] font-black text-gray-800 dark:text-gray-200 tracking-tight">Earned Badges</h3>
                            <div className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-full shadow-lg shadow-emerald-500/20 border border-white/20">
                                {unlockedCount} GAINED
                            </div>
                        </div>
                    </div>

                    {earnedBadges.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
                            {earnedBadges.map((badge) => (
                                <div key={badge.id} className="flex flex-col items-center group">
                                    <div className="w-28 h-28 sm:w-32 sm:h-32 bg-emerald-100/50 dark:bg-emerald-500/10 rounded-[2rem] flex items-center justify-center text-emerald-500 border-2 border-emerald-500/20 shadow-md group-hover:scale-105 transition-all duration-300 relative">
                                        <badge.icon size={36} />
                                        <CheckCircle className="absolute -top-1 -right-1 text-emerald-500 bg-white rounded-full p-0.5" size={24} />
                                    </div>
                                    <span className="text-[12px] sm:text-sm font-black text-center mt-4 text-slate-800 dark:text-slate-100 capitalize leading-tight">
                                        {badge.name.toLowerCase()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-100 dark:border-white/5">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
                                <Lock size={30} />
                            </div>
                            <p className="text-slate-500 font-black">Resolve 2 reports to unlock your first badge!</p>
                        </div>
                    )}
                </div>
            </HoverCard>


            {/* Refined Edit Profile Modal */}
            {isEditing && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 animate-fade-in overflow-y-auto">
                    <div className="bg-white dark:bg-[#1B222B] w-full max-w-xl rounded-xl shadow-2xl relative animate-scale-up">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                            <h2 className="text-[17px] font-black text-gray-900 dark:text-white tracking-tight">Edit Personal Information</h2>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 transition-colors"
                            >
                                <X size={24} strokeWidth={1.5} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <p className="text-[0.75rem] text-gray-500 mb-6" style={{ fontWeight: 400 }}>* Indicates required</p>

                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                {/* Name Section */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-1.5 text-left">
                                        <label className="text-[0.875rem] text-[#666666] dark:text-gray-300 font-medium ml-0.5">First Name *</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={editForm.firstName}
                                            onChange={handleEditChange}
                                            required
                                            className="w-full h-[2.5rem] px-3 border border-[#b8b8b8] dark:border-gray-600 rounded-[0.4rem] focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition-all text-gray-900 dark:text-white bg-white dark:bg-slate-800 text-[0.875rem]"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5 text-left">
                                        <label className="text-[0.875rem] text-[#666666] dark:text-gray-300 font-medium ml-0.5">Last Name *</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={editForm.lastName}
                                            onChange={handleEditChange}
                                            required
                                            className="w-full h-[2.5rem] px-3 border border-[#b8b8b8] dark:border-gray-600 rounded-[0.4rem] focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition-all text-gray-900 dark:text-white bg-white dark:bg-slate-800 text-[0.875rem]"
                                        />
                                    </div>
                                </div>

                                {/* Read-only Basic Info Section */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-1.5 text-left">
                                        <label className="text-[0.875rem] text-[#666666] dark:text-gray-300 font-medium ml-0.5">Joined Date</label>
                                        <input
                                            type="text"
                                            value={memberSince || ''}
                                            disabled
                                            className="w-full h-[2.5rem] px-3 border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-slate-900 text-gray-400 cursor-not-allowed text-[0.875rem]"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5 text-left">
                                        <label className="text-[0.875rem] text-[#666666] dark:text-gray-300 font-medium ml-0.5">User Role</label>
                                        <input
                                            type="text"
                                            value={user?.role || ''}
                                            disabled
                                            className="w-full h-[2.5rem] px-3 border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-slate-900 text-gray-400 cursor-not-allowed capitalize text-[0.875rem]"
                                        />
                                    </div>
                                </div>

                                {/* Contact Section */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-1.5 text-left">
                                        <label className="text-[0.875rem] text-[#666666] dark:text-gray-300 font-medium ml-0.5">Email Address</label>
                                        <input
                                            type="email"
                                            value={user?.email || ''}
                                            disabled
                                            className="w-full h-[2.5rem] px-3 border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-slate-900 text-gray-400 cursor-not-allowed text-[0.875rem]"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5 text-left">
                                        <label className="text-[0.875rem] text-[#666666] dark:text-gray-300 font-medium ml-0.5">Phone Number *</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={editForm.phone}
                                            onChange={handleEditChange}
                                            required
                                            className="w-full h-[2.5rem] px-3 border border-[#b8b8b8] dark:border-gray-600 rounded-[0.4rem] focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition-all text-gray-900 dark:text-white bg-white dark:bg-slate-800 text-[0.875rem]"
                                        />
                                    </div>
                                </div>

                                {/* Address Section */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    <div className="flex flex-col gap-1.5 text-left">
                                        <label className="text-[0.875rem] text-[#666666] dark:text-gray-300 font-medium ml-0.5">Assigned Zone</label>
                                        <input
                                            type="text"
                                            value={`${(user?.zone?.charAt(0).toUpperCase() + user?.zone?.slice(1)) || 'Global'} Zone`}
                                            disabled
                                            className="w-full h-[2.5rem] px-3 border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-slate-900 text-gray-400 cursor-not-allowed text-[0.875rem]"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5 text-left">
                                        <label className="text-[0.875rem] text-[#666666] dark:text-gray-300 font-medium ml-0.5">City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={editForm.city}
                                            onChange={handleEditChange}
                                            className="w-full h-[2.5rem] px-3 border border-[#b8b8b8] dark:border-gray-600 rounded-[0.4rem] focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition-all text-gray-900 dark:text-white bg-white dark:bg-slate-800 text-[0.875rem]"
                                            placeholder="Enter City"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5 text-left">
                                        <label className="text-[0.875rem] text-[#666666] dark:text-gray-300 font-medium ml-0.5">Postal Code</label>
                                        <input
                                            type="text"
                                            name="postalCode"
                                            value={editForm.postalCode}
                                            onChange={handleEditChange}
                                            className="w-full h-[2.5rem] px-3 border border-[#b8b8b8] dark:border-gray-600 rounded-[0.4rem] focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition-all text-gray-900 dark:text-white bg-white dark:bg-slate-800 text-[0.875rem]"
                                            placeholder="Enter Postal Code"
                                        />
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={updateLoading}
                                        className="h-[2rem] px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[0.8125rem] transition-all transform active:scale-95 shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {updateLoading ? (
                                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Change Password Modal */}
            {isChangingPassword && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-slate-800 overflow-hidden animate-scale-up">
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                            <div>
                                <h2 className="text-2xl font-black">Security Settings</h2>
                                <p className="text-slate-500 text-sm font-medium">Update your account password</p>
                            </div>
                            <button
                                onClick={() => setIsChangingPassword(false)}
                                className="p-3 hover:bg-white dark:hover:bg-slate-800 rounded-2xl text-slate-400 hover:text-slate-600 transition-all shadow-sm border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdatePassword} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Current Password</label>
                                <div className="relative group">
                                    <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={passwordForm.currentPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-slate-700 dark:text-slate-200 transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">New Password</label>
                                    <div className="relative group">
                                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={passwordForm.newPassword}
                                            onChange={handlePasswordChange}
                                            required
                                            minLength="8"
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none font-bold text-slate-700 dark:text-slate-200 transition-all"
                                            placeholder="Min. 8 characters"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Confirm New Password</label>
                                    <div className="relative group">
                                        <ShieldCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={passwordForm.confirmPassword}
                                            onChange={handlePasswordChange}
                                            required
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none font-bold text-slate-700 dark:text-slate-200 transition-all"
                                            placeholder="Re-type new password"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsChangingPassword(false)}
                                    className="flex-1 px-6 py-4 border border-slate-100 dark:border-slate-700 rounded-lg font-black text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                                >
                                    CANCEL
                                </button>
                                <button
                                    type="submit"
                                    disabled={passwordLoading}
                                    className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-lg font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 dark:shadow-none disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {passwordLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            UPDATE PASSWORD
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CitizenProfile;
