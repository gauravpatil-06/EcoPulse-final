import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

const Login = () => {
    const [credentials, setCredentials] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const onChange = e => setCredentials({ ...credentials, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const data = await login(credentials.email, credentials.password);
            navigate(`/${data.user.role}/dashboard`);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl -z-10 animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-100/50 rounded-full blur-3xl -z-10 animate-pulse" />

            <div className="max-w-md w-full animate-fade-in">
                <div className="glass-card p-10 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-teal-500" />
                    
                    <div className="mb-10 text-center">
                        <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-emerald-200">
                            <ShieldCheck size={32} />
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h2>
                        <p className="mt-3 text-slate-500 font-medium">Please enter your details to sign in</p>
                    </div>

                    <form className="space-y-6" onSubmit={onSubmit}>
                        {error && (
                            <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm border border-red-100 flex items-center justify-center animate-shake">
                                {error}
                            </div>
                        )}
                        
                        <div className="space-y-5">
                            <div className="relative group">
                                <label className="text-sm font-semibold text-slate-700 ml-1 mb-2 block">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute top-3.5 left-4 h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        className="input-field px-12"
                                        placeholder="name@company.com"
                                        value={credentials.email}
                                        onChange={onChange}
                                    />
                                </div>
                            </div>

                            <div className="relative group">
                                <label className="text-sm font-semibold text-slate-700 ml-1 mb-2 block">Password</label>
                                <div className="relative">
                                    <Lock className="absolute top-3.5 left-4 h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                    <input
                                        name="password"
                                        type="password"
                                        required
                                        className="input-field px-12"
                                        placeholder="••••••••"
                                        value={credentials.password}
                                        onChange={onChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm py-2">
                            <label className="flex items-center text-slate-600 cursor-pointer">
                                <input type="checkbox" className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 mr-2 h-4 w-4" />
                                Remember me
                            </label>
                            <a href="#" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">Forgot password?</a>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full flex items-center justify-center space-x-2 group-hover:bg-emerald-700"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>

                        <div className="text-center pt-4">
                            <p className="text-slate-600 text-sm font-medium">
                                New to EcoPulse? {' '}
                                <Link to="/signup" className="text-emerald-600 hover:text-emerald-700 font-bold underline decoration-2 underline-offset-4 decoration-emerald-100 hover:decoration-emerald-500 transition-all">
                                    Create account
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
