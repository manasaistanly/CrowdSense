import { WeatherData } from './WeatherService';
import { OperationalStatus } from '@prisma/client';

export interface Recommendation {
    status: OperationalStatus;
    capacityPercentage: number;
    reason: string;
    alertLevel: 'NORMAL' | 'MODERATE' | 'HIGH' | 'CRITICAL';
}

export class CapacityRecommendationEngine {

    /**
     * Calculates the recommended capacity based on weather metrics.
     */
    public static calculateRecommendation(weather: WeatherData): Recommendation {
        const { rainfallMm, windSpeedKmph, visibilityMeters } = weather;

        let status: OperationalStatus = 'NORMAL';
        let capacityPercentage = 100;
        let reasons: string[] = [];
        let alertLevel: 'NORMAL' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'NORMAL';

        // 1. Rainfall Checks
        if (rainfallMm > 50) {
            status = 'CLOSED';
            capacityPercentage = 0;
            reasons.push(`Extreme rainfall (${rainfallMm}mm/hr) detected.`);
            alertLevel = 'CRITICAL';
        } else if (rainfallMm > 25) {
            status = 'REDUCED';
            capacityPercentage = Math.min(capacityPercentage, 60);
            reasons.push(`Heavy rainfall (${rainfallMm}mm/hr) - Reducing capacity to 60%.`);
            alertLevel = 'HIGH';
        } else if (rainfallMm > 10) {
            status = 'REDUCED';
            capacityPercentage = Math.min(capacityPercentage, 80);
            reasons.push(`Moderate rainfall (${rainfallMm}mm/hr).`);
            if (alertLevel === 'NORMAL') alertLevel = 'MODERATE';
        }

        // 2. Wind Checks
        if (windSpeedKmph > 70) {
            status = 'CLOSED';
            capacityPercentage = 0;
            reasons.push(`Dangerous wind speeds (${windSpeedKmph} km/h).`);
            alertLevel = 'CRITICAL';
        } else if (windSpeedKmph > 45) {
            status = 'REDUCED';
            capacityPercentage = Math.min(capacityPercentage, 50);
            reasons.push(`High winds (${windSpeedKmph} km/h) - Limit view points.`);
            alertLevel = 'HIGH';
        }

        // 3. Visibility Checks
        if (visibilityMeters < 50) {
            status = 'CLOSED';
            capacityPercentage = 0;
            reasons.push(`Zero visibility (${visibilityMeters}m).`);
            alertLevel = 'CRITICAL';
        } else if (visibilityMeters < 500) {
            status = 'REDUCED';
            capacityPercentage = Math.min(capacityPercentage, 70);
            reasons.push(`Poor visibility (${visibilityMeters}m).`);
            if (alertLevel === 'NORMAL' || alertLevel === 'MODERATE') alertLevel = 'HIGH';
        }

        if (reasons.length === 0) {
            return {
                status: 'NORMAL',
                capacityPercentage: 100,
                reason: 'Conditions are optimal.',
                alertLevel: 'NORMAL'
            };
        }

        return {
            status,
            capacityPercentage,
            reason: reasons.join(' '),
            alertLevel
        };
    }
}
