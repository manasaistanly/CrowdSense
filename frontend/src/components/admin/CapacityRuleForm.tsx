import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

export interface CapacityRule {
    id?: string;
    destinationId: string;
    ruleName: string;
    ruleType: 'SEASONAL' | 'WEATHER_BASED' | 'EVENT_BASED' | 'TIME_OF_DAY' | 'CUSTOM';
    applicableDays: number[];
    startTime?: string;
    endTime?: string;
    startDate?: string;
    endDate?: string;
    capacityPercentage?: number;
    absoluteCapacity?: number;
    priority: number;
    isActive: boolean;
}

interface CapacityRuleFormProps {
    destinationId: string;
    existingRule?: CapacityRule | null;
    onSave: (rule: Partial<CapacityRule>) => Promise<void>;
    onCancel: () => void;
}

const DAYS = [
    { label: 'Sun', value: 0 },
    { label: 'Mon', value: 1 },
    { label: 'Tue', value: 2 },
    { label: 'Wed', value: 3 },
    { label: 'Thu', value: 4 },
    { label: 'Fri', value: 5 },
    { label: 'Sat', value: 6 },
];

const RULE_TYPES = [
    { label: 'Seasonal', value: 'SEASONAL' },
    { label: 'Event Based', value: 'EVENT_BASED' },
    { label: 'Time of Day', value: 'TIME_OF_DAY' },
    { label: 'Weather Based', value: 'WEATHER_BASED' },
    { label: 'Custom', value: 'CUSTOM' },
];

export default function CapacityRuleForm({ destinationId, existingRule, onSave, onCancel }: CapacityRuleFormProps) {
    const [formData, setFormData] = useState<Partial<CapacityRule>>({
        destinationId,
        ruleName: '',
        ruleType: 'SEASONAL',
        applicableDays: [],
        priority: 1,
        isActive: true,
        capacityPercentage: 100,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (existingRule) {
            setFormData({
                ...existingRule,
                startDate: existingRule.startDate ? new Date(existingRule.startDate).toISOString().split('T')[0] : undefined,
                endDate: existingRule.endDate ? new Date(existingRule.endDate).toISOString().split('T')[0] : undefined,
            });
        }
    }, [existingRule]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await onSave(formData);
        } catch (err: any) {
            setError(err.message || 'Failed to save rule');
        } finally {
            setLoading(false);
        }
    };

    const toggleDay = (day: number) => {
        const currentDays = formData.applicableDays || [];
        if (currentDays.includes(day)) {
            setFormData({ ...formData, applicableDays: currentDays.filter(d => d !== day) });
        } else {
            setFormData({ ...formData, applicableDays: [...currentDays, day].sort() });
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                    {existingRule ? 'Edit Capacity Rule' : 'Create New Rule'}
                </h2>
                <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
                    <X className="h-6 w-6" />
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rule Name</label>
                        <input
                            type="text"
                            required
                            value={formData.ruleName}
                            onChange={(e) => setFormData({ ...formData, ruleName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                            placeholder="e.g., Summer Peak Weekend"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rule Type</label>
                        <select
                            value={formData.ruleType}
                            onChange={(e) => setFormData({ ...formData, ruleType: e.target.value as any })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        >
                            {RULE_TYPES.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Priority & Active Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Priority
                            <span className="text-xs text-gray-500 ml-2">(Higher applies first)</span>
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                    <div className="flex items-center h-full pt-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                            />
                            <span className="text-sm font-medium text-gray-700">Rule is Active</span>
                        </label>
                    </div>
                </div>

                {/* Conditional Fields based on Type */}
                {(formData.ruleType === 'SEASONAL' || formData.ruleType === 'EVENT_BASED' || formData.ruleType === 'CUSTOM') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <input
                                type="date"
                                value={formData.startDate || ''}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <input
                                type="date"
                                value={formData.endDate || ''}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                    </div>
                )}

                {(formData.ruleType === 'TIME_OF_DAY' || formData.ruleType === 'CUSTOM') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                            <input
                                type="time"
                                value={formData.startTime || ''}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                            <input
                                type="time"
                                value={formData.endTime || ''}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                    </div>
                )}

                {/* Days of Week */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Applicable Days</label>
                    <div className="flex flex-wrap gap-2">
                        {DAYS.map((day) => {
                            const isSelected = formData.applicableDays?.includes(day.value);
                            return (
                                <button
                                    key={day.value}
                                    type="button"
                                    onClick={() => toggleDay(day.value)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${isSelected
                                            ? 'bg-primary-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {day.label}
                                </button>
                            );
                        })}
                    </div>
                    {(!formData.applicableDays || formData.applicableDays.length === 0) && (
                        <p className="text-xs text-gray-500 mt-1">Select at least one day (or all will apply by default depending on logic)</p>
                    )}
                </div>

                {/* Capacity Settings */}
                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Capacity Impact</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Capacity Adjustment (%)
                                <span className="text-xs text-gray-500 ml-2">(100% = No Change)</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="500"
                                value={formData.capacityPercentage || ''}
                                onChange={(e) => setFormData({ ...formData, capacityPercentage: parseFloat(e.target.value), absoluteCapacity: undefined })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                placeholder="e.g. 120 for 20% increase"
                            />
                            <p className="text-xs text-gray-500 mt-1">Multiplies the base capacity.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                OR Absolute Capacity
                                <span className="text-xs text-gray-500 ml-2">(Overrides % if set)</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.absoluteCapacity || ''}
                                onChange={(e) => setFormData({ ...formData, absoluteCapacity: parseInt(e.target.value), capacityPercentage: undefined })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                placeholder="e.g. 500 Visitors"
                            />
                            <p className="text-xs text-gray-500 mt-1">Sets a hard limit.</p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium flex items-center gap-2"
                    >
                        {loading ? 'Saving...' : (
                            <>
                                <Save className="h-4 w-4" /> Save Rule
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
