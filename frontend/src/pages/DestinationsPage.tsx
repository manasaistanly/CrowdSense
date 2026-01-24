import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, Search, Leaf, LogOut, ArrowRight } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../stores/authStore';

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
    const { user, logout } = useAuth();
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

    const getCapacityColor = (current: number, max: number) => {
        const percentage = (current / max) * 100;
        if (percentage >= 80) return 'text-danger-600 bg-danger-50';
        if (percentage >= 60) return 'text-warning-600 bg-warning-50';
        return 'text-success-600 bg-success-50';
    };

    const getCapacityPercentage = (current: number, max: number) => {
        return Math.round((current / max) * 100);
    };

    const filtered = destinations.filter((d) =>
        d.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#f7fdf9] relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary-100/40 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-primary-100/40 rounded-full blur-3xl pointer-events-none"></div>

            {/* Header */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-primary-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link to="/" className="flex items-center gap-2 group">
                            <Leaf className="h-8 w-8 text-primary-600 group-hover:rotate-12 transition-transform" />
                            <span className="text-xl font-bold bg-gradient-to-r from-primary-900 to-primary-600 bg-clip-text text-transparent">SustainaTour</span>
                        </Link>
                        <div className="flex items-center gap-6">
                            {user ? (
                                <>
                                    <Link to="/dashboard" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition">
                                        Dashboard
                                    </Link>
                                    <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-sm font-bold text-gray-900 leading-none">{user.firstName} {user.lastName}</p>
                                            <p className="text-[10px] text-primary-600 font-bold uppercase tracking-wider mt-1">{user.role}</p>
                                        </div>
                                        <button
                                            onClick={logout}
                                            className="p-2 text-gray-400 hover:text-danger-500 transition hover:bg-danger-50 rounded-lg"
                                            title="Logout"
                                        >
                                            <LogOut className="h-5 w-5" />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <Link
                                    to="/login"
                                    className="bg-primary-600 text-white px-5 py-2 rounded-lg hover:bg-primary-700 transition shadow-lg shadow-primary-500/20 font-medium"
                                >
                                    Sign In
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
                {/* Header Section */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-px w-12 bg-primary-200"></div>
                        <span className="text-primary-600 font-bold uppercase tracking-widest text-xs">Explore Local Heritage</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                        Discover the <span className="text-primary-600">Nilgiris</span>
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
                        Explore our curated selection of sustainable tourism destinations. We balance visitor experiences with ecological preservation.
                    </p>
                </div>

                {/* Search & Filter Bar */}
                <div className="mb-12">
                    <div className="relative max-w-2xl group">
                        <div className="absolute inset-0 bg-primary-100 rounded-2xl blur-lg group-focus-within:bg-primary-200 transition-colors opacity-50"></div>
                        <div className="relative flex items-center bg-white border border-primary-100 rounded-2xl p-1 shadow-sm focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all">
                            <Search className="ml-4 h-5 w-5 text-primary-400" />
                            <input
                                type="text"
                                placeholder="Search by name, location or type..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-3 pr-4 py-3 bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
                            />
                        </div>
                    </div>
                </div>

                {/* Destinations Grid */}
                {loading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-white rounded-3xl shadow-sm p-6 animate-pulse border border-gray-100">
                                <div className="h-56 bg-primary-50 rounded-2xl mb-6"></div>
                                <div className="h-8 bg-primary-50 rounded-lg mb-4 w-3/4"></div>
                                <div className="h-4 bg-primary-50 rounded-md mb-2"></div>
                                <div className="h-4 bg-primary-50 rounded-md w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filtered.map((destination) => (
                            <Link
                                key={destination.id}
                                to={`/destinations/${destination.slug}`}
                                className="group bg-white rounded-[2rem] shadow-sm hover:shadow-2xl hover:shadow-primary-900/10 transition-all duration-500 border border-primary-50 overflow-hidden flex flex-col"
                            >
                                {/* Image Container */}
                                <div className="relative h-64 overflow-hidden">
                                    {destination.images && destination.images.length > 0 ? (
                                        <img
                                            src={typeof destination.images === 'string' ? JSON.parse(destination.images)[0] : destination.images[0]}
                                            alt={destination.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&h=1080&fit=crop';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center">
                                            <Leaf className="h-16 w-16 text-primary-200" />
                                        </div>
                                    )}

                                    {/* Glass Overlay for Type */}
                                    <div className="absolute top-4 left-4 z-10">
                                        <div className="backdrop-blur-md bg-white/70 px-3 py-1.5 rounded-xl border border-white/50 shadow-sm">
                                            <span className="text-[10px] font-bold text-primary-900 uppercase tracking-widest whitespace-nowrap">
                                                {destination.destinationType.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Capacity Bubbles */}
                                    <div className="absolute bottom-4 right-4 z-10 flex gap-2">
                                        <div className={`backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/50 shadow-sm flex items-center gap-1.5 ${getCapacityPercentage(destination.currentCapacity, destination.maxDailyCapacity) >= 90
                                            ? 'bg-danger-500/80 text-white'
                                            : 'bg-white/70 text-primary-900'
                                            }`}>
                                            <Users className="h-3.5 w-3.5" />
                                            <span className="text-xs font-bold">{getCapacityPercentage(destination.currentCapacity, destination.maxDailyCapacity)}%</span>
                                        </div>
                                    </div>

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </div>

                                {/* Content Container */}
                                <div className="p-8 flex-1 flex flex-col">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors leading-tight">
                                        {destination.name}
                                    </h3>

                                    <div className="flex items-start gap-2 text-gray-500 mb-4">
                                        <MapPin className="h-4 w-4 mt-1 flex-shrink-0 text-primary-500" />
                                        <span className="text-sm font-medium leading-relaxed">{destination.locationAddress?.split(',')[1] || destination.locationAddress}</span>
                                    </div>

                                    <p className="text-gray-600 text-sm mb-6 line-clamp-2 leading-relaxed flex-1">
                                        {destination.description}
                                    </p>

                                    {/* Footer */}
                                    <div className="pt-6 border-t border-primary-50 flex items-center justify-between">
                                        <div className="text-xs font-bold uppercase tracking-wider text-primary-700 group-hover:translate-x-1 transition-transform flex items-center gap-2">
                                            View Details <ArrowRight className="h-3.5 w-3.5" />
                                        </div>
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-primary-100 flex items-center justify-center overflow-hidden">
                                                    <img src={`https://i.pravatar.cc/100?u=${destination.id}${i}`} className="w-full h-full object-cover grayscale" alt="Visitor" />
                                                </div>
                                            ))}
                                            <div className="w-8 h-8 rounded-full border-2 border-white bg-primary-50 flex items-center justify-center text-[10px] font-bold text-primary-600">
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
                    <div className="bg-white rounded-[2rem] p-24 text-center border border-primary-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-100 via-primary-500 to-primary-100"></div>
                        <Search className="h-16 w-16 text-primary-100 mx-auto mb-6" />
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No Destinations Found</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            We couldn't find anything matching your search. Try adjusting your filters or search terms.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
