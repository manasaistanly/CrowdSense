import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, Search, ArrowRight } from 'lucide-react';
import api from '../lib/api';
import Navbar from '../components/Navbar';
import { useLanguage } from '../context/LanguageContext';

interface Destination {
    id: string;
    name: string;
    slug: string;
    description: string;
    destinationType: string;
    maxDailyCapacity: number;
    currentCapacity: number;
    locationAddress: string;
    images: string[];
}

export default function DestinationsPage() {
    const { t } = useLanguage();
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchDestinations();
    }, []);

    const fetchDestinations = async () => {
        try {
            const response = await api.get('/destinations');
            setDestinations(response.data.data.destinations);
        } catch (error) {
            console.error('Failed to fetch destinations:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCapacityPercentage = (current: number, max: number) => {
        return Math.round((current / max) * 100);
    };

    const filtered = destinations.filter((d) =>
        d.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#f7fdf9] dark:bg-gray-900 relative overflow-hidden transition-colors duration-300">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary-100/40 dark:bg-primary-900/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-primary-100/40 dark:bg-primary-900/20 rounded-full blur-3xl pointer-events-none"></div>

            <Navbar />

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
                {/* Header Section */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-px w-12 bg-primary-200 dark:bg-primary-800"></div>
                        <span className="text-primary-600 dark:text-primary-400 font-bold uppercase tracking-widest text-xs">{t.exploreHeritage}</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
                        {t.discoverNilgiris} <span className="text-primary-600 dark:text-primary-400">Nilgiris</span>
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
                        {t.worldCurated}
                    </p>
                </div>

                {/* Search & Filter Bar */}
                <div className="mb-12">
                    <div className="relative max-w-2xl group">
                        <div className="absolute inset-0 bg-primary-100 dark:bg-primary-900/30 rounded-2xl blur-lg group-focus-within:bg-primary-200 dark:group-focus-within:bg-primary-900/50 transition-colors opacity-50"></div>
                        <div className="relative flex items-center bg-white dark:bg-gray-800 border border-primary-100 dark:border-gray-700 rounded-2xl p-1 shadow-sm focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all">
                            <Search className="ml-4 h-5 w-5 text-primary-400" />
                            <input
                                type="text"
                                placeholder={t.searchPlaceholder}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-3 pr-4 py-3 bg-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
                            />
                        </div>
                    </div>
                </div>

                {/* Destinations Grid */}
                {loading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6 animate-pulse border border-gray-100 dark:border-gray-700">
                                <div className="h-56 bg-primary-50 dark:bg-gray-700 rounded-2xl mb-6"></div>
                                <div className="h-8 bg-primary-50 dark:bg-gray-700 rounded-lg mb-4 w-3/4"></div>
                                <div className="h-4 bg-primary-50 dark:bg-gray-700 rounded-md mb-2"></div>
                                <div className="h-4 bg-primary-50 dark:bg-gray-700 rounded-md w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filtered.map((destination) => (
                            <Link
                                key={destination.id}
                                to={`/destinations/${destination.slug}`}
                                className="group bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm hover:shadow-2xl hover:shadow-primary-900/10 transition-all duration-500 border border-primary-50 dark:border-gray-700 overflow-hidden flex flex-col"
                            >
                                {/* Image Container */}
                                <div className="relative h-64 overflow-hidden">
                                    {/* Custom Image Logic */}
                                    {(() => {
                                        const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
                                        const name = normalize(destination.name);
                                        let imgSrc = null;

                                        // Specific overrides with reliable Unsplash IDs - Updated 
                                        // Specific overrides - FORCE Ooty Lake
                                        if (name.includes('ooty') && (name.includes('lake') || name.includes('boat'))) {
                                            imgSrc = "https://images.unsplash.com/photo-1578509395623-a5509ae3d288?auto=format&fit=crop&w=800&q=80";
                                        }
                                        else if (destination.slug === 'ooty-lake') {
                                            imgSrc = "https://images.unsplash.com/photo-1578509395623-a5509ae3d288?auto=format&fit=crop&w=800&q=80";
                                        }
                                        else if (name.includes('mudumalai') || name.includes('nationalpark')) imgSrc = "https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=800&q=80"; // Elephant
                                        else if (name.includes('coonoor') || name.includes('simspark')) imgSrc = "https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=800&q=80"; // Hills/Tea Estate
                                        else if (name.includes('doddabetta')) imgSrc = "https://images.unsplash.com/photo-1582539061545-56623f02e42e?auto=format&fit=crop&w=800&q=80"; // Peak

                                        // Default fallback
                                        if (!imgSrc && destination.images && destination.images.length > 0) {
                                            imgSrc = typeof destination.images === 'string' ? JSON.parse(destination.images)[0] : destination.images[0];
                                        }

                                        return (
                                            <img
                                                src={imgSrc || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop'}
                                                alt={destination.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    // If the custom image fails, try a different reliable local or remote fallback
                                                    // Prevent infinite loop by checking if currently source is already the fallback
                                                    if (!target.src.includes('1469474968028')) {
                                                        target.src = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop';
                                                    }
                                                }}
                                            />
                                        );
                                    })()}

                                    {/* Glass Overlay for Type */}
                                    <div className="absolute top-4 left-4 z-10">
                                        <div className="backdrop-blur-md bg-white/70 dark:bg-gray-900/70 px-3 py-1.5 rounded-xl border border-white/50 dark:border-gray-600 shadow-sm">
                                            <span className="text-[10px] font-bold text-primary-900 dark:text-primary-100 uppercase tracking-widest whitespace-nowrap">
                                                {destination.destinationType.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Capacity Bubbles */}
                                    <div className="absolute bottom-4 right-4 z-10 flex gap-2">
                                        <div className={`backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/50 dark:border-gray-600 shadow-sm flex items-center gap-1.5 ${getCapacityPercentage(destination.currentCapacity, destination.maxDailyCapacity) >= 90
                                            ? 'bg-danger-500/80 text-white'
                                            : 'bg-white/70 dark:bg-gray-900/70 text-primary-900 dark:text-white'
                                            }`}>
                                            <Users className="h-3.5 w-3.5" />
                                            <span className="text-xs font-bold">{getCapacityPercentage(destination.currentCapacity, destination.maxDailyCapacity)}%</span>
                                        </div>
                                    </div>

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </div>

                                {/* Content Container */}
                                <div className="p-8 flex-1 flex flex-col">
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-tight">
                                        {destination.name}
                                    </h3>

                                    <div className="flex items-start gap-2 text-gray-500 dark:text-gray-400 mb-4">
                                        <MapPin className="h-4 w-4 mt-1 flex-shrink-0 text-primary-500" />
                                        <span className="text-sm font-medium leading-relaxed">{destination.locationAddress?.split(',')[1] || destination.locationAddress}</span>
                                    </div>

                                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 line-clamp-2 leading-relaxed flex-1">
                                        {destination.description}
                                    </p>

                                    {/* Footer */}
                                    <div className="pt-6 border-t border-primary-50 dark:border-gray-700 flex items-center justify-between">
                                        <div className="text-xs font-bold uppercase tracking-wider text-primary-700 dark:text-primary-400 group-hover:translate-x-1 transition-transform flex items-center gap-2">
                                            {t.viewDetails} <ArrowRight className="h-3.5 w-3.5" />
                                        </div>
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-primary-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                                    <img src={`https://i.pravatar.cc/100?u=${destination.id}${i}`} className="w-full h-full object-cover grayscale" alt="Visitor" />
                                                </div>
                                            ))}
                                            <div className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-primary-50 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold text-primary-600 dark:text-primary-400">
                                                +
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {!loading && filtered.length === 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-24 text-center border border-primary-100 dark:border-gray-700 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-100 via-primary-500 to-primary-100 dark:from-gray-700 dark:via-primary-600 dark:to-gray-700"></div>
                        <Search className="h-16 w-16 text-primary-100 dark:text-gray-700 mx-auto mb-6" />
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t.noDestinations}</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                            We couldn't find anything matching your search. Try adjusting your filters or search terms.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
