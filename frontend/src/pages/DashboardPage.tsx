import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../stores/authStore';
import Navbar from '../components/Navbar';

interface Booking {
    id: string;
    bookingReference: string;
    visitDate: string;
    numberOfVisitors: number;
    totalPrice: number;
    status: string;
    destination: {
        name: string;
        slug: string;
    };
}

export default function DashboardPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        // Redirect admins to admin dashboard
        if (['SUPER_ADMIN', 'DESTINATION_ADMIN', 'STAFF'].includes(user.role)) {
            navigate('/admin/dashboard');
            return;
        }

        fetchBookings();
    }, [user, navigate]);

    const fetchBookings = async () => {
        try {
            const response = await api.get('/bookings/my-bookings');
            setBookings(response.data.data.bookings);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONFIRMED':
                return 'bg-success-100 text-success-700';
            case 'PENDING':
                return 'bg-warning-100 text-warning-700';
            case 'CANCELLED':
                return 'bg-gray-100 text-gray-700';
            case 'COMPLETED':
                return 'bg-primary-100 text-primary-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <Navbar />

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8 border border-gray-100 dark:border-gray-700 transition-colors">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Welcome back, {user.firstName}!
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Role: <span className="font-semibold text-primary-600 dark:text-primary-400">{user.role}</span>
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 transition-colors">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Bookings</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">{bookings.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                                <Calendar className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 transition-colors">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Upcoming Visits</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {bookings.filter((b) => b.status === 'CONFIRMED').length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center">
                                <MapPin className="h-6 w-6 text-success-600 dark:text-success-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 transition-colors">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completed</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {bookings.filter((b) => b.status === 'COMPLETED').length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-900/30 rounded-full flex items-center justify-center">
                                <Users className="h-6 w-6 text-secondary-600 dark:text-secondary-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bookings */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Bookings</h2>
                    </div>

                    {loading ? (
                        <div className="p-6">
                            <div className="animate-pulse space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                                ))}
                            </div>
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="p-12 text-center">
                            <Calendar className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">No bookings yet</p>
                            <Link
                                to="/destinations"
                                className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
                            >
                                Explore Destinations
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {bookings.map((booking) => (
                                <div key={booking.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    {booking.destination.name}
                                                </h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                                    {booking.status}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-sm text-gray-600 dark:text-gray-400">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>{new Date(booking.visitDate).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4" />
                                                    <span>{booking.numberOfVisitors} visitors</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">Ref:</span>
                                                    <span className="font-mono">{booking.bookingReference}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">Total:</span> ₹{booking.totalPrice}
                                                </div>
                                            </div>
                                        </div>

                                        <Link
                                            to={`/booking/${booking.id}`}
                                            className="w-full md:w-auto px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm font-medium text-center"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
