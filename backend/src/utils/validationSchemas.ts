import { z } from 'zod';

export const registerSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(8, 'Password must be at least 8 characters long'),
        firstName: z.string().min(2, 'First name is required'),
        lastName: z.string().min(2, 'Last name is required'),
        phone: z.string().optional(),
        role: z.enum(['TOURIST', 'STAFF', 'DESTINATION_ADMIN', 'SUPER_ADMIN']).optional(),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(1, 'Password is required'),
    }),
});

export const changePasswordSchema = z.object({
    body: z.object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
    }),
});

export const updateProfileSchema = z.object({
    body: z.object({
        firstName: z.string().min(2, 'First name is required').optional(),
        lastName: z.string().min(2, 'Last name is required').optional(),
        phone: z.string().optional(),
    }),
});

// Destination Schemas
export const createDestinationSchema = z.object({
    body: z.object({
        name: z.string().min(3, 'Name must be at least 3 characters'),
        description: z.string().min(10, 'Description must be at least 10 characters'),
        locationAddress: z.string().min(5, 'Address is required'),
        maxDailyCapacity: z.number().int().positive('Capacity must be positive'),
        openingTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
        closingTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
        images: z.array(z.string().url()).optional(),
        amenities: z.array(z.string()).optional(),
        guidelines: z.string().optional(),
    }),
});

// Booking Schemas
export const createBookingSchema = z.object({
    body: z.object({
        destinationId: z.string().uuid('Invalid Destination ID'),
        visitDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
        numberOfVisitors: z.number().int().positive().max(50, 'Cannot book more than 50 tickets at once'),
        visitorDetails: z.array(z.object({
            name: z.string().min(1, 'Visitor name is required'),
            age: z.string().or(z.number()), // Frontend sends string usually
        })).min(1, 'At least one visitor is required'),
    }),
});

// Feedback Schema
export const createFeedbackSchema = z.object({
    body: z.object({
        destinationId: z.string().uuid('Invalid Destination ID'),
        title: z.string().min(5, 'Title too short'),
        description: z.string().min(10, 'Description too short'),
        feedbackType: z.enum(['SUGGESTION', 'COMPLAINT', 'INCIDENT_REPORT', 'OTHER']).optional(),
        isAnonymous: z.boolean().optional(),
    }),
});
