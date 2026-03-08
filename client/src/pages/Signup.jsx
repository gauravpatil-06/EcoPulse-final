import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Phone, MapPin, ArrowRight, UserPlus } from 'lucide-react';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        zone: '',
        role: 'citizen'
    });
    const [openSelect, setOpenSelect] = useState(null); // 'zone' or 'role'
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const onChange = e => {
        const { name, value } = e.target;
        if (name === 'phone') {
            // Only allow digits and limit to 10 characters
            const onlyNums = value.replace(/[^0-9]/g, '').slice(0, 10);
            setFormData({ ...formData, [name]: onlyNums });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const onSubmit = async e => {
        if (e) e.preventDefault();
        setError('');

        // 🛡️ Password Validation
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        // 🛡️ Phone Validation
        if (formData.phone.length !== 10) {
            setError('Phone number must be exactly 10 digits');
            return;
        }

        setIsLoading(true);
        try {
            await signup(formData);
            navigate(`/${formData.role}/dashboard`);
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const CustomSelect = ({ name, value, options, label, icon: Icon, placeholder }) => {
        const isOpen = openSelect === name;
        const selectedOption = options.find(opt => opt.value === value);
        const displayValue = selectedOption ? selectedOption.label : placeholder;

        return (
            <div className="space-y-2 group relative">
                <label className="text-sm font-semibold text-slate-700 block text-center w-full">{label}</label>
                <div className="relative">
                    <div 
                        onClick={() => setOpenSelect(isOpen ? null : name)}
                        className={`w-full min-h-[52px] bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-2 rounded-2xl flex items-center justify-center transition-all cursor-pointer relative overflow-hidden ${isOpen ? 'border-emerald-500 ring-4 ring-emerald-500/10' : 'border-slate-100 dark:border-white/5 hover:border-emerald-300'}`}
                    >
                        {Icon && (
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-emerald-500 transition-colors">
                                <Icon size={20} />
                            </div>
                        )}
                        
                        <span className={`text-[15px] font-bold text-center w-full block px-12 ${selectedOption ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                            {displayValue}
                        </span>

                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <ArrowRight size={18} className={`transition-transform duration-500 ${isOpen ? '-rotate-90 text-emerald-500' : 'rotate-90'}`} />
                        </div>
                    </div>

                    {isOpen && (
                        <>
                            <div className="fixed inset-0 z-30" onClick={() => setOpenSelect(null)} />
                            <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-white/10 rounded-2xl shadow-2xl z-40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="p-2 space-y-1">
                                    {options.map((opt) => (
                                        <div
                                            key={opt.value}
                                            onClick={() => {
                                                onChange({ target: { name, value: opt.value } });
                                                setOpenSelect(null);
                                            }}
                                            className={`px-4 py-3 text-[15px] font-bold text-center rounded-xl cursor-pointer transition-all ${value === opt.value ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-600'}`}
                                        >
                                            {opt.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-200/20 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-200/20 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2" />

            <div className="max-w-2xl w-full animate-fade-in">
                <div className="glass-card p-10 md:p-12 rounded-[2.5rem] shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-teal-500" />

                    <div className="flex flex-col md:flex-row items-center justify-between mb-10 pb-8 border-b border-slate-100">
                        <div className="text-center w-full mb-6 md:mb-0">
                            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create Account</h2>
                            <p className="mt-2 text-slate-500 font-medium italic">"Every report counts towards a greener city"</p>
                        </div>
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
                            <UserPlus size={32} />
                        </div>
                    </div>

                    <form className="space-y-8" onSubmit={onSubmit}>
                        {error && (
                            <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm border border-red-100 text-center animate-pulse">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="space-y-2 group">
                                <label className="text-sm font-semibold text-slate-700 ml-1 block text-center w-full">Full Name</label>
                                <div className="relative">
                                    <User className="absolute top-3.5 left-4 h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                    <input
                                        name="name"
                                        type="text"
                                        required
                                        className="input-field px-12"
                                        placeholder="Rahul Sharma"
                                        value={formData.name}
                                        onChange={onChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 group">
                                <label className="text-sm font-semibold text-slate-700 ml-1 block text-center w-full">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute top-3.5 left-4 h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        className="input-field px-12"
                                        placeholder="rahul@example.com"
                                        value={formData.email}
                                        onChange={onChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 group">
                                <label className="text-sm font-semibold text-slate-700 ml-1 block text-center w-full">Password</label>
                                <div className="relative">
                                    <Lock className="absolute top-3.5 left-4 h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                    <input
                                        name="password"
                                        type="password"
                                        required
                                        minLength="8"
                                        className="input-field px-12"
                                        placeholder="Min 8 characters"
                                        value={formData.password}
                                        onChange={onChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 group">
                                <label className="text-sm font-semibold text-slate-700 ml-1 block text-center w-full">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute top-3.5 left-4 h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                    <input
                                        name="phone"
                                        type="text"
                                        inputMode="numeric"
                                        maxLength="10"
                                        required
                                        className="input-field px-12"
                                        placeholder="9988776655"
                                        value={formData.phone}
                                        onChange={onChange}
                                    />
                                </div>
                            </div>

                            <CustomSelect 
                                name="zone"
                                label="Select Your Zone"
                                value={formData.zone}
                                icon={MapPin}
                                placeholder="Choose your area..."
                                options={[
                                    { label: 'North Zone', value: 'North' },
                                    { label: 'South Zone', value: 'South' },
                                    { label: 'East Zone', value: 'East' },
                                    { label: 'West Zone', value: 'West' },
                                    { label: 'Central Zone', value: 'Central' }
                                ]}
                            />

                            <CustomSelect 
                                name="role"
                                label="Register As"
                                value={formData.role}
                                icon={User}
                                placeholder="Select role"
                                options={[
                                    { label: 'Citizen', value: 'citizen' },
                                    { label: 'Swachhta Mitra', value: 'Swachhta Mitra' },
                                    { label: 'Admin', value: 'admin' }
                                ]}
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn-primary w-full flex items-center justify-center space-x-3 group"
                            >
                                {isLoading ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>Create Free Account</span>
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="text-center">
                            <p className="text-slate-600 font-medium">
                                Already helping us? {' '}
                                <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-bold underline decoration-2 underline-offset-4 decoration-emerald-100 hover:decoration-emerald-500 transition-all">
                                    Log in to your account
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Signup;
