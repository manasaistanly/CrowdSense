import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { capacityService } from './capacity.service';

export class DestinationService {
    /**
     * Get all destinations with optional filtering
     */
    async getDestinations(params: {
        page?: number;
        limit?: number;
        type?: string;
        status?: string;
        search?: string;
        sortBy?: string;
    }) {
        const {
            page = 1,
            limit = 20,
            type,
            status,
            search,
            sortBy = 'name',
        } = params;

        const skip = (page - 1) * limit;

        // Build where clause
        const where: Prisma.DestinationWhereInput = {};

        if (type) {
            where.destinationType = type as any;
        }

        if (status) {
            where.status = status as any;
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { locationAddress: { contains: search, mode: 'insensitive' } },
            ];
        }

        // Validate sortBy to prevent errors
        const validSortFields = ['name', 'createdAt', 'destinationType', 'status'];
        const safeSortBy = validSortFields.includes(sortBy) ? sortBy : 'name';

        // Get total count
        const total = await prisma.destination.count({ where });

        // Get destinations
        const destinations = await prisma.destination.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [safeSortBy]: 'asc' },
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                locationAddress: true,
                latitude: true,
                longitude: true,
                destinationType: true,
                maxDailyCapacity: true,
                currentCapacity: true,
                status: true,
                images: true,
                amenities: true,
                openingTime: true,
                closingTime: true,
                createdAt: true,
            },
        });

        return {
            destinations,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get destination by ID or slug
     */
    async getDestinationById(idOrSlug: string) {
        const destination = await prisma.destination.findFirst({
            where: {
                OR: [
                    { id: idOrSlug },
                    { slug: idOrSlug },
                ],
            },
            include: {
                zones: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        maxCapacity: true,
                        currentCapacity: true,
                        zoneType: true,
                        isRestricted: true,
                        requiresGuide: true,
                    },
                },
                pricingRules: {
                    where: { isActive: true },
                    orderBy: { priority: 'desc' },
                    take: 1,
                },
            },
        });

        if (!destination) {
            throw new Error('Destination not found');
        }

        return destination;
    }

    /**
     * Get real-time capacity for a destination
     */
    async getCapacity(destinationId: string) {
        const destination = await prisma.destination.findUnique({
            where: { id: destinationId },
            include: {
                zones: {
                    select: {
                        id: true,
                        name: true,
                        maxCapacity: true,
                        currentCapacity: true,
                    },
                },
            },
        });

        if (!destination) {
            throw new Error('Destination not found');
        }

        // Use effective capacity for today
        const { capacity: maxCapacity } = await capacityService.calculateEffectiveCapacity(destinationId, new Date());

        const percentage = (destination.currentCapacity / maxCapacity) * 100;

        let alertLevel: 'NORMAL' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'NORMAL';
        if (percentage >= 95) alertLevel = 'CRITICAL';
        else if (percentage >= 80) alertLevel = 'HIGH';
        else if (percentage >= 60) alertLevel = 'MODERATE';

        return {
            current: destination.currentCapacity,
            max: maxCapacity,
            percentage: Math.round(percentage * 10) / 10,
            alertLevel,
            zones: destination.zones.map((zone: any) => ({
                id: zone.id,
                name: zone.name,
                current: zone.currentCapacity,
                max: zone.maxCapacity,
                percentage: Math.round((zone.currentCapacity / zone.maxCapacity) * 100 * 10) / 10,
            })),
        };
    }

    /**
     * Check availability for a specific date
     */
    async checkAvailability(destinationId: string, date: Date) {
        // Get effective max capacity for the date
        const { capacity: maxCapacity } = await capacityService.calculateEffectiveCapacity(destinationId, date);

        // Get confirmed bookings for the date
        // Use aggregate to get visitor count, not just booking count
        const bookingsAgg = await prisma.booking.aggregate({
            where: {
                destinationId,
                visitDate: date,
                status: {
                    in: ['CONFIRMED', 'CHECKED_IN', 'PENDING'],
                },
            },
            _sum: {
                numberOfVisitors: true,
            },
        });

        const bookedCount = bookingsAgg._sum.numberOfVisitors || 0;
        const available = maxCapacity - bookedCount;

        return {
            date,
            maxCapacity,
            booked: bookedCount,
            available: Math.max(0, available),
            isAvailable: available > 0,
        };
    }

    /**
     * Get availability calendar (7-30 days)
     */
    async getAvailabilityCalendar(destinationId: string, days: number = 7) {
        const destination = await prisma.destination.findUnique({
            where: { id: destinationId },
        });

        if (!destination) {
            throw new Error('Destination not found');
        }

        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date();
        endDate.setDate(endDate.getDate() + days);
        endDate.setHours(23, 59, 59, 999);

        // Get all bookings in the range
        const bookings = await prisma.booking.findMany({
            where: {
                destinationId,
                visitDate: {
                    gte: startDate,
                    lte: endDate,
                },
                status: {
                    in: ['CONFIRMED', 'CHECKED_IN', 'PENDING'],
                },
            },
            select: {
                visitDate: true,
                numberOfVisitors: true,
            },
        });

        // Group by date
        const bookingsByDate = new Map<string, number>();
        bookings.forEach((booking: any) => {
            const dateStr = booking.visitDate.toISOString().split('T')[0];
            const current = bookingsByDate.get(dateStr) || 0;
            bookingsByDate.set(dateStr, current + booking.numberOfVisitors);
        });

        // Build calendar
        const calendar = [];
        for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];

            // Calculate effective capacity for each day
            const { capacity: maxCapacity } = await capacityService.calculateEffectiveCapacity(destinationId, date);

            const booked = bookingsByDate.get(dateStr) || 0;
            const available = maxCapacity - booked;

            calendar.push({
                date: dateStr,
                booked,
                available: Math.max(0, available),
                percentage: Math.round((booked / maxCapacity) * 100),
                isAvailable: available > 0,
            });
        }

        return calendar;
    }

    /**
     * Create a new destination (Admin only)
     */
    async createDestination(data: Prisma.DestinationCreateInput) {
        const destination = await prisma.destination.create({
            data,
            include: {
                zones: true,
                pricingRules: true,
            },
        });

        return destination;
    }

    /**
     * Update destination
     */
    async updateDestination(id: string, data: Prisma.DestinationUpdateInput) {
        const destination = await prisma.destination.update({
            where: { id },
            data,
            include: {
                zones: true,
                pricingRules: true,
            },
        });

        return destination;
    }

    /**
     * Delete destination
     */
    async deleteDestination(id: string) {
        await prisma.destination.delete({
            where: { id },
        });

        return { success: true };
    }
}

export const destinationService = new DestinationService();
