
import { prisma } from '../config/database';

export class AnalyticsService {
    /**
     * Get visitor trends for a destination (or all) over a period
     */
    async getVisitorTrends(destinationId: string | undefined, period: 'week' | 'month' | 'year' = 'month') {
        const endDate = new Date();
        const startDate = new Date();

        if (period === 'week') startDate.setDate(startDate.getDate() - 7);
        else if (period === 'month') startDate.setMonth(startDate.getMonth() - 1);
        else if (period === 'year') startDate.setFullYear(startDate.getFullYear() - 1);

        const where: any = {
            visitDate: {
                gte: startDate,
                lte: endDate,
            },
            status: {
                in: ['CONFIRMED', 'CHECKED_IN', 'COMPLETED'],
            },
        };

        if (destinationId) {
            where.destinationId = destinationId;
        }

        // Group bookings by date
        const bookings = await prisma.booking.findMany({
            where,
            select: {
                visitDate: true,
                numberOfVisitors: true,
                totalPrice: true,
            },
            orderBy: {
                visitDate: 'asc',
            },
        });

        // Group by day
        const groupedData = new Map<string, { visitors: number; revenue: number }>();

        bookings.forEach(booking => {
            const dateStr = booking.visitDate.toISOString().split('T')[0];
            const current = groupedData.get(dateStr) || { visitors: 0, revenue: 0 };

            groupedData.set(dateStr, {
                visitors: current.visitors + booking.numberOfVisitors,
                revenue: current.revenue + Number(booking.totalPrice),
            });
        });

        // Format for chart
        const labels: string[] = [];
        const visitors: number[] = [];
        const revenue: number[] = [];

        // Fill in missing dates
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const data = groupedData.get(dateStr) || { visitors: 0, revenue: 0 };

            labels.push(dateStr);
            visitors.push(data.visitors);
            revenue.push(data.revenue);
        }

        return { labels, visitors, revenue };
    }

    /**
     * Get high-level stats for the dashboard
     */
    async getDashboardStats(destinationId?: string) {
        const where = destinationId ? { destinationId } : {};

        // Total Visitors (All time)
        const visitorsAgg = await prisma.booking.aggregate({
            where: {
                ...where,
                status: { in: ['CONFIRMED', 'CHECKED_IN', 'COMPLETED'] },
            },
            _sum: { numberOfVisitors: true },
        });

        // Total Revenue
        const revenueAgg = await prisma.booking.aggregate({
            where: {
                ...where,
                status: { in: ['CONFIRMED', 'CHECKED_IN', 'COMPLETED'] },
            },
            _sum: { totalPrice: true },
        });

        // Today's Check-ins
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayCheckins = await prisma.booking.count({
            where: {
                ...where,
                entryTime: {
                    gte: today,
                    lt: tomorrow,
                },
            },
        });

        // Pending Bookings
        const pendingBookings = await prisma.booking.count({
            where: {
                ...where,
                status: 'PENDING',
            },
        });

        return {
            totalVisitors: visitorsAgg._sum.numberOfVisitors || 0,
            totalRevenue: Number(revenueAgg._sum.totalPrice || 0),
            todayCheckins,
            pendingBookings,
        };
    }
}

export const analyticsService = new AnalyticsService();
