import { useState } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

interface Props {
    destinationId: string;
    recommendation: {
        status: string;
        capacityPercentage: number;
        reason: string;
        alertLevel: string;
    };
    baseCapacity: number;
    currentEffectiveCapacity: number;
    onUpdate: () => void;
}

export default function CapacityControlPanel({ destinationId, recommendation, baseCapacity, currentEffectiveCapacity, onUpdate }: Props) {
    const [loading, setLoading] = useState(false);
    const [manualOverride, setManualOverride] = useState<number | null>(null);

    const recommendedCapacity = Math.round((baseCapacity * recommendation.capacityPercentage) / 100);
    const isCritical = recommendation.alertLevel === 'CRITICAL' || recommendation.alertLevel === 'HIGH';

    const handleApply = async (status: string, capacity: number) => {
        setLoading(true);
        try {
            await api.post('/capacity/decide', {
                destinationId,
                status,
                effectiveCapacity: capacity,
                notes: `Applied recommendation: ${recommendation.reason}`
            });
            toast.success('Capacity rules updated');
            onUpdate();
        } catch (error) {
            toast.error('Failed to update capacity');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <AlertTriangle className={`h-5 w-5 ${isCritical ? 'text-red-500' : 'text-yellow-500'}`} />
                AI Recommendation System
            </h3>

            <div className={`p-4 rounded-lg mb-4 ${isCritical ? 'bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900' : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900'}`}>
                <p className="font-semibold text-gray-900 dark:text-white mb-1">
                    System suggests: {recommendation.status} ({recommendation.capacityPercentage}%)
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{recommendation.reason}</p>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {recommendedCapacity} <span className="text-sm font-normal text-gray-500">visitors max</span>
                </div>
            </div>

            <div className="space-y-3">
                <button
                    onClick={() => handleApply(recommendation.status, recommendedCapacity)}
                    disabled={loading || currentEffectiveCapacity === recommendedCapacity}
                    className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {currentEffectiveCapacity === recommendedCapacity ? <CheckCircle className="h-4 w-4" /> : null}
                    {currentEffectiveCapacity === recommendedCapacity ? 'Recommendation Applied' : 'Accept Recommendation'}
                </button>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or set manually</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <input
                        type="number"
                        placeholder="Custom limit"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                        onChange={(e) => setManualOverride(parseInt(e.target.value))}
                    />
                    <button
                        onClick={() => manualOverride && handleApply('REDUCED', manualOverride)}
                        disabled={!manualOverride || loading}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 font-medium"
                    >
                        Set
                    </button>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Current Limit:</span>
                    <span className="font-bold text-gray-900 dark:text-white">{currentEffectiveCapacity} visitors</span>
                </div>
            </div>
        </div>
    );
}
