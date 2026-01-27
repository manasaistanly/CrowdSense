import { prisma } from '../config/database';
import { capacityService } from './capacity.service';
import { BookingStatus, ZoneStatus } from '@prisma/client';

export class CheckpointService {
    /**
     * Handle Entry Scan
     * 1. Validate Booking & QR
     * 2. Check DATE validity
     * 3. Check ZONE STATUS (Block if Red)
     * 4. Update Booking Status -> CHECKED_IN
     * 5. Increment Zone Capacity
     * 6. Trigger Health Update
     */
    async scanEntry(qrCode: string, checkpointId: string) {
        // 1. Find Booking
        // In a real app, QR code might be decoded to bookingId or signed token
        // For simulation, assuming QR code string matches booking reference or ID
        const booking = await prisma.booking.findFirst({
            where: {
                OR: [
                    { bookingReference: qrCode },
                    { qrCode: qrCode }
                ]
            },
            include: { zone: true }
        });

        if (!booking) throw new Error('Invalid QR Code');
        if (booking.status === BookingStatus.CANCELLED) throw new Error('Booking is Cancelled');
        if (booking.status === BookingStatus.COMPLETED) throw new Error('Pass already used');
        if (booking.status === BookingStatus.CHECKED_IN) throw new Error('Already Checked In');

        // 2. Validate Date
        const today = new Date();
        const visitDate = new Date(booking.visitDate);
        today.setHours(0, 0, 0, 0);
        visitDate.setHours(0, 0, 0, 0);

        if (visitDate.getTime() !== today.getTime()) {
            throw new Error(`Pass valid for ${visitDate.toDateString()} only.`);
        }

        // 3. Check Zone Status (The Crowd Control Logic)
        if (booking.zoneId) {
            const zone = await prisma.zone.findUnique({ where: { id: booking.zoneId } });
            if (zone && zone.status === ZoneStatus.RED) {
                // REJECT ENTRY due to overcrowding
                // Only Super Admin override could bypass this (not implemented here)
                throw new Error('ZONE BLOCKED: Capacity Critical. Please wait or divert.');
            }
        }

        // 4. Update Booking
        await prisma.booking.update({
            where: { id: booking.id },
            data: {
                status: BookingStatus.CHECKED_IN,
                entryTime: new Date()
            }
        });

        // 5. Update Capacity & Health
        if (booking.zoneId) {
            await prisma.zone.update({
                where: { id: booking.zoneId },
                data: { currentCapacity: { increment: booking.numberOfVisitors } }
            });
            await capacityService.updateZoneHealth(booking.zoneId);
        }

        // Also update destination total capacity
        await prisma.destination.update({
            where: { id: booking.destinationId },
            data: { currentCapacity: { increment: booking.numberOfVisitors } }
        });

        return {
            success: true,
            message: 'Entry Approved',
            visitor: booking.numberOfVisitors,
            zone: booking.zone?.name || 'General'
        };
    }

    /**
     * Handle Exit Scan
     */
    async scanExit(qrCode: string, checkpointId: string) {
        const booking = await prisma.booking.findFirst({
            where: {
                OR: [
                    { bookingReference: qrCode },
                    { qrCode: qrCode }
                ]
            },
            include: { zone: true }
        });

        if (!booking) throw new Error('Invalid QR Code');
        if (booking.status !== BookingStatus.CHECKED_IN) throw new Error('Ticket not Checked In');

        // Update Booking
        await prisma.booking.update({
            where: { id: booking.id },
            data: {
                status: BookingStatus.COMPLETED,
                exitTime: new Date()
            }
        });

        // Decrement Capacity
        if (booking.zoneId) {
            await prisma.zone.update({
                where: { id: booking.zoneId },
                data: { currentCapacity: { decrement: booking.numberOfVisitors } }
            });
            await capacityService.updateZoneHealth(booking.zoneId);
        }

        await prisma.destination.update({
            where: { id: booking.destinationId },
            data: { currentCapacity: { decrement: booking.numberOfVisitors } }
        });

        return {
            success: true,
            message: 'Exit Recorded',
            zone: booking.zone?.name || 'General'
        };
    }
}

export const checkpointService = new CheckpointService();
