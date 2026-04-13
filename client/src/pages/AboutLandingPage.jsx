import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Recycle, Zap, Target, BarChart3, Flame,
    MapPin, Truck, History, ListTodo,
    CheckCircle2, ChevronDown, ChevronRight,
    Globe, Sparkles, Rocket, ShieldCheck,
    Clock, Star, Heart, 
    ArrowLeft, Trash2, Leaf, Mail, Shield
} from 'lucide-react';

const cardBaseStyle = {
    transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s ease, border-color 0.4s ease',
};

const HoverCard = ({ children, className, style, delay, rKey }) => {
    return (
        <motion.div
            key={rKey}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{ 
                scale: 1.05, 
                y: -10,
                borderColor: 'rgba(16, 185, 129, 0.5)',
                boxShadow: '0 20px 40px -8px rgba(16, 185, 129, 0.18), 0 8px 16px -4px rgba(16, 185, 129, 0.1)',
                transition: { type: "spring", stiffness: 300, damping: 15 }
            }}
            whileTap={{ scale: 1.08 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay, ease: [0.23, 1, 0.32, 1] }}
            className={className}
            style={{
                ...cardBaseStyle,
                ...style,
            }}
        >
            {children}
        </motion.div>
    );
};

const FAQItem = ({ question, answer, isOpen, onClick, i }) => (
    <motion.div
        key={i}
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: i * 0.05 }}
        className="border-2 border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden mb-3 bg-white dark:bg-slate-900 transition-all duration-300 hover:border-emerald-500/40"
    >
        <button
            onClick={onClick}
            className="w-full flex items-center justify-between px-5 py-[10px] text-left focus:outline-none"
        >
            <span className={`text-[10px] sm:text-[1rem] font-bold transition-colors ${isOpen ? 'text-emerald-500' : 'text-slate-900/75 dark:text-slate-100'}`}>
                {question}
            </span>
            <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className={`${isOpen ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-500'}`}
            >
                <ChevronDown size={14} />
            </motion.div>
        </button>
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="px-5 pb-4 text-[9px] sm:text-[1rem] text-slate-600 dark:text-slate-400 font-medium leading-relaxed border-t border-slate-50 dark:border-slate-800/50 pt-3">
                        {answer}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </motion.div>
);

export const AboutLandingPage = ({ onBackToHome }) => {
    const [openFAQ, setOpenFAQ] = useState(null);

    const ecosystemSections = [
        { title: "Our Vision", icon: Sparkles, points: ["EcoPulse aims to build smarter, cleaner urban environments for everyone.", "We use modern tech to ensure zero waste overflow in our streets."] },
        { title: "Our Mission", icon: Target, points: ["Connecting citizens directly with waste collectors for faster action.", "Providing city admins with tools for data-driven cleanup."] },
        { title: "Real-time Reporting", icon: MapPin, points: ["Citizens can report garbage issues with photos and precise location.", "Every report is tracked from submission to final resolution."] },
        { title: "Smart Routing", icon: Truck, points: ["Collectors receive AI-optimized routes to save time and resources.", "Instant notifications for urgent pickups in their designated zones."] },
        { title: "Admin Portal", icon: BarChart3, points: ["Advanced analytics to monitor city-wide waste collection trends.", "Manage users, reports, and zones with high-level efficiency."] },
        { title: "Rewards & Badges", icon: Flame, points: ["Earn Eco-Points for every successful cleanup you contribute to.", "Win exclusive badges for being a consistent green citizen."] },
        { title: "Global Impact", icon: Globe, points: ["Reducing landfill waste and promoting sustainable city living.", "Building a culture of responsibility for a healthier environment."] },
        { title: "Community Goals", icon: Star, points: ["Join neighborhood cleanup challenges and achieve group goals.", "Compete for the cleanest zone title in your city."] }
    ];

    const capabilities = [
        { title: "Photo Analysis", icon: ShieldCheck, points: ["AI verifies garbage reports to ensure accurate task assignment."] },
        { title: "Live Tracking", icon: Clock, points: ["Track current status of reports from 'Pending' to 'Resolved'."] },
        { title: "Data Heatmaps", icon: BarChart3, points: ["Identify waste hotspots to optimize city cleaning strategies."] },
        { title: "Smart Pickup", icon: Zap, points: ["Automated task assignment to the nearest available collector crew."] },
        { title: "Zone Control", icon: MapPin, points: ["Efficiently manage different sectors of the city with ease."] },
        { title: "Eco Rewards", icon: Leaf, points: ["Redeemable points and premium badges for active contributors."] },
        { title: "Clean History", icon: History, points: ["Complete records of reports and collection activities maintained."] },
        { title: "Private & Secure", icon: Shield, points: ["Citizen and location data is kept highly secure and confidential."] }
    ];

    const faqs = [
        { q: "What is EcoPulse Management?", a: "EcoPulse is a smart waste management platform that connects citizens directly with waste collectors. It allows you to report garbage issues through a simple app, ensuring faster cleanup and a cleaner neighborhood for everyone." },
        { q: "How do I report a garbage issue?", a: "To report an issue, simply log in to your dashboard, click on 'Report Garbage', take a photo of the waste, and submit. The system automatically captures your GPS location and notifies the nearest collector crew." },
        { q: "Are there rewards for helping the city?", a: "Yes! For every confirmed report that leads to a cleanup, you earn 'Eco-Points'. You can also earn special badges for your consistent contribution showcased on the city leaderboard." },
        { q: "How does the Smart Pickup work for collectors?", a: "Collectors receive real-time tasks on their dashboard based on reports in their assigned zone. The system provides optimized routes and identifies urgent issues to ensure they finish pickups efficiently." },
        { q: "How does the Admin Portal help city planners?", a: "Admins get a high-level view of all reports and pickup activities. Detailed analytics and heatmaps help them identify problem zones, monitor collector performance, and optimize the entire waste management flow of the city." },
        { q: "Is EcoPulse available for all cities?", a: "Currently, we are rolling out in selected smart city zones. We aim to expand to all urban areas to build a sustainable, waste-free future across the globe." }
    ];

    return (
        <div className="pt-24 sm:pt-28 pb-8 sm:pb-12 space-y-4 sm:space-y-6 max-w-[1440px] mx-auto px-[12px] md:px-[30px] lg:px-[50px] min-h-screen relative z-10 font-sans">
            {/* Back Button */}
            <motion.button
                onClick={onBackToHome}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 font-black text-xs sm:text-lg hover:gap-4 transition-all group mb-6"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                Back to Home
            </motion.button>

            {/* HERO SECTION */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                className="bg-white dark:bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-100 dark:border-white/5 hover:border-emerald-500/50 transition-all duration-500 group"
            >
                <div className="px-8 py-10 md:py-16 relative flex flex-col md:flex-row md:items-center gap-10 md:gap-20">
                    <div className="shrink-0 relative z-10 flex justify-center items-center md:ml-10">
                        <div className="w-16 h-16 sm:w-[180px] sm:h-[180px] md:w-[220px] md:h-[220px] rounded-full flex items-center justify-center overflow-hidden bg-emerald-500/10 border-4 border-emerald-500/20 group-hover:scale-105 transition-transform duration-500">
                             <Recycle className="w-8 h-8 sm:w-2/3 sm:h-2/3 text-emerald-600" strokeWidth={2.5} />
                        </div>
                    </div>

                    <div className="space-y-5 flex-1 text-center md:text-left">
                        <h1 className="text-[12px] sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tighter">
                            <span className="text-emerald-600">EcoPulse </span>
                            <span className="text-slate-800 dark:text-slate-200">is the central nervous system of your smart city's cleanup team.</span>
                        </h1>
                        <p className="text-[9px] sm:text-xl font-bold text-slate-500 dark:text-slate-400">Connect citizens, collectors, and admins in one unified waste management workspace.</p>

                        <div className="space-y-2 max-w-3xl mt-4 mx-auto md:mx-0">
                            {[
                                "Connect citizens, collectors, and admins in one unified waste management workspace.",
                                "Report garbage instantly with GPS tagging and AI verification.",
                                "Monitor city-wide cleaning progress with real-time analytics and heatmaps.",
                                "Reward community action with Eco-Points and build a greener future together."
                            ].map((text, idx) => (
                                <div key={idx} className="relative pl-7 flex items-start">
                                    <div className="absolute left-0 top-[4px] flex items-center justify-center">
                                        <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                            <ChevronRight size={10} className="text-emerald-600" strokeWidth={5} />
                                        </div>
                                    </div>
                                    <p className="text-[9px] sm:text-base md:text-lg text-slate-600 dark:text-slate-400 font-bold leading-snug text-left">
                                        {text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ECOSYSTEM SECTION */}
            <div className="space-y-4 pt-8 sm:pt-20">
                <div className="flex items-center gap-4 border-b-2 border-slate-100 dark:border-white/5 pb-4">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
                        <Globe size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h2 className="text-[11px] sm:text-2xl lg:text-3xl font-black tracking-tight text-slate-900 dark:text-white">Our Ecosystem</h2>
                        <p className="text-[9px] sm:text-base font-bold text-slate-500 dark:text-slate-400">Collaborating for a sustainable urban waste flow.</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                    {ecosystemSections.map((section, i) => (
                        <HoverCard key={section.title} rKey={`eco-${section.title}`} delay={0.1 + (i % 4) * 0.05} className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-6 shadow-xl border-2 border-slate-100 dark:border-white/5 flex flex-col items-start gap-2 sm:gap-3">
                            <div className="flex items-center gap-3 w-full">
                                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-500/10">
                                    <section.icon size={16} className="sm:w-6 sm:h-6" strokeWidth={2.5} />
                                </div>
                                <h3 className="text-[10px] sm:text-lg font-black text-slate-900 dark:text-white leading-tight">{section.title}</h3>
                            </div>
                            <div className="space-y-1.5 sm:space-y-3 w-full">
                                {section.points.map((point, pIdx) => (
                                    <div key={pIdx} className="flex items-start gap-2">
                                        <div className="mt-1.5 w-1 h-1 rounded-full bg-emerald-500 shrink-0"></div>
                                        <p className="text-[8px] sm:text-xs md:text-sm text-slate-600 dark:text-slate-400 font-bold leading-relaxed">{point}</p>
                                    </div>
                                ))}
                            </div>
                        </HoverCard>
                    ))}
                </div>
            </div>

            {/* CAPABILITIES SECTION */}
            <div className="space-y-4 pt-8 sm:pt-12">
                <div className="flex items-center gap-4 border-b-2 border-slate-100 dark:border-white/5 pb-4">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
                        <Leaf size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h2 className="text-[11px] sm:text-2xl lg:text-3xl font-black tracking-tight text-slate-900 dark:text-white">Smart Capabilities</h2>
                        <p className="text-[9px] sm:text-base font-bold text-slate-500 dark:text-slate-400">Advanced features tailored for city-wide cleanup.</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                    {capabilities.map((feature, i) => (
                        <HoverCard key={feature.title} rKey={`feat-${feature.title}`} delay={0.2 + (i % 4) * 0.05} className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-6 shadow-xl border-2 border-slate-100 dark:border-white/5 flex flex-col items-start gap-2 sm:gap-3">
                            <div className="flex items-center gap-3 w-full">
                                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                                    <feature.icon size={16} className="sm:w-6 sm:h-6" strokeWidth={2.5} />
                                </div>
                                <h3 className="text-[10px] sm:text-lg font-black text-slate-900 dark:text-white leading-tight">{feature.title}</h3>
                            </div>
                            <div className="space-y-1.5 w-full">
                                {feature.points.map((point, pIdx) => (
                                    <div key={pIdx} className="flex items-start gap-2">
                                        <div className="mt-1.5 w-1 h-1 rounded-full bg-emerald-500 shrink-0"></div>
                                        <p className="text-[8px] sm:text-xs md:text-sm text-slate-600 dark:text-slate-400 font-bold leading-relaxed">{point}</p>
                                    </div>
                                ))}
                            </div>
                        </HoverCard>
                    ))}
                </div>
            </div>

            {/* FAQ SECTION */}
            <div className="space-y-4 pt-8 sm:pt-12 mx-auto">
                <div className="flex items-center gap-4 border-b-2 border-slate-100 dark:border-white/5 pb-6">
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
                        <Zap size={20} strokeWidth={2.5} />
                    </div>
                    <div className="text-left">
                        <h2 className="text-[11px] sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">Common Questions</h2>
                        <p className="text-[9px] sm:text-lg font-bold text-slate-500 dark:text-slate-400 mt-1">Everything you need to know about EcoPulse.</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-3 pt-6">
                    {faqs.map((faq, i) => (
                        <FAQItem key={i} i={i} question={faq.q} answer={faq.a} isOpen={openFAQ === i} onClick={() => setOpenFAQ(openFAQ === i ? null : i)} />
                    ))}
                </div>
            </div>

        </div>
    );
};
