import { Cloud, CloudRain, Sun, Wind, Droplets, Eye } from 'lucide-react';

interface WeatherData {
    condition: string;
    temperature: number;
    rainfallMm: number;
    windSpeedKmph: number;
    visibilityMeters: number;
    timestamp?: string;
}

interface WeatherWidgetProps {
    weather: WeatherData;
}

export default function WeatherWidget({ weather }: WeatherWidgetProps) {
    const getWeatherIcon = (condition: string) => {
        const c = condition.toLowerCase();
        if (c.includes('rain')) return <CloudRain className="h-8 w-8 text-blue-500" />;
        if (c.includes('cloud')) return <Cloud className="h-8 w-8 text-gray-500" />;
        if (c.includes('wind') || c.includes('storm')) return <Wind className="h-8 w-8 text-gray-600" />;
        // Default sunny
        return <Sun className="h-8 w-8 text-yellow-500" />;
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    {getWeatherIcon(weather.condition)}
                    <span>Current Conditions</span>
                </h3>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{weather.temperature}°C</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Droplets className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Rainfall</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{weather.rainfallMm} mm</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <Wind className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Wind</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{weather.windSpeedKmph} km/h</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg col-span-2">
                    <Eye className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Visibility</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{weather.visibilityMeters} m</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
