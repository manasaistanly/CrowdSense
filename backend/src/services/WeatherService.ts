// import { PrismaClient } from '@prisma/client';
import { prisma } from '../config/database';

export interface WeatherData {
    condition: string; // 'Sunny', 'Rainy', 'Cloudy', 'Stormy'
    temperature: number;
    rainfallMm: number;
    windSpeedKmph: number;
    visibilityMeters: number;
    timestamp: Date;
}

export class WeatherService {
    private static instance: WeatherService;

    private constructor() { }

    public static getInstance(): WeatherService {
        if (!WeatherService.instance) {
            WeatherService.instance = new WeatherService();
        }
        return WeatherService.instance;
    }

    /**
     * Simulates fetching live weather data for a destination.
     * In a real app, this would call an external API (OpenWeatherMap, etc.).
     */
    public async getCurrentWeather(destinationId: string): Promise<WeatherData> {
        // Mock logic: Deterministic but varying based on time or random for now.
        // For demo purposes, we can randomise it or set it based on a "simulation mode" flag (not implemented yet).

        // Randomly generate weather to demonstrate the system
        const rand = Math.random();

        let condition = 'Sunny';
        let rainfall = 0;
        let wind = 10 + Math.random() * 10;
        let visibility = 10000;
        let temp = 20 + Math.random() * 5;

        // 20% chance of rain
        if (rand < 0.2) {
            condition = 'Rainy';
            rainfall = 5 + Math.random() * 45; // 5 to 50 mm
            visibility = 2000 + Math.random() * 3000;
            temp -= 5;
        }
        // 5% chance of storm
        else if (rand < 0.25) {
            condition = 'Stormy';
            rainfall = 50 + Math.random() * 50; // 50 to 100 mm - HEAVY RAIN
            wind = 50 + Math.random() * 30; // 50 to 80 kmph - HIGH WIND
            visibility = 500 + Math.random() * 1000;
        }

        const weatherData: WeatherData = {
            condition,
            temperature: parseFloat(temp.toFixed(1)),
            rainfallMm: parseFloat(rainfall.toFixed(1)),
            windSpeedKmph: parseFloat(wind.toFixed(1)),
            visibilityMeters: parseFloat(visibility.toFixed(1)),
            timestamp: new Date()
        };

        // Log to database
        await this.logWeatherData(destinationId, weatherData);

        return weatherData;
    }

    private async logWeatherData(destinationId: string, data: WeatherData) {
        try {
            await prisma.weatherLog.create({
                data: {
                    destinationId,
                    condition: data.condition,
                    temperature: data.temperature,
                    rainfallMm: data.rainfallMm,
                    windSpeedKmph: data.windSpeedKmph,
                    visibilityMeters: data.visibilityMeters,
                    timestamp: data.timestamp
                }
            });
        } catch (error) {
            console.error('Failed to log weather data:', error);
            // Don't fail the request if logging fails
        }
    }
}
