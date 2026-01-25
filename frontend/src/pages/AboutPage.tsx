import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, Leaf, Volume2, ArrowLeft, Bus, Trash2 } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900 font-sans transition-colors duration-300">
            {/* Header / Nav */}
            <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-4 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 transition">
                        <ArrowLeft className="h-5 w-5" />
                        <span className="font-semibold">Back to Home</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">SustainaTour Regulations</span>
                        <ThemeToggle />
                    </div>
                </div>
            </nav>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-bold mb-6">
                        <Shield className="h-5 w-5" />
                        <span>Official District Mandate</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
                        Visitor Guidelines & <span className="text-primary-600 dark:text-primary-400">Strict Regulations</span>
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                        To preserve the Nilgiris biosphere for future generations, the following regulations are strictly enforced. Fines apply for non-compliance.
                    </p>
                </div>

                {/* Regulation Cards Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Plastic Ban */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border-l-8 border-red-500 shadow-md hover:shadow-xl transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-xl">
                                <Trash2 className="h-8 w-8 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Zero-Plastic Zone</h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                                    Single-use plastics (bottles, bags, cutlery) are completely banned. Vehicles are searched at checkposts.
                                </p>
                                <div className="bg-red-50 dark:bg-red-900/10 px-4 py-2 rounded-lg inline-block text-red-700 dark:text-red-300 font-bold text-sm">
                                    Penalty: ₹5,000 Fine
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Wildlife Priority */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border-l-8 border-amber-500 shadow-md hover:shadow-xl transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="bg-amber-100 dark:bg-amber-900/20 p-3 rounded-xl">
                                <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Wildlife Right-of-Way</h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                                    Animals always have the right of way. Stopping vehicles to feed, tease, or photograph wildlife from close range is a criminal offense.
                                </p>
                                <div className="bg-amber-50 dark:bg-amber-900/10 px-4 py-2 rounded-lg inline-block text-amber-700 dark:text-amber-300 font-bold text-sm">
                                    Penalty: Vehicle Seizure
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Noise Control */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border-l-8 border-blue-500 shadow-md hover:shadow-xl transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-xl">
                                <Volume2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Silence Zones</h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                                    Honking is prohibited in forest corridors and hairpin bends unless necessary for safety. Loud music is banned.
                                </p>
                                <div className="bg-blue-50 dark:bg-blue-900/10 px-4 py-2 rounded-lg inline-block text-blue-700 dark:text-blue-300 font-bold text-sm">
                                    Penalty: ₹2,000 Fine
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Travel Limits */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border-l-8 border-green-500 shadow-md hover:shadow-xl transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-xl">
                                <Bus className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Regulated Entry</h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                                    A valid Digital Entry Pass (E-Pass) is mandatory. Access is capped daily based on eco-carrying capacity.
                                </p>
                                <div className="bg-green-50 dark:bg-green-900/10 px-4 py-2 rounded-lg inline-block text-green-700 dark:text-green-300 font-bold text-sm">
                                    Mandatory E-Pass
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="mt-16 bg-primary-900 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="relative z-10">
                        <Leaf className="h-12 w-12 mx-auto mb-6 text-primary-300" />
                        <h2 className="text-3xl font-bold mb-4">Why these rules?</h2>
                        <p className="text-primary-100 max-w-2xl mx-auto text-lg leading-relaxed mb-8">
                            Every rule exists to protect the unique biodiversity of the Nilgiris. Your cooperation ensures that this paradise remains vibrant for decades to come.
                        </p>
                        <Link to="/register" className="bg-white text-primary-900 px-8 py-3 rounded-lg font-bold hover:bg-primary-50 transition inline-block">
                            I Agree & Register
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
