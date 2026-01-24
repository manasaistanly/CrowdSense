import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2, Calendar, Clock, AlertTriangle } from 'lucide-react';
import api from '../lib/api';
import CapacityRuleForm, { CapacityRule } from '../components/admin/CapacityRuleForm';
import { useAuth } from '../stores/authStore';
import toast from 'react-hot-toast';

interface DestinationSimple {
    id: string;
    name: string;
    maxDailyCapacity: number;
}

export default function CapacityRulesPage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    // State
    const [destinations, setDestinations] = useState<DestinationSimple[]>([]);
    const [selectedDestinationId, setSelectedDestinationId] = useState<string>('');
    const [rules, setRules] = useState<CapacityRule[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<CapacityRule | null>(null);

    // Initial Fetch
    useEffect(() => {
        if (!user || user.role === 'TOURIST') {
            navigate('/');
            return;
        }
        fetchDestinations();
    }, [user, navigate]);

    // Fetch Rules when destination changes
    useEffect(() => {
        if (selectedDestinationId) {
            fetchRules(selectedDestinationId);
        } else {
            setRules([]);
        }
    }, [selectedDestinationId]);

    const fetchDestinations = async () => {
        try {
            setLoading(true);
            const res = await api.get('/destinations');
            const dests = res.data.data.destinations;
            setDestinations(dests);

            // Default to first destination if available
            if (dests.length > 0) {
                setSelectedDestinationId(dests[0].id);
            }
        } catch (error) {
            toast.error('Failed to load destinations');
        } finally {
            setLoading(false);
        }
    };

    const fetchRules = async (destinationId: string) => {
        try {
            const res = await api.get(`/capacity/rules/destinations/${destinationId}`);
            setRules(res.data.data);
        } catch (error) {
            toast.error('Failed to load capacity rules');
        }
    };

    const handleSaveRule = async (ruleData: Partial<CapacityRule>) => {
        try {
            if (editingRule) {
                // Update
                const res = await api.put(`/capacity/rules/${editingRule.id}`, ruleData);
                setRules(rules.map(r => r.id === editingRule.id ? res.data.data : r));
                toast.success('Rule updated successfully');
            } else {
                // Create
                const res = await api.post('/capacity/rules', {
                    ...ruleData,
                    destinationId: selectedDestinationId
                });
                setRules([res.data.data, ...rules]); // Add to top
                toast.success('Rule created successfully');
            }
            setIsFormOpen(false);
            setEditingRule(null);
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.error?.message || 'Failed to save rule';
            throw new Error(msg); // Form handles the error display
        }
    };

    const handleDeleteRule = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this rule?')) return;

        try {
            await api.delete(`/capacity/rules/${id}`);
            setRules(rules.filter(r => r.id !== id));
            toast.success('Rule deleted');
        } catch (error) {
            toast.error('Failed to delete rule');
        }
    };

    const getRuleTypeColor = (type: string) => {
        switch (type) {
            case 'SEASONAL': return 'bg-green-100 text-green-700';
            case 'EVENT_BASED': return 'bg-purple-100 text-purple-700';
            case 'TIME_OF_DAY': return 'bg-blue-100 text-blue-700';
            case 'WEATHER_BASED': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-gray-100 text-gray-700';
        }
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
                            <h1 className="text-2xl font-bold text-gray-900">Capacity Rules</h1>
                            <p className="text-gray-500">Manage dynamic capacity adjustments.</p>
                        </div>
                    </div>

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
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : (
                    <>
                        {isFormOpen ? (
                            <CapacityRuleForm
                                destinationId={selectedDestinationId}
                                existingRule={editingRule}
                                onSave={handleSaveRule}
                                onCancel={() => {
                                    setIsFormOpen(false);
                                    setEditingRule(null);
                                }}
                            />
                        ) : (
                            <div className="space-y-6">
                                {/* Rule List */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                                        <h2 className="font-bold text-gray-900">Active Rules</h2>
                                        <button
                                            onClick={() => setIsFormOpen(true)}
                                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium flex items-center gap-2 shadow-sm transition"
                                        >
                                            <Plus className="h-4 w-4" /> Add Rule
                                        </button>
                                    </div>

                                    {rules.length === 0 ? (
                                        <div className="p-12 text-center text-gray-500">
                                            <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                                            <p className="text-lg font-medium">No rules defined</p>
                                            <p className="text-sm">Create a rule to dynamically adjust capacity.</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-200">
                                            {rules.map((rule) => (
                                                <div key={rule.id} className={`p-6 hover:bg-gray-50 transition ${!rule.isActive ? 'opacity-60 bg-gray-50' : ''}`}>
                                                    <div className="flex flex-col md:flex-row justify-between gap-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <h3 className="text-lg font-bold text-gray-900">{rule.ruleName}</h3>
                                                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${getRuleTypeColor(rule.ruleType)}`}>
                                                                    {rule.ruleType.replace('_', ' ')}
                                                                </span>
                                                                {!rule.isActive && (
                                                                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-gray-200 text-gray-600">INACTIVE</span>
                                                                )}
                                                            </div>

                                                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                                                {(rule.startDate || rule.endDate) && (
                                                                    <div className="flex items-center gap-1">
                                                                        <Calendar className="h-4 w-4 text-gray-400" />
                                                                        <span>
                                                                            {rule.startDate ? new Date(rule.startDate).toLocaleDateString() : 'Start'}
                                                                            {' - '}
                                                                            {rule.endDate ? new Date(rule.endDate).toLocaleDateString() : 'Indefinite'}
                                                                        </span>
                                                                    </div>
                                                                )}

                                                                {(rule.startTime || rule.endTime) && (
                                                                    <div className="flex items-center gap-1">
                                                                        <Clock className="h-4 w-4 text-gray-400" />
                                                                        <span>
                                                                            {rule.startTime || '00:00'} - {rule.endTime || '23:59'}
                                                                        </span>
                                                                    </div>
                                                                )}

                                                                {rule.capacityPercentage !== undefined && (
                                                                    <div className="flex items-center gap-1 font-medium text-gray-900">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div>
                                                                        Capacity: {rule.capacityPercentage}%
                                                                    </div>
                                                                )}

                                                                {rule.absoluteCapacity !== undefined && (
                                                                    <div className="flex items-center gap-1 font-medium text-purple-700">
                                                                        <AlertTriangle className="h-4 w-4" />
                                                                        Fixed Cap: {rule.absoluteCapacity}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setEditingRule(rule);
                                                                    setIsFormOpen(true);
                                                                }}
                                                                className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"
                                                                title="Edit"
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteRule(rule.id!)}
                                                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
