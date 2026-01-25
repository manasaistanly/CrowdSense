import { Link } from 'react-router-dom';
import { Leaf, Shield, Activity, BarChart3, ArrowRight } from 'lucide-react';
import { useAuth } from '../stores/authStore';
import ThemeToggle from '../components/ThemeToggle';

export default function LandingPage() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900 font-sans transition-colors duration-300">
            {/* Navigation */}
            <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-3">
                            <img src="/logo.png" alt="SustainaTour Government Seal" className="h-12 w-auto" />
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight leading-none">SustainaTour</h1>
                                <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold mt-0.5">Ecological Tourism Management Platform</p>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center gap-6">
                            <ThemeToggle />
                            <a href="#mission" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-700 dark:hover:text-primary-400">Our Mission</a>
                            <a href="#impact" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-700 dark:hover:text-primary-400">Regulatory Impact</a>
                            {user ? (
                                <Link
                                    to={user.role === 'TOURIST' ? '/dashboard' : '/admin/dashboard'}
                                    className="bg-primary-700 text-white px-5 py-2.5 rounded-lg hover:bg-primary-800 font-medium transition shadow-sm"
                                >
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Link to="/login" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary-700 dark:hover:text-primary-400">
                                        Staff Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="bg-primary-700 text-white px-5 py-2.5 rounded-lg hover:bg-primary-800 font-medium transition shadow-sm"
                                    >
                                        Tourist Registration
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

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

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-900/50 border border-primary-500/30 text-primary-300 text-sm font-semibold mb-6">
                            <Shield className="h-4 w-4" /> Official Regulatory Platform
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                            Balancing Economic Benefits with <span className="text-primary-400">Ecological Sustainability</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-300 mb-8 leading-relaxed">
                            We implement scientifically grounded carrying capacities to mitigate strain on local ecosystems. Join us in preserving our heritage through adaptive flow regulation.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                to="/destinations"
                                className="bg-primary-600 text-white px-8 py-4 rounded-lg font-bold hover:bg-primary-700 transition flex items-center justify-center gap-2"
                            >
                                Plan Your Visit <ArrowRight className="h-5 w-5" />
                            </Link>
                            <Link
                                to="/about"
                                className="bg-white/10 backdrop-blur-sm text-white border border-white/20 px-8 py-4 rounded-lg font-semibold hover:bg-white/20 transition text-center"
                            >
                                View Regulations
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mission Grid */}
            <div id="mission" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Core Regulatory Objectives</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Our platform operates on four pillars designed to protect destinations while ensuring quality experiences.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                icon: <Activity className="h-8 w-8 text-blue-600" />,
                                title: 'Mitigate Strain',
                                desc: 'Reduce stress caused by intense seasonal inflows on ecosystems, roads, and local communities.'
                            },
                            {
                                icon: <BarChart3 className="h-8 w-8 text-green-600" />,
                                title: 'Regulate Flow',
                                desc: 'Create adaptive systems that control tourist entry and internal circulation patterns.'
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
                            <div key={index} className="bg-slate-50 rounded-xl p-8 border border-slate-100 hover:shadow-md transition">
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

            {/* CTA Section */}
            <div className="bg-slate-900 py-20 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-white mb-6">Compliance & Access Control</h2>
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
