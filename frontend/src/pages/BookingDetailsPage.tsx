import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Users, ArrowLeft, Download, Shield } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface Booking {
    id: string;
    bookingReference: string;
    visitDate: string;
    numberOfVisitors: number;
    totalPrice: number;
    status: string;
    qrCode: string;
    destination: {
        name: string;
        locationAddress: string;
    };
    user: {
        firstName: string;
        lastName: string;
        email: string;
    };
    entryTime?: string;
}

export default function BookingDetailsPage() {
    const { id } = useParams();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBooking();
    }, [id]);

    const fetchBooking = async () => {
        try {
            const response = await api.get(`/bookings/${id}`);
            setBooking(response.data.data.booking);
        } catch (error) {
            toast.error('Failed to load booking details');
        } finally {
            setLoading(false);
        }
    };

    const downloadTicket = () => {
        // Create a temporary link to download the QR code image
        if (booking?.qrCode) {
            const link = document.createElement('a');
            link.href = booking.qrCode;
            link.download = `Ticket-${booking.bookingReference}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!booking) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link to="/dashboard" className="flex items-center text-gray-600 hover:text-primary-600 mb-6">
                    <ArrowLeft className="h-5 w-5 mr-2" /> Back to Dashboard
                </Link>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="bg-primary-600 px-8 py-6 text-white flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold">E-Ticket</h1>
                            <p className="opacity-90 mt-1 flex items-center gap-2">
                                <Shield className="h-4 w-4" /> Official Entry Pass
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm opacity-75">Reference</p>
                            <p className="font-mono font-bold text-lg">{booking.bookingReference}</p>
                        </div>
                    </div>

                    <div className="p-8">
                        {/* Status Banner */}
                        {booking.status === 'CHECKED_IN' && (
                            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-3 mb-6">
                                <Shield className="h-5 w-5" />
                                <span className="font-bold">Checked In - Entry Verified</span>
                            </div>
                        )}
                        {booking.status === 'COMPLETED' && (
                            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center gap-3 mb-6">
                                <Shield className="h-5 w-5" />
                                <span className="font-bold">Visit Completed</span>
                            </div>
                        )}

                        <div className="flex flex-col md:flex-row gap-8 items-center justify-center mb-8">
                            <div className="text-center p-4 bg-white border-2 border-dashed border-gray-300 rounded-xl">
                                {booking.qrCode ? (
                                    <img src={booking.qrCode} alt="Ticket QR Code" className="w-48 h-48 mx-auto" />
                                ) : (
                                    <div className="w-48 h-48 bg-gray-100 flex items-center justify-center text-gray-400">
                                        No QR Code
                                    </div>
                                )}
                                <p className="text-xs text-gray-400 mt-2 font-mono">Scan at Checkpost</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Visit Details</h3>
                                <h2 className="text-xl font-bold text-gray-900 mb-1">{booking.destination.name}</h2>
                                <p className="text-gray-600 flex items-center gap-2">
                                    <MapPin className="h-4 w-4" /> {booking.destination.locationAddress}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <span className="block text-xs font-medium text-gray-500 mb-1">Date</span>
                                    <div className="flex items-center gap-2 font-semibold text-gray-900">
                                        <Calendar className="h-4 w-4 text-primary-500" />
                                        {new Date(booking.visitDate).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <span className="block text-xs font-medium text-gray-500 mb-1">Visitors</span>
                                    <div className="flex items-center gap-2 font-semibold text-gray-900">
                                        <Users className="h-4 w-4 text-primary-500" />
                                        {booking.numberOfVisitors} Person(s)
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-6">
                                <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                                    <span>Primary Guest</span>
                                    <span className="font-medium text-gray-900">{booking.user.firstName} {booking.user.lastName}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm text-gray-600">
                                    <span>Booking Status</span>
                                    <span className={`font-bold px-2 py-0.5 rounded text-xs ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                            booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100'
                                        }`}>
                                        {booking.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <button
                                onClick={downloadTicket}
                                className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold hover:bg-primary-700 transition flex items-center justify-center gap-2 shadow-lg"
                            >
                                <Download className="h-5 w-5" /> Download Ticket
                            </button>
                            <p className="text-center text-xs text-gray-400 mt-4">
                                Please present this QR code at the entry checkpost. Valid for one-time entry only.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
