
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface VisitorTrendsChartProps {
    data: {
        labels: string[];
        visitors: number[];
        revenue: number[];
    };
}

export default function VisitorTrendsChart({ data }: VisitorTrendsChartProps) {
    if (!data || !data.labels || data.labels.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center text-gray-400">
                No data available
            </div>
        );
    }

    // Transform data for Recharts
    const chartData = data.labels.map((label, index) => ({
        date: new Date(label).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        visitors: data.visitors[index],
        revenue: data.revenue[index],
    }));

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        yAxisId="left"
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `₹${value}`}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        cursor={{ fill: '#F3F4F6' }}
                    />
                    <Legend />
                    <Bar
                        yAxisId="left"
                        dataKey="visitors"
                        name="Visitors"
                        fill="#059669"
                        radius={[4, 4, 0, 0]}
                        barSize={30}
                    />
                    <Bar
                        yAxisId="right"
                        dataKey="revenue"
                        name="Revenue"
                        fill="#0EA5E9"
                        radius={[4, 4, 0, 0]}
                        barSize={30}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
