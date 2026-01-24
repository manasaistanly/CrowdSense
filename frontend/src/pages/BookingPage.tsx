import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, ChevronRight, Check, TrendingUp, Lock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../stores/authStore';
import toast from 'react-hot-toast';

export default function BookingPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [destination, setDestination] = useState<any>(null);

    // Pricing state
    const [quote, setQuote] = useState<any>(null);
    const [calculatingPrice, setCalculatingPrice] = useState(false);

    // Payment Modal State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<'processing' | 'success' | 'error'>('processing');

    const [formData, setFormData] = useState({
        visitDate: '',
        numberOfVisitors: 1,
        visitorDetails: [{ name: '', age: '' }]
    });

    useEffect(() => {
        if (!user) {
            toast.error('Please login to book tickets');
            navigate('/login');
            return;
        }
        fetchDestination();
    }, [id, user]);

    // Fetch price calculation whenever date or visitors change
    useEffect(() => {
        if (destination && formData.visitDate && formData.numberOfVisitors > 0) {
            fetchQuote();
        }
    }, [destination, formData.visitDate, formData.numberOfVisitors]);

    const fetchDestination = async () => {
        try {
            const response = await api.get(`/destinations/${id}`);
            setDestination(response.data.data.destination);
        } catch (error) {
            toast.error('Failed to load destination');
            navigate('/destinations');
        }
    };

    const fetchQuote = async () => {
        setCalculatingPrice(true);
        try {
            const response = await api.get(`/destinations/${id}/quote`, {
                params: {
                    date: formData.visitDate,
                    visitors: formData.numberOfVisitors
                }
            });
            setQuote(response.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setCalculatingPrice(false);
        }
    };

    const handleVisitorChange = (index: number, field: string, value: string) => {
        const newDetails: any = [...formData.visitorDetails];
        newDetails[index][field] = value;
        setFormData({ ...formData, visitorDetails: newDetails });
    };

    const addVisitor = () => {
        setFormData({
            ...formData,
            numberOfVisitors: formData.numberOfVisitors + 1,
            visitorDetails: [...formData.visitorDetails, { name: '', age: '' }]
        });
    };

    const removeVisitor = (index: number) => {
        if (formData.numberOfVisitors <= 1) return;
        const newDetails = formData.visitorDetails.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            numberOfVisitors: formData.numberOfVisitors - 1,
            visitorDetails: newDetails
        });
    };

    const handlePaymentFlow = async () => {
        setLoading(true);
        try {
            // 1. Create PENDING Booking
            const bookingRes = await api.post('/bookings', {
                destinationId: id,
                visitDate: formData.visitDate,
                numberOfVisitors: formData.numberOfVisitors,
                visitorDetails: formData.visitorDetails
            });

            const bookingId = bookingRes.data.data.booking.id;

            // 2. Show Payment Modal
            setShowPaymentModal(true);
            setPaymentStatus('processing');

            // 3. Simulate Payment Gateway Delay
            setTimeout(async () => {
                setPaymentStatus('success');

                // 4. Confirm Booking on Backend
                try {
                    await api.post(`/bookings/${bookingId}/confirm`, {
                        paymentId: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`
                    });

                    // 5. Redirect after short delay
                    setTimeout(() => {
                        toast.success('Payment Successful!');
                        navigate(`/booking/${bookingId}`);
                    }, 1500);

                } catch (confirmError) {
                    setPaymentStatus('error');
                    toast.error('Payment confirmed but booking update failed. Please contact support.');
                }
            }, 3000); // 3 second simulated delay

        } catch (error: any) {
            toast.error(error.response?.data?.error?.message || 'Booking initiation failed');
            setLoading(false);
            setShowPaymentModal(false);
        }
    };

    if (!destination) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-12 relative">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Steps */}
                <div className="flex items-center justify-between mb-8">
                    {[
                        { n: 1, label: 'Date & Visitors' },
                        { n: 2, label: 'Guest Details' },
                        { n: 3, label: 'Payment' }
                    ].map((s) => (
                        <div key={s.n} className="flex flex-col items-center flex-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-colors ${step >= s.n ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
                                }`}>
                                {step > s.n ? <Check className="h-6 w-6" /> : s.n}
                            </div>
                            <span className={`text-sm ${step >= s.n ? 'text-primary-800 font-medium' : 'text-gray-500'}`}>
                                {s.label}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-primary-600 p-6 text-white">
                        <h1 className="text-2xl font-bold">Booking for {destination.name}</h1>
                        <p className="opacity-90">Complete your reservation</p>
                    </div>

                    <div className="p-8">
                        {step === 1 && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                                    <div className="relative">
                                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                                        <input
                                            type="date"
                                            required
                                            min={new Date().toISOString().split('T')[0]}
                                            value={formData.visitDate}
                                            onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Number of Visitors</label>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => formData.numberOfVisitors > 1 && removeVisitor(formData.numberOfVisitors - 1)}
                                            className="w-12 h-12 rounded-xl border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-xl font-bold text-gray-600"
                                        >
                                            -
                                        </button>
                                        <span className="text-2xl font-bold text-gray-900 w-12 text-center">{formData.numberOfVisitors}</span>
                                        <button
                                            onClick={addVisitor}
                                            className="w-12 h-12 rounded-xl border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-xl font-bold text-gray-600"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Dynamic Pricing Indicator */}
                                {quote && quote.surgeMultiplier > 1 && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 animate-fadeIn">
                                        <div className="flex items-start gap-3">
                                            <TrendingUp className="h-5 w-5 text-yellow-600 mt-1" />
                                            <div>
                                                <h4 className="font-bold text-yellow-800">Dynamic Pricing Active</h4>
                                                <div className="text-sm text-yellow-700 mt-1 space-y-1">
                                                    {quote.reasons.map((reason: string, i: number) => (
                                                        <div key={i} className="flex items-center gap-2">
                                                            <span>• {reason}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="pt-6">
                                    <button
                                        onClick={() => {
                                            if (!formData.visitDate) {
                                                toast.error('Please select a date');
                                                return;
                                            }
                                            setStep(2);
                                        }}
                                        className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold hover:bg-primary-700 transition flex items-center justify-center gap-2"
                                    >
                                        Continue <ChevronRight className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-900">Guest Details</h3>
                                {formData.visitorDetails.map((visitor, index) => (
                                    <div key={index} className="bg-gray-50 p-4 rounded-xl space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium text-gray-700">Guest {index + 1}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                                                <input
                                                    type="text"
                                                    value={visitor.name}
                                                    onChange={(e) => handleVisitorChange(index, 'name', e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary-500 outline-none"
                                                    placeholder="John Doe"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Age</label>
                                                <input
                                                    type="number"
                                                    value={visitor.age}
                                                    onChange={(e) => handleVisitorChange(index, 'age', e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary-500 outline-none"
                                                    placeholder="25"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div className="flex gap-4 pt-6">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-200 transition"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={() => setStep(3)}
                                        className="flex-1 bg-primary-600 text-white py-4 rounded-xl font-bold hover:bg-primary-700 transition flex items-center justify-center gap-2"
                                    >
                                        Continue <ChevronRight className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6">
                                <div className="bg-gray-50 p-6 rounded-xl">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Destination</span>
                                            <span className="font-medium">{destination.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Date</span>
                                            <span className="font-medium">{new Date(formData.visitDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Guests</span>
                                            <span className="font-medium">{formData.numberOfVisitors}</span>
                                        </div>

                                        <div className="border-t border-gray-200 my-2"></div>

                                        {/* Price Breakdown */}
                                        {quote && (
                                            <>
                                                <div className="flex justify-between text-gray-500">
                                                    <span>Base Price</span>
                                                    <span>₹{quote.breakdown.base}</span>
                                                </div>
                                                {quote.surgeMultiplier > 1 && (
                                                    <div className="flex justify-between text-yellow-600 font-medium">
                                                        <span>Surge Adjustment</span>
                                                        <span>+ ₹{quote.breakdown.surge}</span>
                                                    </div>
                                                )}
                                                <div className="pt-3 border-t border-gray-200 flex justify-between text-lg font-bold text-gray-900">
                                                    <span>Total Amount</span>
                                                    <span>₹{quote.totalPrice}</span>
                                                </div>
                                            </>
                                        )}

                                        {!quote && calculatingPrice && (
                                            <div className="text-center py-2 text-gray-400">Calculating...</div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3">
                                    <Lock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-blue-900 font-semibold mb-1">
                                            Secure Payment Gateway
                                        </p>
                                        <p className="text-xs text-blue-700">
                                            Your transaction is secured with 256-bit encryption. You will be redirected to the payment provider.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button
                                        onClick={() => setStep(2)}
                                        disabled={loading}
                                        className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-200 transition disabled:opacity-50"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handlePaymentFlow}
                                        disabled={loading || !quote}
                                        className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 rounded-xl font-bold hover:from-primary-700 hover:to-primary-800 transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
                                    >
                                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : `Pay ₹${quote?.totalPrice || '...'}`}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Simulated Payment Gateway Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse"></div>

                        {paymentStatus === 'processing' && (
                            <div className="py-6 space-y-4">
                                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Processing Payment</h3>
                                <p className="text-gray-500">Please wait while we contact the payment gateway...</p>
                                <div className="flex justify-center gap-2 mt-4">
                                    <div className="w-10 h-6 bg-gray-100 rounded border border-gray-200"></div>
                                    <div className="w-10 h-6 bg-gray-100 rounded border border-gray-200"></div>
                                    <div className="w-10 h-6 bg-gray-100 rounded border border-gray-200"></div>
                                </div>
                            </div>
                        )}

                        {paymentStatus === 'success' && (
                            <div className="py-6 space-y-4 animate-scaleIn">
                                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Payment Successful!</h3>
                                <p className="text-green-600 font-medium">Transaction ID: TXN-{Date.now().toString().slice(-6)}</p>
                                <p className="text-gray-500 text-sm">Redirecting to tickets...</p>
                            </div>
                        )}

                        {paymentStatus === 'error' && (
                            <div className="py-6 space-y-4">
                                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle className="h-8 w-8 text-red-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Payment Failed</h3>
                                <p className="text-red-600">Something went wrong. Please try again.</p>
                                <button
                                    onClick={() => setShowPaymentModal(false)}
                                    className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                                >
                                    Close
                                </button>
                            </div>
                        )}

                        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-400">
                            <Lock className="h-3 w-3" /> Encrypted Connection
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
