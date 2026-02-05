import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MapPin, Users } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import AdminNavbar from '../components/admin/AdminNavbar';

interface Destination {
    id: string;
    name: string;
    slug: string;
    locationAddress: string;
    maxDailyCapacity: number;
    currentCapacity: number;
    status: string;
    destinationType: string;
}

export default function AdminDestinationsPage() {
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDestinations();
    }, []);

    const fetchDestinations = async () => {
        try {
            const response = await api.get('/destinations');
            setDestinations(response.data.data.destinations);
        } catch (error) {
            toast.error('Failed to load destinations');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
            return;
        }

        try {
            await api.delete(`/destinations/${id}`);
            setDestinations(destinations.filter((d) => d.id !== id));
            toast.success('Destination deleted successfully');
        } catch (error) {
            toast.error('Failed to delete destination');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-success-100 text-success-700';
            case 'MAINTENANCE': return 'bg-warning-100 text-warning-700';
            case 'DEACTIVATED': return 'bg-danger-100 text-danger-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <AdminNavbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Manage Destinations</h1>
                        <p className="text-gray-600 mt-1">Add, edit, or remove destinations.</p>
                    </div>
                    <button
                        onClick={() => toast.success('Add Destination feature coming soon!')}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2 shadow-sm font-medium"
                    >
                        <Plus className="h-4 w-4" /> Add New
                    </button>
                </div>

                {/* List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading destinations...</div>
                    ) : destinations.length === 0 ? (
                        <div className="p-12 text-center">
                            <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600 text-lg">No destinations found.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Name</th>
                                        <th className="px-6 py-4 font-semibold">Location</th>
                                        <th className="px-6 py-4 font-semibold">Type</th>
                                        <th className="px-6 py-4 font-semibold">Capacity</th>
                                        <th className="px-6 py-4 font-semibold">Status</th>
                                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {destinations.map((destination) => (
                                        <tr key={destination.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-gray-900">{destination.name}</div>
                                                <div className="text-xs text-gray-500">/{destination.slug}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                                                {destination.locationAddress}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <span className="capitalize">{destination.destinationType.replace(/_/g, ' ').toLowerCase()}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <div className="flex items-center gap-1">
                                                    <Users className="h-4 w-4 text-gray-400" />
                                                    {destination.maxDailyCapacity}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(destination.status)}`}>
                                                    {destination.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => toast.success('Edit feature coming in Phase 2')}
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(destination.id, destination.name)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
