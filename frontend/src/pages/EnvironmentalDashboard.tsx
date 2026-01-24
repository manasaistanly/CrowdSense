import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Leaf,
    Wind,
    Trash,
    Zap,
    Droplets,
    Plus,
    Save,
    X,
    AlertTriangle,
    Download
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import api from '../lib/api';
import { useAuth } from '../stores/authStore';
import toast from 'react-hot-toast';

// Types match backend
type MetricType =
    | 'AIR_QUALITY_INDEX'
    | 'CARBON_FOOTPRINT'
    | 'WASTE_GENERATED'
    | 'WATER_QUALITY'
    | 'NOISE_LEVEL'
    | 'ENERGY_CONSUMPTION'
    | 'BIODIVERSITY_INDEX';

interface EnvironmentalMetric {
    id: string;
    metricType: MetricType;
    value: number;
    unit: string;
    metricDate: string;
    notes?: string;
    recordedBy?: {
        firstName: string;
        lastName: string;
    };
}

interface DestinationSimple {
    id: string;
    name: string;
}

const METRIC_CONFIG: Record<MetricType, { label: string; icon: any; color: string; unit: string; maxSafe?: number }> = {
    AIR_QUALITY_INDEX: { label: 'Air Quality (AQI)', icon: Wind, color: '#10b981', unit: '', maxSafe: 100 },
    CARBON_FOOTPRINT: { label: 'Carbon Footprint', icon: Leaf, color: '#f59e0b', unit: 'kg CO2e', maxSafe: 1000 },
    WASTE_GENERATED: { label: 'Waste Generated', icon: Trash, color: '#ef4444', unit: 'kg', maxSafe: 500 },
    WATER_QUALITY: { label: 'Water Quality (pH)', icon: Droplets, color: '#3b82f6', unit: 'pH' },
    NOISE_LEVEL: { label: 'Noise Level', icon: Zap, color: '#8b5cf6', unit: 'dB', maxSafe: 70 },
    ENERGY_CONSUMPTION: { label: 'Energy Usage', icon: Zap, color: '#eab308', unit: 'kWh' },
    BIODIVERSITY_INDEX: { label: 'Biodiversity', icon: Leaf, color: '#22c55e', unit: 'Idx' },
};

export default function EnvironmentalDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [destinations, setDestinations] = useState<DestinationSimple[]>([]);
    const [selectedDestinationId, setSelectedDestinationId] = useState<string>('');
    const [summary, setSummary] = useState<EnvironmentalMetric[]>([]);
    const [history, setHistory] = useState<EnvironmentalMetric[]>([]);
    const [selectedMetricType, setSelectedMetricType] = useState<MetricType>('AIR_QUALITY_INDEX');

    // Form State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({
        metricType: 'AIR_QUALITY_INDEX' as MetricType,
        value: '',
        notes: '',
        metricDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (!user || user.role === 'TOURIST') {
            navigate('/');
            return;
        }
        fetchDestinations();
    }, [user, navigate]);

    useEffect(() => {
        if (selectedDestinationId) {
            fetchData(selectedDestinationId);
        }
    }, [selectedDestinationId]);

    // Fetch history when metric type changes
    useEffect(() => {
        if (selectedDestinationId) {
            fetchHistory(selectedDestinationId, selectedMetricType);
        }
    }, [selectedDestinationId, selectedMetricType]);

    const fetchDestinations = async () => {
        try {
            const res = await api.get('/destinations');
            const dests = res.data.data.destinations;
            setDestinations(dests);
            if (dests.length > 0) setSelectedDestinationId(dests[0].id);
        } catch (error) {
            toast.error('Failed to load destinations');
        }
    };

    const fetchData = async (id: string) => {
        try {
            const res = await api.get(`/environmental/summary/${id}`);
            setSummary(res.data.data);
            await fetchHistory(id, selectedMetricType);
        } catch (error) {
            toast.error('Failed to load dashboard data');
        }
    };

    const handleDownloadReport = async () => {
        try {
            const response = await api.get('/reports/environmental', {
                responseType: 'blob', // Important for PDF download
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'environmental-report.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            toast.error('Failed to download report');
        }
    };

    const fetchHistory = async (id: string, type: MetricType) => {
        try {
            const res = await api.get(`/environmental/history/${id}?type=${type}&limit=30`);
            // Reverse for chart (oldest first)
            setHistory(res.data.data.reverse());
        } catch (error) {
            console.error('Failed to load history');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/environmental', {
                destinationId: selectedDestinationId,
                metricType: formData.metricType,
                value: Number(formData.value),
                metricDate: new Date(formData.metricDate).toISOString(),
                notes: formData.notes
            });
            toast.success('Metric recorded');
            setIsFormOpen(false);
            fetchData(selectedDestinationId); // Refresh
            setFormData({ ...formData, value: '', notes: '' });
        } catch (error) {
            toast.error('Failed to record metric');
        }
    };

    const getLatestValue = (type: MetricType) => {
        const found = summary.find(s => s.metricType === type);
        return found ? found.value : '-';
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/admin/dashboard')} className="p-2 hover:bg-gray-200 rounded-full transition">
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Environmental Impact</h1>
                            <p className="text-gray-500">Monitor usage and sustainability metrics.</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                            <span className="text-sm font-medium text-gray-500 pl-2">Destination:</span>
                            <select
                                value={selectedDestinationId}
                                onChange={(e) => setSelectedDestinationId(e.target.value)}
                                className="bg-transparent font-medium text-gray-900 focus:outline-none cursor-pointer"
                            >
                                {destinations.map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={handleDownloadReport}
                                className="bg-white text-gray-700 px-4 py-2 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition flex items-center gap-2"
                            >
                                <Download className="h-4 w-4" />
                                Download Report
                            </button>
                            <button
                                onClick={() => setIsFormOpen(true)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2 shadow-sm"
                            >
                                <Plus className="h-4 w-4" /> Add Metric
                            </button>
                        </div>
                    </div>
                </div>

                {/* Scorecards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {(Object.keys(METRIC_CONFIG) as MetricType[]).slice(0, 4).map((type) => {
                        const config = METRIC_CONFIG[type];
                        const Icon = config.icon;
                        const latest = getLatestValue(type);
                        const isHigh = typeof latest === 'number' && config.maxSafe && latest > config.maxSafe;

                        return (
                            <div key={type} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-500">{config.label}</span>
                                    <Icon className="h-5 w-5" style={{ color: config.color }} />
                                </div>
                                <div className="flex items-end gap-2">
                                    <span className="text-2xl font-bold text-gray-900">{latest}</span>
                                    <span className="text-xs text-gray-500 mb-1">{config.unit}</span>
                                </div>
                                {isHigh && (
                                    <div className="mt-2 flex items-center gap-1 text-xs text-red-600 font-medium">
                                        <AlertTriangle className="h-3 w-3" /> Exceeds Safe Limit
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Main Chart Section */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Historical Trends</h2>
                        <select
                            value={selectedMetricType}
                            onChange={(e) => setSelectedMetricType(e.target.value as any)}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-green-500 font-medium"
                        >
                            {Object.entries(METRIC_CONFIG).map(([key, cfg]) => (
                                <option key={key} value={key}>{cfg.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={history}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="metricDate"
                                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    stroke="#9ca3af"
                                    fontSize={12}
                                />
                                <YAxis stroke="#9ca3af" fontSize={12} />
                                <Tooltip
                                    labelFormatter={(val) => new Date(val).toLocaleDateString()}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    name={METRIC_CONFIG[selectedMetricType].label}
                                    stroke={METRIC_CONFIG[selectedMetricType].color}
                                    strokeWidth={2}
                                    dot={{ r: 4, fill: METRIC_CONFIG[selectedMetricType].color }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Add Metric Modal */}
                {isFormOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-900">Record Measurement</h3>
                                <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Metric Type</label>
                                    <select
                                        value={formData.metricType}
                                        onChange={(e) => setFormData({ ...formData, metricType: e.target.value as any })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500"
                                    >
                                        {Object.entries(METRIC_CONFIG).map(([key, cfg]) => (
                                            <option key={key} value={key}>{cfg.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Value ({METRIC_CONFIG[formData.metricType].unit})
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        step="0.01"
                                        value={formData.value}
                                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.metricDate}
                                        onChange={(e) => setFormData({ ...formData, metricDate: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500"
                                        rows={2}
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsFormOpen(false)}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
                                    >
                                        <Save className="h-4 w-4" /> Save Record
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
