import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

export interface PricingRule {
    id?: string;
    destinationId: string;
    ruleName: string;
    basePrice: number;
    peakMultiplier: number;
    offPeakMultiplier: number;
    adultPrice?: number;
    childPrice?: number;
    localPrice?: number;
    foreignPrice?: number;
    applicableDays: number[];
    startDate?: string;
    endDate?: string;
    priority: number;
    isActive: boolean;
}

interface PricingRuleFormProps {
    destinationId: string;
    existingRule?: PricingRule | null;
    onSave: (rule: Partial<PricingRule>) => Promise<void>;
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

export default function PricingRuleForm({ destinationId, existingRule, onSave, onCancel }: PricingRuleFormProps) {
    const [formData, setFormData] = useState<Partial<PricingRule>>({
        destinationId,
        ruleName: '',
        basePrice: 0,
        peakMultiplier: 1.0,
        offPeakMultiplier: 1.0,
        applicableDays: [],
        priority: 0,
        isActive: true,
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
                    {existingRule ? 'Edit Pricing Rule' : 'Create Pricing Rule'}
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
                            placeholder="e.g. Peak Summer Pricing"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (Standard)</label>
                        <input
                            type="number"
                            required
                            min="0"
                            value={formData.basePrice}
                            onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                </div>

                {/* Priority & Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Priority
                            <span className="text-xs text-gray-500 ml-2">(Higher overwrites lower)</span>
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

                {/* Multipliers */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Dynamic Multipliers</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Peak Multiplier</label>
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                value={formData.peakMultiplier}
                                onChange={(e) => setFormData({ ...formData, peakMultiplier: parseFloat(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">Multiplies price during high demand.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Off-Peak Multiplier</label>
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                value={formData.offPeakMultiplier}
                                onChange={(e) => setFormData({ ...formData, offPeakMultiplier: parseFloat(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">Discounts price during low demand.</p>
                        </div>
                    </div>
                </div>

                {/* Category Prices */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Category Specific Pricing (Optional)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Adult</label>
                            <input
                                type="number"
                                min="0"
                                value={formData.adultPrice || ''}
                                onChange={(e) => setFormData({ ...formData, adultPrice: parseFloat(e.target.value) })}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                                placeholder="Default"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Child</label>
                            <input
                                type="number"
                                min="0"
                                value={formData.childPrice || ''}
                                onChange={(e) => setFormData({ ...formData, childPrice: parseFloat(e.target.value) })}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                                placeholder="Default"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Local</label>
                            <input
                                type="number"
                                min="0"
                                value={formData.localPrice || ''}
                                onChange={(e) => setFormData({ ...formData, localPrice: parseFloat(e.target.value) })}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                                placeholder="Default"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Foreign</label>
                            <input
                                type="number"
                                min="0"
                                value={formData.foreignPrice || ''}
                                onChange={(e) => setFormData({ ...formData, foreignPrice: parseFloat(e.target.value) })}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                                placeholder="Default"
                            />
                        </div>
                    </div>
                </div>

                {/* Date Validity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Valid From (Optional)</label>
                        <input
                            type="date"
                            value={formData.startDate || ''}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Valid To (Optional)</label>
                        <input
                            type="date"
                            value={formData.endDate || ''}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                </div>

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
