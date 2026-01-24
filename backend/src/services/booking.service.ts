import { BookingStatus, PaymentStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import QRCode from 'qrcode';
import { pricingService } from './pricing.service';
import { emailService } from './email.service';
import { capacityService } from './capacity.service';
import { socketService } from './socket.service';

interface CreateBookingData {
    userId: string;
    destinationId: string;
    zoneId?: string;
    visitDate: Date;
    timeSlot?: string;
    numberOfVisitors: number;
    visitorDetails?: any;
    specialRequirements?: string;
}

export class BookingService {
    /**
     * Create a new booking
     */
    async createBooking(data: CreateBookingData) {
        // Check destination exists and is active
        const destination = await prisma.destination.findUnique({
            where: { id: data.destinationId },
            include: {
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

        if (destination.status !== 'ACTIVE') {
            throw new Error('Destination is not currently accepting bookings');
        }

        // Check if visit date is in the future
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const visitDate = new Date(data.visitDate);
        visitDate.setHours(0, 0, 0, 0);

        if (visitDate < today) {
            throw new Error('Cannot book for past dates');
        }

        // Check availability
        const availability = await capacityService.checkAvailability(
            data.destinationId,
            data.visitDate,
            data.numberOfVisitors,
            data.zoneId
        );

        if (!availability.isAvailable) {
            throw new Error(`Insufficient capacity: ${availability.reason}`);
        }

        // Calculate pricing
        const pricing = await pricingService.calculatePrice(
            data.destinationId,
            data.visitDate,
            data.numberOfVisitors,
            data.visitorDetails
        );

        // Generate unique booking reference
        const bookingReference = this.generateBookingReference();

        // Create booking
        const booking = await prisma.booking.create({
            data: {
                bookingReference,
                userId: data.userId,
                destinationId: data.destinationId,
                zoneId: data.zoneId,
                visitDate: data.visitDate,
                timeSlot: data.timeSlot,
                numberOfVisitors: data.numberOfVisitors,
                visitorDetails: data.visitorDetails,
                specialRequirements: data.specialRequirements,
                basePrice: pricing.basePrice,
                dynamicPriceAdjustment: pricing.breakdown.surge,
                totalPrice: pricing.totalPrice,
                status: BookingStatus.PENDING,
                paymentStatus: PaymentStatus.PENDING,
            },
            include: {
                destination: {
                    select: {
                        id: true,
                        name: true,
                        locationAddress: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });

        return booking;
    }

    /**
     * Confirm booking and generate QR code (after payment)
     */
    async confirmBooking(bookingId: string, paymentId: string) {
        // Generate QR code
        const qrData = JSON.stringify({
            bookingId,
            timestamp: new Date().toISOString(),
        });

        const qrCode = await QRCode.toDataURL(qrData);

        // Update booking
        const booking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: BookingStatus.CONFIRMED,
                paymentStatus: PaymentStatus.COMPLETED,
                paymentId,
                qrCode,
            },
            include: {
                destination: true,
                user: true,
            },
        });

        // Send confirmation email (Async)
        try {
            await emailService.sendBookingConfirmation(
                booking.user.email,
                booking,
                qrCode
            );
        } catch (error) {
            // Don't fail the request if email fails, just log it
            console.error('Failed to send confirmation email', error);
        }

        return booking;
    }

    /**
     * Get user's bookings
     */
    async getUserBookings(userId: string, filters?: {
        status?: BookingStatus;
        upcoming?: boolean;
    }) {
        const where: Prisma.BookingWhereInput = { userId };

        if (filters?.status) {
            where.status = filters.status;
        }

        if (filters?.upcoming) {
            where.visitDate = {
                gte: new Date(),
            };
        }

        const bookings = await prisma.booking.findMany({
            where,
            orderBy: { visitDate: 'desc' },
            include: {
                destination: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        locationAddress: true,
                        images: true,
                    },
                },
            },
        });

        return bookings;
    }

    /**
     * Get booking by ID
     */
    async getBookingById(bookingId: string) {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                destination: true,
                zone: true,
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                    },
                },
            },
        });

        if (!booking) {
            throw new Error('Booking not found');
        }

        return booking;
    }

    /**
     * Get booking by reference
     */
    async getBookingByReference(reference: string) {
        const booking = await prisma.booking.findUnique({
            where: { bookingReference: reference },
            include: {
                destination: true,
                user: true,
            },
        });

        if (!booking) {
            throw new Error('Booking not found');
        }

        return booking;
    }

    /**
     * Cancel booking
     */
    async cancelBooking(bookingId: string, reason?: string) {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
        });

        if (!booking) {
            throw new Error('Booking not found');
        }

        if (booking.status === BookingStatus.COMPLETED) {
            throw new Error('Cannot cancel completed booking');
        }

        if (booking.status === BookingStatus.CANCELLED) {
            throw new Error('Booking is already cancelled');
        }

        // Update booking
        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: BookingStatus.CANCELLED,
                cancellationReason: reason,
                paymentStatus: booking.paymentStatus === PaymentStatus.COMPLETED
                    ? PaymentStatus.REFUNDED
                    : booking.paymentStatus,
            },
        });

        return updatedBooking;
    }

    /**
     * Verify entry (for staff)
     */
    async verifyEntry(bookingId: string, staffId: string) {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
        });

        if (!booking) {
            throw new Error('Booking not found');
        }

        if (booking.status === BookingStatus.CHECKED_IN || booking.entryTime) {
            throw new Error('QR Code already used. Entry denied.');
        }

        if (booking.status !== BookingStatus.CONFIRMED) {
            throw new Error('Booking is not valid for entry (Status: ' + booking.status + ')');
        }

        // Check if visit is for today
        const today = new Date();
        const visitDate = new Date(booking.visitDate);

        const isSameDay = today.getDate() === visitDate.getDate() &&
            today.getMonth() === visitDate.getMonth() &&
            today.getFullYear() === visitDate.getFullYear();

        if (!isSameDay) {
            throw new Error(`Booking is for ${visitDate.toDateString()}, but today is ${today.toDateString()}. Entry denied.`);
        }

        // Update booking
        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: BookingStatus.CHECKED_IN,
                entryTime: new Date(),
                verifiedById: staffId,
            },
        });

        // Update destination capacity
        await prisma.destination.update({
            where: { id: booking.destinationId },
            data: {
                currentCapacity: {
                    increment: booking.numberOfVisitors,
                },
            },
        });

        // Broadcast real-time update
        const dest = await prisma.destination.findUnique({
            where: { id: booking.destinationId },
            select: { currentCapacity: true, maxDailyCapacity: true }
        });

        if (dest) {
            socketService.safeEmitCapacityUpdate(booking.destinationId, {
                currentCapacity: dest.currentCapacity,
                maxDailyCapacity: dest.maxDailyCapacity
            });
        }

        return updatedBooking;
    }

    /**
     * Check out (for staff)
     */
    async checkOut(bookingId: string) {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
        });

        if (!booking) {
            throw new Error('Booking not found');
        }

        if (booking.status !== BookingStatus.CHECKED_IN) {
            throw new Error('Booking is not checked in');
        }

        // Update booking
        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: BookingStatus.COMPLETED,
                exitTime: new Date(),
            },
        });

        // Update destination capacity
        await prisma.destination.update({
            where: { id: booking.destinationId },
            data: {
                currentCapacity: {
                    decrement: booking.numberOfVisitors,
                },
            },
        });

        // Broadcast real-time update
        const dest = await prisma.destination.findUnique({
            where: { id: booking.destinationId },
            select: { currentCapacity: true, maxDailyCapacity: true }
        });

        if (dest) {
            socketService.safeEmitCapacityUpdate(booking.destinationId, {
                currentCapacity: dest.currentCapacity,
                maxDailyCapacity: dest.maxDailyCapacity
            });
        }

        return updatedBooking;
    }

    /**
     * Get all bookings (for admin/staff)
     */
    async getAllBookings(filters: {
        destinationId?: string;
        visitDate?: Date;
        status?: BookingStatus;
        page?: number;
        limit?: number;
    }) {
        const { page = 1, limit = 20, ...where } = filters;
        const skip = (page - 1) * limit;

        const [bookings, total] = await Promise.all([
            prisma.booking.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    destination: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
            }),
            prisma.booking.count({ where }),
        ]);

        return {
            bookings,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }





    /**
     * Generate unique booking reference
     */
    private generateBookingReference(): string {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `BOOK-${timestamp}-${random}`;
    }
}

export const bookingService = new BookingService();
