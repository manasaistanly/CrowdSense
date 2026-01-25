import { Link } from 'react-router-dom';
import { Leaf, Shield, Activity, BarChart3, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useLanguage } from '../context/LanguageContext';

export default function LandingPage() {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900 font-sans transition-colors duration-300">
            <Navbar />

            {/* Hero Section */}
            <div className="relative bg-slate-900 text-white overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900/50 z-10"></div>
                    <img
                        src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=3506&q=80"
                        alt="Protected Landscape"
                        className="w-full h-full object-cover opacity-60"
                    />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-32">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-900/50 border border-primary-500/30 text-primary-300 text-sm font-semibold mb-6">
                            <Shield className="h-4 w-4" /> Official Regulatory Platform
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                            {t.heroTitle}
                        </h1>
                        <p className="text-lg md:text-xl text-slate-300 mb-8 leading-relaxed">
                            {t.heroSubtitle}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                to="/destinations"
                                className="bg-primary-600 text-white px-8 py-4 rounded-lg font-bold hover:bg-primary-700 transition flex items-center justify-center gap-2"
                            >
                                {t.planVisit} <ArrowRight className="h-5 w-5" />
                            </Link>
                            <Link
                                to="/about"
                                className="bg-white/10 backdrop-blur-sm text-white border border-white/20 px-8 py-4 rounded-lg font-semibold hover:bg-white/20 transition text-center"
                            >
                                {t.viewRegulations}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mission Grid */}
            <div id="mission" className="py-16 md:py-24 bg-white dark:bg-gray-900 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">{t.missionTitle}</h2>
                        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                            {t.missionDesc}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                        {[
                            {
                                icon: <Activity className="h-8 w-8 text-blue-600" />,
                                title: 'Mitigate Strain',
                                desc: 'Reduce stress caused by intense seasonal inflows on ecosystems, roads, and local communities.'
                            },
                            {
                                icon: <BarChart3 className="h-8 w-8 text-green-600" />,
                                title: 'Smart Regulation',
                                desc: 'Data-driven insights to manage footfall sustainably.'
                            },
                            {
                                icon: <Leaf className="h-8 w-8 text-emerald-600" />,
                                title: 'Define Limits',
                                desc: 'Establish scientifically grounded carrying capacities for every specific location.'
                            },
                            {
                                icon: <Shield className="h-8 w-8 text-slate-600" />,
                                title: 'Balance Interests',
                                desc: 'Harmonize economic tourism benefits with long-term ecological preservation.'
                            }
                        ].map((item, index) => (
                            <div key={index} className="bg-slate-50 rounded-xl p-6 md:p-8 border border-slate-100 hover:shadow-md transition">
                                <div className="bg-white w-14 h-14 rounded-lg shadow-sm flex items-center justify-center mb-6">
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                                <p className="text-gray-600 leading-relaxed text-sm">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Regulatory Impact Story Section */}
            <div id="impact" className="py-16 md:py-24 bg-slate-50 dark:bg-gray-800 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-bold mb-6">
                                <Activity className="h-4 w-4" /> Real-World Impact
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
                                {t.impactTitle} <span className="text-primary-600 dark:text-primary-400">Harmony</span>.
                            </h2>
                            <div className="space-y-6 text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                                <p>
                                    Imagine a Nilgiris where the winding roads are free of gridlock, where wildlife crosses fearlessly, and where every visitor can hear the wind in the trees, not just engines.
                                </p>
                                <p>
                                    Before SustainaTour, unregulated tourism strained our delicate resources. Water was scarce, roads were clogged, and our precious tigers retreated deeper into the shadows.
                                </p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    Today, we are writing a new story.
                                </p>
                                <p>
                                    By implementing our <strong>Adaptive Capacity Algorithms</strong>, we have reduced peak-hour density by 40%. We don't just limit entry; we curate the flow of time itself. Every QR code scanned is a promise kep—a promise to the land that we will tread lightly, and a promise to you that your experience will be unhurried, authentic, and truly wild.
                                </p>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary-600 rounded-3xl rotate-3 opacity-20 blur-lg"></div>
                            <img
                                src="https://images.unsplash.com/photo-1549366021-9f761d450615?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                                alt="Elephants in harmony"
                                className="relative rounded-3xl shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500 border-4 border-white dark:border-gray-700 w-full"
                            />
                            <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-700 p-6 rounded-xl shadow-xl border border-gray-100 dark:border-gray-600 max-w-xs hidden md:block">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full text-green-600 dark:text-green-400">
                                        <Leaf className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white">-40%</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Carbon Footprint</div>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 italic">"Tourism and nature finally in balance."</p>
                            </div>
                        </div>
                    </div>

                    {/* Impact Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { label: "Traffic Reduction", value: "65%", sub: "Peak Hour Congestion" },
                            { label: "Wildlife Sightings", value: "+30%", sub: "Due to quieter roads" },
                            { label: "Waste Recycled", value: "12 Tons", sub: "Monthly average" },
                            { label: "Local Revenue", value: "+25%", sub: "Sustainable income growth" }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white dark:bg-gray-700 p-6 rounded-2xl border border-gray-100 dark:border-gray-600 shadow-sm text-center">
                                <div className="text-3xl font-black text-primary-600 dark:text-primary-400 mb-1">{stat.value}</div>
                                <div className="text-sm font-bold text-gray-900 dark:text-white">{stat.label}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.sub}</div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-slate-900 py-16 md:py-20 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Compliance & Access Control</h2>
                    <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
                        All visitors must carry a valid digital entry pass. QR codes are validated at checkposts for single-entry access to regulated zones.
                    </p>
                    <Link
                        to="/register"
                        className="inline-block bg-white text-slate-900 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
                    >
                        Get Digital Pass
                    </Link>
                </div>
            </div>
        </div>
    );
}
