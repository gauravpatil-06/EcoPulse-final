import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Lock, Eye, EyeOff, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ResetPasswordModal = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleClose = () => {
        setStep(1);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setError('');
        setSuccessMessage('');
        onClose();
    };

    const handleVerifyEmail = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await axios.post('/api/auth/verify-email', { email: email.toLowerCase().trim() });
            // Email verified in DB
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Email not found in our records.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { data } = await axios.post('/api/auth/direct-reset-password', { email: email.toLowerCase().trim(), password });
            setSuccessMessage(data.message || 'Password updated successfully!');
            setTimeout(() => {
                handleClose();
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update password.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white w-[88%] sm:w-full max-w-[400px] rounded-[1.25rem] sm:rounded-[1.5rem] shadow-2xl overflow-hidden relative"
                >
                    <button 
                        onClick={handleClose}
                        className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors z-10"
                    >
                        <X size={20} strokeWidth={2.5} />
                    </button>

                    <div className="p-5 sm:p-8">
                        <h2 className="text-[16px] sm:text-[22px] font-black text-slate-800 text-center mb-4 sm:mb-6">
                            {step === 1 ? 'Verify your Email' : 'Update Password'}
                        </h2>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 text-red-600 text-[13px] font-bold rounded-xl text-center border border-red-100">
                                {error}
                            </div>
                        )}

                        {successMessage && (
                            <div className="mb-4 p-3 bg-emerald-50 text-emerald-600 text-[13px] font-bold rounded-xl text-center border border-emerald-100">
                                {successMessage}
                            </div>
                        )}

                        {step === 1 ? (
                            <form onSubmit={handleVerifyEmail} className="space-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-[12px] sm:text-[13px] font-bold text-slate-700 ml-1">Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#288379] transition-colors" size={18} strokeWidth={2} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            placeholder="Enter your email"
                                            className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-[13px] sm:text-[14px] font-semibold bg-white border border-slate-200 outline-none focus:border-[#288379] focus:ring-1 focus:ring-[#288379] rounded-xl text-slate-800 transition-all placeholder-slate-400"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-2.5 sm:py-3.5 bg-[#288379] hover:bg-[#1d6b63] text-white font-black rounded-xl shadow-lg shadow-[#288379]/20 transition-all active:scale-95 disabled:opacity-70 text-[14px] sm:text-[15px]"
                                >
                                    {loading ? 'Verifying...' : 'Verify Email'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleUpdatePassword} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-[12px] sm:text-[13px] font-bold text-slate-700 ml-1">New Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#288379] transition-colors" size={18} strokeWidth={2} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            placeholder="Enter new password"
                                            className="w-full pl-10 pr-10 py-2.5 sm:py-3 text-[13px] sm:text-[14px] font-semibold bg-white border border-slate-200 outline-none focus:border-[#288379] focus:ring-1 focus:ring-[#288379] rounded-xl text-slate-800 transition-all placeholder-slate-400"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[12px] sm:text-[13px] font-bold text-slate-700 ml-1">Confirm Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#288379] transition-colors" size={18} strokeWidth={2} />
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            placeholder="Confirm new password"
                                            className="w-full pl-10 pr-10 py-2.5 sm:py-3 text-[13px] sm:text-[14px] font-semibold bg-white border border-slate-200 outline-none focus:border-[#288379] focus:ring-1 focus:ring-[#288379] rounded-xl text-slate-800 transition-all placeholder-slate-400"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading || !password || !confirmPassword}
                                    className="w-full py-2.5 sm:py-3.5 mt-2 bg-[#288379] hover:bg-[#1d6b63] text-white font-black rounded-xl shadow-lg shadow-[#288379]/20 transition-all active:scale-95 disabled:opacity-70 text-[14px] sm:text-[15px]"
                                >
                                    {loading ? 'Updating...' : 'Update Password'}
                                </button>
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ResetPasswordModal;
