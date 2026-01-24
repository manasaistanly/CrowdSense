import { Router, Response } from 'express';
import { bookingService } from '../services/booking.service';
import { authenticate, AuthRequest } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { PERMISSIONS } from '../utils/permissions';
import { logger } from '../utils/logger';

import { validate } from '../middleware/validate';
import { createBookingSchema } from '../utils/validationSchemas';

const router = Router();

/**
 * POST /api/v1/bookings
 * Create a new booking
 */
router.post('/', authenticate, validate(createBookingSchema), async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Authentication required',
                },
            });
            return;
        }

        const {
            destinationId,
            zoneId,
            visitDate,
            timeSlot,
            numberOfVisitors,
            visitorDetails,
            specialRequirements,
        } = req.body;

        // Validation
        if (!destinationId || !visitDate || !numberOfVisitors) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Destination ID, visit date, and number of visitors are required',
                },
            });
            return;
        }

        const booking = await bookingService.createBooking({
            userId: req.user.userId,
            destinationId,
            zoneId,
            visitDate: new Date(visitDate),
            timeSlot,
            numberOfVisitors: parseInt(numberOfVisitors),
            visitorDetails,
            specialRequirements,
        });

        res.status(201).json({
            success: true,
            data: { booking },
            message: 'Booking created successfully',
        });
    } catch (error: any) {
        logger.error('Create booking error:', error);
        res.status(400).json({
            success: false,
            error: {
                code: 'BOOKING_FAILED',
                message: error.message || 'Failed to create booking',
            },
        });
    }
});

/**
 * POST /api/v1/bookings/:id/confirm
 * Confirm booking after payment
 */
router.post('/:id/confirm', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { paymentId } = req.body;

        if (!paymentId) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Payment ID is required',
                },
            });
            return;
        }

        const booking = await bookingService.confirmBooking(id as string, paymentId as string);

        res.json({
            success: true,
            data: { booking },
            message: 'Booking confirmed successfully',
        });
    } catch (error: any) {
        logger.error('Confirm booking error:', error);
        res.status(400).json({
            success: false,
            error: {
                code: 'CONFIRMATION_FAILED',
                message: error.message || 'Failed to confirm booking',
            },
        });
    }
});

/**
 * GET /api/v1/bookings/my-bookings
 * Get current user's bookings
 */
router.get('/my-bookings', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Authentication required',
                },
            });
            return;
        }

        const { status, upcoming } = req.query;

        const bookings = await bookingService.getUserBookings(req.user.userId, {
            status: status as any,
            upcoming: upcoming === 'true',
        });

        res.json({
            success: true,
            data: { bookings },
        });
    } catch (error: any) {
        logger.error('Get user bookings error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'FETCH_FAILED',
                message: error.message || 'Failed to fetch bookings',
            },
        });
    }
});

/**
 * GET /api/v1/bookings/:id
 * Get booking details
 */
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const booking = await bookingService.getBookingById(id as string);

        // Check if user owns the booking or has permission to view all
        if (
            req.user?.userId !== booking.userId &&
            !req.user?.role.includes('ADMIN') &&
            !req.user?.role.includes('STAFF')
        ) {
            res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'You do not have permission to view this booking',
                },
            });
            return;
        }

        res.json({
            success: true,
            data: { booking },
        });
    } catch (error: any) {
        logger.error('Get booking error:', error);
        res.status(404).json({
            success: false,
            error: {
                code: 'NOT_FOUND',
                message: error.message || 'Booking not found',
            },
        });
    }
});

/**
 * POST /api/v1/bookings/:id/cancel
 * Cancel booking
 */
router.post('/:id/cancel', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        // Get booking to check ownership
        const booking = await bookingService.getBookingById(id as string);

        if (
            req.user?.userId !== booking.userId &&
            !req.user?.role.includes('ADMIN')
        ) {
            res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'You do not have permission to cancel this booking',
                },
            });
            return;
        }

        const updatedBooking = await bookingService.cancelBooking(id as string, reason);

        res.json({
            success: true,
            data: { booking: updatedBooking },
            message: 'Booking cancelled successfully',
        });
    } catch (error: any) {
        logger.error('Cancel booking error:', error);
        res.status(400).json({
            success: false,
            error: {
                code: 'CANCELLATION_FAILED',
                message: error.message || 'Failed to cancel booking',
            },
        });
    }
});

/**
 * POST /api/v1/bookings/:id/verify-entry
 * Verify entry (Staff only)
 */
router.post(
    '/:id/verify-entry',
    authenticate,
    requirePermission(PERMISSIONS.BOOKING_VERIFY),
    async (req: AuthRequest, res: Response) => {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'Authentication required',
                    },
                });
                return;
            }

            const { id } = req.params;
            const booking = await bookingService.verifyEntry(id as string, req.user.userId);

            res.json({
                success: true,
                data: { booking },
                message: 'Entry verified successfully',
            });
        } catch (error: any) {
            logger.error('Verify entry error:', error);
            res.status(400).json({
                success: false,
                error: {
                    code: 'VERIFICATION_FAILED',
                    message: error.message || 'Failed to verify entry',
                },
            });
        }
    }
);

/**
 * POST /api/v1/bookings/:id/checkout
 * Check out (Staff only)
 */
router.post(
    '/:id/checkout',
    authenticate,
    requirePermission(PERMISSIONS.BOOKING_VERIFY),
    async (req: AuthRequest, res: Response) => {
        try {
            const { id } = req.params;
            const booking = await bookingService.checkOut(id as string);

            res.json({
                success: true,
                data: { booking },
                message: 'Check out successful',
            });
        } catch (error: any) {
            logger.error('Check out error:', error);
            res.status(400).json({
                success: false,
                error: {
                    code: 'CHECKOUT_FAILED',
                    message: error.message || 'Failed to check out',
                },
            });
        }
    }
);

/**
 * GET /api/v1/bookings
 * Get all bookings (Admin/Staff only)
 */
router.get(
    '/',
    authenticate,
    requirePermission(PERMISSIONS.BOOKING_VIEW_ALL),
    async (req: AuthRequest, res: Response) => {
        try {
            const { destinationId, visitDate, status, page, limit } = req.query;

            const result = await bookingService.getAllBookings({
                destinationId: destinationId as string,
                visitDate: visitDate ? new Date(visitDate as string) : undefined,
                status: status as any,
                page: page ? parseInt(page as string) : undefined,
                limit: limit ? parseInt(limit as string) : undefined,
            });

            res.json({
                success: true,
                data: result,
            });
        } catch (error: any) {
            logger.error('Get all bookings error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'FETCH_FAILED',
                    message: error.message || 'Failed to fetch bookings',
                },
            });
        }
    }
);

export default router;
