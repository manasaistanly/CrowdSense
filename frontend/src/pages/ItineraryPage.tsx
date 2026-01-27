import { useState } from 'react';
import { useItinerary } from '../context/ItineraryContext';
import { Trash2, Calendar, Users, CheckCircle, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function ItineraryPage() {
    const { items, removeFromItinerary, clearItinerary, totalAmount } = useItinerary();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleCheckout = async () => {
        if (items.length === 0) return;
        setLoading(true);

        try {
            // Prepare payload
            const payload = {
                items: items.map(item => ({
                    destinationId: item.id,
                    visitDate: item.visitDate,
                    visitors: item.visitors,
                    zoneId: item.zoneId
                }))
            };

            const response = await api.post('/bookings/batch', payload);

            if (response.data.success) {
                toast.success('Itinerary Booked Successfully!');
                clearItinerary();
                // Redirect to a summary or dashboard?
                // For now, let's go to Dashboard where they can see their bookings
                navigate('/dashboard');
            }
        } catch (error: any) {
            console.error('Checkout failed:', error);
            const msg = error.response?.data?.error?.message || 'Checkout failed. Please try again.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 px-6 flex flex-col items-center justify-center text-center">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full">
                    <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your Itinerary is Empty</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Explore the Nilgiris and add destinations to build your perfect trip.</p>
                    <button
                        onClick={() => navigate('/destinations')}
                        className="bg-primary-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-primary-700 transition"
                    >
                        Explore Destinations
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-12 px-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                    <Calendar className="h-8 w-8 text-primary-600" />
                    My Trip Itinerary
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8 ml-11">Review your selected destinations and book everything in one click.</p>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Items List */}
                    <div className="lg:col-span-2 space-y-6">
                        {items.map((item) => (
                            <div key={item.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex gap-6 relative group hover:border-primary-500/30 transition-all">
                                <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                                    <img src={item.image || `https://source.unsplash.com/random/200x200?nature,${item.id}`} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{item.name}</h3>
                                    <div className="space-y-1">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                            <Calendar className="h-4 w-4" /> {new Date(item.visitDate).toLocaleDateString()}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                            <Users className="h-4 w-4" /> {item.visitors} Visitors
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">₹{item.pricePerPerson * item.visitors}</p>
                                    <button
                                        onClick={() => removeFromItinerary(item.id)}
                                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg mt-2 transition opacity-0 group-hover:opacity-100"
                                        title="Remove"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 sticky top-24">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Trip Summary</h3>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                                    <span>Destinations</span>
                                    <span>{items.length}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                                    <span>Total Visitors</span>
                                    <span>{items.reduce((acc, i) => acc + i.visitors, 0)}</span>
                                </div>
                                <div className="h-px bg-gray-100 dark:bg-gray-700" />
                                <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white">
                                    <span>Total Amount</span>
                                    <span>₹{totalAmount}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={loading}
                                className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-700 transition flex items-center justify-center gap-2 shadow-lg shadow-primary-600/30 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                ) : (
                                    <>
                                        <CheckCircle className="h-5 w-5" />
                                        Book Unified Pass
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-gray-500 mt-4 text-center flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 shrink-0 text-yellow-500" />
                                Availability is checked in real-time. If any destination is full, the entire booking will be paused for adjustment.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
