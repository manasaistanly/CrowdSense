import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, TrendingUp, Activity, Target, Leaf, Shield, ChevronDown, Ticket } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import ThemeToggle from '../components/ThemeToggle';
import { useItinerary } from '../context/ItineraryContext';

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
    latitude?: number;
    longitude?: number;
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
    const { addToItinerary } = useItinerary();
    const [destination, setDestination] = useState<Destination | null>(null);
    const [alternatives, setAlternatives] = useState<Destination[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [visitors, setVisitors] = useState(1);
    const videoRef = useRef<HTMLVideoElement>(null);

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

    // Ensure video plays when loaded
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play().catch(e => console.log("Autoplay prevented:", e));
        }
    }, [destination, loading]);

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
            let others = response.data.data.destinations
                .filter((d: Destination) => d.id !== destination?.id);

            // Sort by proximity (if coordinates exist)
            if (destination?.latitude && destination?.longitude) {
                others = others.sort((a: Destination, b: Destination) => {
                    const distA = getDistance(destination.latitude!, destination.longitude!, a.latitude || 0, a.longitude || 0);
                    const distB = getDistance(destination.latitude!, destination.longitude!, b.latitude || 0, b.longitude || 0);
                    return distA - distB;
                });
            }

            setAlternatives(others.slice(0, 4));
        } catch (error) {
            console.error('Failed to load alternatives');
        }
    };

    // Simple Euclidean distance for sorting (sufficient for local scale)
    const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2));
    };

    const openLocation = () => {
        if (destination?.latitude && destination?.longitude) {
            window.open(`https://www.google.com/maps?q=${destination.latitude},${destination.longitude}`, '_blank');
        } else if (destination?.locationAddress) {
            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination.locationAddress)}`, '_blank');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
            </div>
        );
    }

    if (!destination) return null;

    const percentage = Math.round((destination.currentCapacity / destination.maxDailyCapacity) * 100);
    const isHighDemand = percentage >= 90;

    return (
        <div className="min-h-screen bg-white dark:bg-[#141414] text-gray-900 dark:text-white font-sans selection:bg-red-600 selection:text-white overflow-x-hidden transition-colors duration-300">

            {/* Navbar (Transparent & Floating with improved visibility) */}
            <div className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-6 flex justify-between items-center bg-gradient-to-b from-black/80 via-black/40 to-transparent transition-all duration-300 pointer-events-none">
                <div className="bg-black/30 backdrop-blur-md rounded-full px-4 py-2 border border-white/10 shadow-lg pointer-events-auto flex items-center">
                    <Link to="/destinations" className="flex items-center gap-3 group">
                        <img
                            src="/logo.png"
                            className="h-8 w-8 object-contain transition-all duration-300 rounded-lg"
                            alt="Logo"
                        />
                        <span className="text-white font-bold text-xl tracking-tight uppercase hidden md:block drop-shadow-md">SustainaTour</span>
                    </Link>
                </div>

                <div className="flex items-center gap-6 pointer-events-auto">
                    <div className="bg-black/30 backdrop-blur-md rounded-full p-1.5 border border-white/10 shadow-lg">
                        <ThemeToggle />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded bg-green-500 overflow-hidden border-2 border-white/20 shadow-lg">
                            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent('User Name')}&background=random`} alt="Profile" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Immersive Hero Section (100vh) */}
            <div className="relative w-full h-screen overflow-hidden group">
                {/* Background Video */}
                <div className="absolute inset-0 w-full h-full">
                    <video
                        key={destination.id}
                        ref={videoRef}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover scale-[1.01]"
                        poster={destination.images?.[0] || 'https://unsplash.com/photos/three-brown-wooden-boat-on-blue-lake-water-taken-at-daytime-T7K4aEPoGGk://images.https://unsplash.com/photos/a-body-of-water-surrounded-by-a-forest-cKuCD4mmGos.com/photo-1469474968028-56623f02e42e?w=1920&h=1080&fhttps://www.istockphoto.com/photo/tea-plantations-around-the-emerald-lake-in-ooty-gm537064629-57727784?utm_source=unsplash&utm_medium=affiliate&utm_campaign=srp_photos_bottom&utm_content=https%3A%2F%2Funsplash.com%2Fs%2Fphotos%2Footy-lake&utm_term=ooty+lake%3A%3Areset-search-state%3Aexperiment%3Aee1d6936-8307-4e0c-bd64-89a9a96e46bdit=crop'}
                    >
                        {(() => {
                            const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
                            const name = normalize(destination.name);
                            let videoSrc = null;

                            if (name.includes('simspark')) videoSrc = "/videos/Coonoor - Sim's Park.mp4";
                            else if (name.includes('botanical')) videoSrc = "/videos/GovernmentBotanicalGarden.mp4";
                            else if (name.includes('doddabetta')) videoSrc = "/videos/Doddabetta Peak.mp4";
                            else if (name.includes('pykara')) videoSrc = "/videos/Pykara Falls.mp4";
                            else if (name.includes('pineforest')) videoSrc = "/videos/Pine Forest.mp4";
                            else if (name.includes('ootylake') || name.includes('boathouse')) videoSrc = "/videos/Ooty Lake.mp4";
                            else if (name.includes('biosphere') || name.includes('national')) videoSrc = "/videos/Nilgiris Biosphere Reserve.mp4";
                            else if (name.includes('teamuseum') || name.includes('factory')) videoSrc = "/videos/Tea Museum & Factory.mp4";
                            else if (name.includes('rosegarden')) videoSrc = "/videos/Rose Garden.mp4";
                            else if (name.includes('lambsrock')) videoSrc = "/videos/lake.mp4";
                            else if (name.includes('dolphin')) videoSrc = "/videos/lake.mp4";
                            else videoSrc = "/videos/Nilgiris Biosphere Reserve.mp4"; // Fallback for any other destination

                            return videoSrc ? <source src={videoSrc} type="video/mp4" /> : null;
                        })()}
                    </video>
                    {/* Minimal Gradient for Text Legibility only at bottom */}
                    <div className="absolute inset-x-0 bottom-0 h-[60vh] bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                </div>

                {/* Hero Content Layer */}
                <div className="absolute bottom-0 left-0 w-full px-6 md:px-12 lg:px-16 pb-16 md:pb-24 z-20 flex flex-col justify-end h-full pointer-events-none">
                    <div className="max-w-7xl animate-fade-in-up pointer-events-auto">

                        {/* Meta Tags */}
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            {isHighDemand && (
                                <span className="bg-red-600 text-white text-[10px] md:text-sm font-bold px-3 py-1 rounded uppercase tracking-wider shadow-lg">
                                    High Demand
                                </span>
                            )}
                            <span className="bg-white/20 backdrop-blur-md text-white border border-white/30 text-[10px] md:text-sm font-bold px-3 py-1 rounded uppercase tracking-wider flex items-center gap-1 shadow-sm">
                                <TrendingUp className="h-3 w-3" /> Top Rated
                            </span>
                            <span className="text-white/90 text-xs md:text-sm font-bold drop-shadow-md flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> {destination.locationAddress?.split(',')[1] || 'Nilgiris'}
                            </span>
                        </div>

                        {/* Huge Title - Tuned for responsiveness */}
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white drop-shadow-2xl mb-4 md:mb-6 leading-[0.9] text-balance">
                            {destination.name}
                        </h1>

                        {/* Brief Description */}
                        <p className="text-white/90 text-base md:text-xl font-medium max-w-2xl leading-relaxed drop-shadow-lg mb-6 md:mb-8 line-clamp-3 md:line-clamp-none text-pretty">
                            {destination.description}
                        </p>

                        {/* Booking Controls */}
                        <div className="bg-white/10 backdrop-blur-md p-4 md:p-6 lg:p-8 rounded-xl border border-white/20 mb-8 w-full max-w-5xl">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                <div className="lg:col-span-2">
                                    <label className="block text-white text-sm font-bold mb-2">Visit Date</label>
                                    <input
                                        type="date"
                                        value={selectedDate.toISOString().split('T')[0]}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={(e) => setSelectedDate(new Date(e.target.value))}
                                        className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500 [color-scheme:dark]"
                                    />
                                </div>
                                <div className="lg:col-span-2">
                                    <label className="block text-white text-sm font-bold mb-2">Visitors</label>
                                    <div className="flex items-center bg-white/20 border border-white/30 rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => setVisitors(Math.max(1, visitors - 1))}
                                            className="px-4 py-3 hover:bg-white/10 text-white transition text-lg font-bold"
                                        >
                                            -
                                        </button>
                                        <span className="flex-1 text-center text-white font-bold text-lg">{visitors}</span>
                                        <button
                                            onClick={() => setVisitors(Math.min(20, visitors + 1))}
                                            className="px-4 py-3 hover:bg-white/10 text-white transition text-lg font-bold"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(destination.status === 'ACTIVE' && percentage < 100) ? (
                                    <>
                                        <Link
                                            to={`/book/${destination.id}?date=${selectedDate.toISOString()}&visitors=${visitors}`}
                                            className="flex items-center justify-center gap-3 bg-white text-black hover:bg-gray-200 px-6 py-4 rounded-lg font-bold text-lg transition-all shadow-xl hover:scale-105 active:scale-95"
                                        >
                                            <Ticket className="h-5 w-5 fill-black" />
                                            Book Now
                                        </Link>

                                        <button
                                            onClick={() => {
                                                addToItinerary({
                                                    id: destination.id,
                                                    name: destination.name,
                                                    visitDate: selectedDate,
                                                    visitors: visitors,
                                                    pricePerPerson: destination.pricingRules[0]?.basePrice || 0,
                                                    zoneId: destination.zones[0]?.id,
                                                    image: destination.images?.[0]
                                                });
                                                toast.success('Added to Itinerary');
                                            }}
                                            className="flex items-center justify-center gap-3 bg-transparent text-white border-2 border-white hover:bg-white/10 px-6 py-4 rounded-lg font-bold text-lg transition-all shadow-xl hover:scale-105 active:scale-95"
                                        >
                                            <TrendingUp className="h-5 w-5" />
                                            Add to Plan
                                        </button>
                                    </>
                                ) : (
                                    <button disabled className="md:col-span-2 flex items-center justify-center gap-3 bg-white/50 text-black cursor-not-allowed px-8 py-4 rounded-lg font-bold text-lg">
                                        <Activity className="h-6 w-6" />
                                        {isHighDemand ? 'Capacity Full' : 'Unavailable'}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={openLocation}
                                className="flex items-center gap-2 text-white/80 hover:text-white font-medium transition"
                            >
                                <MapPin className="h-5 w-5" />
                                View on Map
                            </button>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-8 right-12 z-20 animate-bounce pointer-events-none hidden md:block">
                    <ChevronDown className="h-10 w-10 text-white/50" />
                </div>
            </div>

            {/* Content Section (Below the Fold) */}
            <div className="relative z-30 bg-white dark:bg-[#141414] min-h-screen px-6 md:px-12 py-16 -mt-2 rounded-t-3xl shadow-[0_-20px_40px_rgba(0,0,0,0.5)] transition-colors duration-300">

                <div className="max-w-7xl mx-auto space-y-20">
                    {/* Zones Rail */}
                    <section>
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                            <Target className="h-6 w-6 text-red-600" /> Regulated Zones
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {destination.zones.map((zone) => (
                                <div key={zone.id} className="bg-gray-50 dark:bg-[#1f1f1f] p-6 rounded-xl border border-gray-100 dark:border-white/5 hover:border-red-500/30 transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-red-500 transition-colors">{zone.name}</h4>
                                            <p className="text-sm text-gray-500 uppercase tracking-widest mt-1">{zone.zoneType.replace(/_/g, ' ')}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-2xl font-bold text-gray-900 dark:text-white">{zone.currentCapacity}</span>
                                            <span className="text-sm text-gray-400 block">/ {zone.maxCapacity}</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                                        <div className="bg-red-600 h-full transition-all duration-1000" style={{ width: `${(zone.currentCapacity / zone.maxCapacity) * 100}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* About & Info Grid */}
                    <section className="grid lg:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                <Leaf className="h-6 w-6 text-green-500" /> Ecological Guidelines
                            </h3>
                            <div className="bg-green-50/50 dark:bg-green-900/10 p-8 rounded-2xl border border-green-100 dark:border-green-500/20">
                                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed whitespace-pre-line">
                                    {destination.guidelines}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                <Shield className="h-6 w-6 text-blue-500" /> Amenities & Services
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {destination.amenities && (Array.isArray(destination.amenities) ? destination.amenities : JSON.parse(destination.amenities as any)).map((amenity: string, idx: number) => (
                                    <span key={idx} className="px-4 py-2 bg-gray-100 dark:bg-[#252525] rounded-lg text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/5 font-medium">
                                        {amenity}
                                    </span>
                                ))}
                            </div>

                            <div className="mt-8 p-6 bg-gray-50 dark:bg-[#1f1f1f] rounded-xl flex justify-between items-center">
                                <div>
                                    <span className="text-sm text-gray-500 uppercase tracking-widest font-bold">Base Entry Fee</span>
                                    <div className="text-3xl font-black text-gray-900 dark:text-white mt-1">₹{destination.pricingRules[0]?.basePrice}</div>
                                </div>
                                <button className="text-red-600 font-bold hover:underline">View Breakdown</button>
                            </div>
                        </div>
                    </section>

                    {/* Similar Destinations */}
                    {alternatives.length > 0 && (
                        <section>
                            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                                {isHighDemand ? (
                                    <>
                                        <MapPin className="h-6 w-6 text-green-500" />
                                        Nearby Less Crowded Spots
                                    </>
                                ) : (
                                    'You Might Also Like'
                                )}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {alternatives.map((alt) => (
                                    <Link key={alt.id} to={`/destinations/${alt.id}`} className="group block">
                                        <div className="aspect-[4/5] rounded-xl overflow-hidden relative mb-4">
                                            <img src={alt.images?.[0] || `https://source.unsplash.com/random/800x600?nature,${alt.id}`} alt={alt.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                                            <div className="absolute bottom-4 left-4 right-4">
                                                <h4 className="text-lg font-bold text-white mb-1">{alt.name}</h4>
                                                <div className="flex items-center gap-2 text-xs text-white/80">
                                                    <span className="bg-green-500/20 px-2 py-0.5 rounded border border-green-500/30 text-green-300 font-bold">
                                                        {Math.round((alt.currentCapacity / alt.maxDailyCapacity) * 100)}% Load
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}
