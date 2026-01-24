import { prisma } from '../config/database';
import { EnvironmentalMetricType } from '@prisma/client';

interface CreateMetricData {
    destinationId: string;
    metricType: EnvironmentalMetricType;
    value: number;
    unit?: string;
    metricDate?: Date;
    notes?: string;
    recordedById?: string;
}

export class EnvironmentalService {
    /**
     * Record a new environmental metric
     */
    async recordMetric(data: CreateMetricData) {
        // Check thresholds if defined in future config
        // For MVP, just record raw data

        return await prisma.environmentalMetric.create({
            data: {
                destinationId: data.destinationId,
                metricType: data.metricType,
                value: data.value,
                unit: data.unit || this.getDefaultUnit(data.metricType),
                metricDate: data.metricDate || new Date(),
                notes: data.notes,
                recordedById: data.recordedById,
            },
        });
    }

    /**
     * Get metrics for a destination
     */
    async getMetrics(destinationId: string, type?: EnvironmentalMetricType, limit = 30) {
        const where: any = { destinationId };
        if (type) where.metricType = type;

        return await prisma.environmentalMetric.findMany({
            where,
            orderBy: { metricDate: 'desc' },
            take: limit,
            include: {
                recordedBy: {
                    select: {
                        firstName: true,
                        lastName: true,
                    }
                }
            }
        });
    }

    /**
     * Get dashboard summary (latest values for each type)
     */
    async getDashboardSummary(destinationId: string) {
        // Get distinct metric types recorded for this destination
        // Since Prisma doesn't support distinct on specific columns easily with include/orderBy in generic way,
        // we might query types first or just get recent history and aggregate in memory for MVP.

        // Let's get the latest 50 records and group
        const recentMetrics = await prisma.environmentalMetric.findMany({
            where: { destinationId },
            orderBy: { metricDate: 'desc' },
            take: 100,
        });

        const summary = new Map();

        for (const metric of recentMetrics) {
            if (!summary.has(metric.metricType)) {
                summary.set(metric.metricType, metric);
            }
        }

        return Array.from(summary.values());
    }

    private getDefaultUnit(type: EnvironmentalMetricType): string {
        switch (type) {
            case 'AIR_QUALITY_INDEX': return 'AQI';
            case 'CARBON_FOOTPRINT': return 'kg CO2e';
            case 'WASTE_GENERATED': return 'kg';
            case 'WATER_QUALITY': return 'pH';
            case 'NOISE_LEVEL': return 'dB';
            case 'ENERGY_CONSUMPTION': return 'kWh';
            default: return '';
        }
    }
}

export const environmentalService = new EnvironmentalService();
