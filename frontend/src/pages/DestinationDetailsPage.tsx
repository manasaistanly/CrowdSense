import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Info, AlertTriangle, ArrowRight, TrendingUp, ArrowLeft, Activity, Target, Leaf, Shield } from 'lucide-react';
import api from '../lib/api';
// import { useAuth } from '../stores/authStore';
import toast from 'react-hot-toast';

interface Zone {
    id: string;
    name: string;
    maxCapacity: number;
    currentCapacity: number;
    zoneType: string;
}

interface Destination {
    id: string;
    name: string;
    description: string;
    locationAddress: string;
    maxDailyCapacity: number;
    currentCapacity: number;
    openingTime: string;
    closingTime: string;
    status: string;
    images: string[];
    amenities: string[];
    guidelines: string;
    zones: Zone[];
    pricingRules: {
        basePrice: number;
        adultPrice: number;
        childPrice: number;
    }[];
}

export default function DestinationDetailsPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    // const { user } = useAuth();
    const [destination, setDestination] = useState<Destination | null>(null);
    const [alternatives, setAlternatives] = useState<Destination[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDestination();
    }, [slug]);

    useEffect(() => {
        if (destination) {
            const percentage = Math.round((destination.currentCapacity / destination.maxDailyCapacity) * 100);
            if (percentage >= 90) {
                fetchAlternatives();
            }
        }
    }, [destination]);

    const fetchDestination = async () => {
        try {
            const response = await api.get(`/destinations/${slug}`);
            setDestination(response.data.data.destination);
        } catch (error) {
            toast.error('Failed to load destination details');
            navigate('/destinations');
        } finally {
            setLoading(false);
        }
    };

    const fetchAlternatives = async () => {
        try {
            const response = await api.get('/destinations');
            // Filter out current destination and full destinations
            const others = response.data.data.destinations
                .filter((d: Destination) => d.id !== destination?.id)
                .filter((d: Destination) => (d.currentCapacity / d.maxDailyCapacity) * 100 < 80)
                .slice(0, 2);
            setAlternatives(others);
        } catch (error) {
            console.error('Failed to load alternatives');
        }
    };

    const getCapacityColor = (current: number, max: number) => {
        const percentage = (current / max) * 100;
        if (percentage >= 90) return 'text-danger-600';
        if (percentage >= 70) return 'text-warning-600';
        return 'text-success-600';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
            </div>
        );
    }

    if (!destination) return null;

    const percentage = Math.round((destination.currentCapacity / destination.maxDailyCapacity) * 100);
    const isHighDemand = percentage >= 90;

    return (
        <div className="min-h-screen bg-[#f7fdf9] pb-12 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary-100/30 rounded-full blur-3xl pointer-events-none"></div>

            {/* Hero Image */}
            <div className="relative h-[28rem] bg-gray-900 overflow-hidden">
                {destination.images && destination.images.length > 0 && (
                    <img
                        src={typeof destination.images === 'string' ? JSON.parse(destination.images)[0] : destination.images[0]}
                        alt={destination.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&h=1080&fit=crop';
                        }}
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent z-10"></div>
                {(!destination.images || destination.images.length === 0) && (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-800 to-primary-950 opacity-80"></div>
                )}

                <div className="absolute bottom-0 left-0 right-0 z-20 container mx-auto px-4 py-12">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="backdrop-blur-md bg-white/20 border border-white/30 px-3 py-1 rounded-full">
                                <span className="text-white text-[10px] font-bold uppercase tracking-widest">Featured Destination</span>
                            </div>
                            {isHighDemand && (
                                <span className="bg-red-500 text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider animate-pulse flex items-center gap-1.5">
                                    <AlertTriangle className="h-3 w-3" /> Peak Load
                                </span>
                            )}
                        </div>
                        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-none">{destination.name}</h1>
                        <div className="flex flex-wrap items-center gap-6 text-white/90">
                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 shadow-lg">
                                <MapPin className="h-5 w-5 text-primary-400" />
                                <span className="text-sm font-medium">{destination.locationAddress}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 shadow-lg">
                                <Clock className="h-5 w-5 text-primary-400" />
                                <span className="text-sm font-medium">{destination.openingTime} - {destination.closingTime}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <Link
                    to="/destinations"
                    className="absolute top-8 left-8 z-30 bg-white/10 backdrop-blur-md text-white px-6 py-2.5 rounded-2xl border border-white/20 hover:bg-white/20 transition-all flex items-center gap-2 font-bold text-sm shadow-xl"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Explore
                </Link>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-30">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Traffic Redistribution Notice */}
                        {isHighDemand && alternatives.length > 0 && (
                            <div className="bg-white rounded-[2rem] shadow-2xl shadow-primary-900/10 border border-warning-200 overflow-hidden group">
                                <div className="p-1.5 bg-gradient-to-r from-warning-500 to-yellow-400"></div>
                                <div className="p-8">
                                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                                        <TrendingUp className="h-6 w-6 text-warning-600" /> Carrying Capacity Alert
                                    </h3>
                                    <p className="text-gray-600 mb-8 max-w-2xl leading-relaxed">
                                        <span className="font-bold text-gray-900">{destination.name}</span> is currently operating at <span className="text-danger-600 font-extrabold">{percentage}%</span> carrying capacity.
                                        To protect the local ecology, we've enabled surge pricing.
                                        <br /><br />
                                        Consider these majestic low-traffic alternatives for a more intimate experience:
                                    </p>

                                    <div className="grid gap-6 md:grid-cols-2">
                                        {alternatives.map(alt => (
                                            <Link key={alt.id} to={`/destinations/${alt.id}`} className="block bg-primary-50/50 p-6 rounded-3xl border border-primary-100 hover:bg-white hover:shadow-xl hover:shadow-primary-900/5 transition-all group/card">
                                                <div className="flex flex-col gap-4">
                                                    <div>
                                                        <h4 className="text-lg font-extrabold text-gray-900 group-hover/card:text-primary-600 transition-colors mb-2">{alt.name}</h4>
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-2 w-2 rounded-full bg-success-500"></div>
                                                            <span className="text-xs text-primary-700 font-bold uppercase tracking-wider">
                                                                Optimal Load: {Math.round((alt.currentCapacity / alt.maxDailyCapacity) * 100)}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-2 pt-4 border-t border-primary-100">
                                                        <span className="text-xs font-bold text-primary-600 flex items-center gap-1">Take Detour <ArrowRight className="h-3 w-3" /></span>
                                                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                                            <Activity className="h-4 w-4 text-primary-400" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Overview Card */}
                        <div className="bg-white rounded-[2rem] shadow-sm p-10 border border-primary-50 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-2 h-full bg-primary-100 group-hover:bg-primary-600 transition-colors"></div>
                            <h2 className="text-3xl font-extrabold text-gray-900 mb-6 tracking-tight">Ecology & Essence</h2>
                            <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line mb-10">
                                {destination.description}
                            </p>

                            <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-primary-50">
                                <div>
                                    <h3 className="text-sm font-bold text-primary-600 uppercase tracking-[0.2em] mb-4">On-Site Services</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {destination.amenities && (Array.isArray(destination.amenities) ? destination.amenities : JSON.parse(destination.amenities as any)).map((amenity: string, index: number) => (
                                            <span key={index} className="px-4 py-2 bg-primary-50 text-primary-700 rounded-2xl text-xs font-bold border border-primary-100/50">
                                                {amenity}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-slate-50 rounded-3xl p-6">
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        Services are maintained by local eco-volunteers and regional authorities to ensure minimal environmental impact.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Zones */}
                        <div className="bg-white rounded-[2rem] shadow-sm p-10 border border-primary-50">
                            <div className="flex items-baseline justify-between mb-8">
                                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Active Zones</h2>
                                <span className="text-xs font-bold text-primary-600 uppercase tracking-widest">{destination.zones.length} Regulated Areas</span>
                            </div>
                            <div className="grid gap-4">
                                {destination.zones.map((zone) => (
                                    <div key={zone.id} className="group/zone bg-white border border-primary-50 rounded-[1.5rem] p-6 flex items-center justify-between hover:bg-primary-50/50 hover:border-primary-100 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center group-hover/zone:bg-white transition-colors">
                                                <Target className="h-6 w-6 text-primary-400" />
                                            </div>
                                            <div>
                                                <h4 className="font-extrabold text-gray-900 text-lg">{zone.name}</h4>
                                                <span className="text-[10px] font-bold px-2 py-0.5 bg-primary-100 text-primary-700 rounded-lg uppercase tracking-wider">
                                                    {zone.zoneType.replace(/_/g, ' ').toLowerCase()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Occupancy</div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden hidden sm:block">
                                                    <div
                                                        className="h-full bg-primary-500 rounded-full"
                                                        style={{ width: `${Math.min(100, (zone.currentCapacity / zone.maxCapacity) * 100)}%` }}
                                                    ></div>
                                                </div>
                                                <div className="font-extrabold text-gray-900 font-mono">
                                                    {zone.currentCapacity}<span className="text-gray-300 mx-1">/</span>{zone.maxCapacity}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Guidelines */}
                        <div className="relative group overflow-hidden bg-primary-900 rounded-[2rem] p-10 shadow-xl shadow-primary-900/20">
                            <div className="absolute top-0 right-0 p-8 text-primary-800 pointer-events-none group-hover:rotate-12 transition-transform opacity-30">
                                <Leaf className="h-32 w-32" />
                            </div>
                            <div className="flex items-start gap-6 relative z-10">
                                <div className="w-12 h-12 bg-primary-800 rounded-2xl flex items-center justify-center text-primary-400 flex-shrink-0">
                                    <Info className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-3xl font-extrabold text-white mb-4 tracking-tight">Eco-Regulations</h3>
                                    <p className="text-primary-100 leading-relaxed text-lg font-medium">
                                        {destination.guidelines}
                                    </p>
                                    <div className="mt-8 flex items-center gap-3">
                                        <Shield className="h-5 w-5 text-primary-500" />
                                        <span className="text-primary-300 text-xs font-bold uppercase tracking-widest">Compliance mandatory for entry</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Live Capacity Card */}
                        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-primary-900/5 p-10 border border-primary-50 sticky top-24 overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-primary-100"></div>

                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-3">
                                    <span className="relative flex h-3 w-3">
                                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${percentage >= 90 ? 'bg-red-400' : 'bg-green-400'}`}></span>
                                        <span className={`relative inline-flex rounded-full h-3 w-3 ${percentage >= 90 ? 'bg-red-500' : 'bg-green-500'}`}></span>
                                    </span>
                                    <span className="text-xs font-bold text-gray-900 uppercase tracking-[0.2em]">Flow Monitoring</span>
                                </div>
                                <Activity className="h-5 w-5 text-primary-200" />
                            </div>

                            <div className="mb-10 text-center">
                                <div className="inline-flex flex-col mb-4">
                                    <span className="text-6xl font-extrabold text-gray-900 tracking-tighter leading-none mb-2">{destination.currentCapacity}</span>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">Registered Visitors</span>
                                </div>

                                <div className="w-full bg-primary-50 rounded-full h-4 overflow-hidden mb-4 p-1">
                                    <div
                                        className={`h-full rounded-full transition-all duration-700 ease-out border-r-2 border-white/20 ${percentage >= 90 ? 'bg-danger-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' :
                                            percentage >= 70 ? 'bg-warning-500' : 'bg-primary-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                                            }`}
                                        style={{ width: `${Math.min(100, percentage)}%` }}
                                    ></div>
                                </div>

                                <div className="flex items-center justify-center gap-4">
                                    <div className={`text-sm font-extrabold uppercase tracking-widest ${getCapacityColor(destination.currentCapacity, destination.maxDailyCapacity)}`}>
                                        {percentage}% Total Load
                                    </div>
                                    <div className="h-1 w-1 rounded-full bg-gray-300"></div>
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Max: {destination.maxDailyCapacity}</div>
                                </div>
                            </div>

                            {destination.status === 'ACTIVE' ? (
                                percentage >= 100 ? (
                                    <div className="bg-danger-50 rounded-3xl p-6 border border-danger-100 mb-8">
                                        <div className="flex items-center gap-3 mb-2 text-danger-700">
                                            <AlertTriangle className="h-5 w-5" />
                                            <span className="font-extrabold text-[10px] uppercase tracking-widest">Entry Restricted</span>
                                        </div>
                                        <p className="text-xs text-danger-600/80 leading-relaxed font-bold">Scientific carrying capacity reached. No additional bookings allowed for today to prevent ecosystem damage.</p>
                                    </div>
                                ) : (
                                    <Link
                                        to={`/book/${destination.id}`}
                                        className={`group relative flex items-center justify-center w-full py-5 rounded-[1.5rem] font-extrabold text-lg transition-all transform hover:-translate-y-1 active:scale-95 mb-8 ${isHighDemand
                                            ? 'bg-warning-600 text-white shadow-xl shadow-warning-600/30 overflow-hidden'
                                            : 'bg-primary-800 text-white shadow-xl shadow-primary-900/30 overflow-hidden group'
                                            }`}
                                    >
                                        <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-[-30deg]"></div>
                                        <span className="relative z-10 flex items-center gap-3">
                                            {isHighDemand ? 'Redeem Surge Access' : 'Generate Entry Pass'}
                                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                        </span>
                                    </Link>
                                )
                            ) : (
                                <div className="bg-slate-100 text-slate-400 p-6 rounded-[1.5rem] text-center font-extrabold uppercase tracking-widest text-sm mb-8 border border-slate-200">
                                    Venue Suspended
                                </div>
                            )}

                            <div className="bg-primary-50/50 rounded-3xl p-8 border border-primary-100">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-[10px] font-bold text-primary-700 uppercase tracking-widest italic">Official Levy</span>
                                    <div className="flex flex-col items-end">
                                        {isHighDemand && <span className="text-[10px] text-danger-400 font-bold line-through mb-1">Standard: ₹{destination.pricingRules[0]?.basePrice || 0}</span>}
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-bold uppercase tracking-tighter ${isHighDemand ? 'text-danger-600' : 'text-primary-600'}`}>INR</span>
                                            <span className={`text-4xl font-black tracking-tighter text-gray-900 ${isHighDemand ? 'text-danger-600' : ''}`}>
                                                {isHighDemand
                                                    ? Math.round((destination.pricingRules[0]?.basePrice || 0) * 1.2)
                                                    : (destination.pricingRules[0]?.basePrice || 0)
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-[10px] text-center text-primary-400/80 font-bold leading-relaxed">
                                    {isHighDemand
                                        ? 'Sovereign levy includes 20% surge for restoration.'
                                        : 'Proceeds support biodiversity conservation projects.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
