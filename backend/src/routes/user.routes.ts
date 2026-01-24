import { Router, Response } from 'express';
import { prisma } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { requirePermission, requireRole } from '../middleware/rbac';
import { PERMISSIONS } from '../utils/permissions';
import { UserRole } from '@prisma/client';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/v1/users
 * Get all users (Admin only)
 */
router.get(
    '/',
    authenticate,
    requirePermission(PERMISSIONS.USER_VIEW),
    async (req: AuthRequest, res: Response) => {
        try {
            const { role, page = 1, limit = 20, search } = req.query;

            const where: any = {};

            if (role) {
                where.role = role;
            }

            if (search) {
                where.OR = [
                    { email: { contains: search as string, mode: 'insensitive' } },
                    { firstName: { contains: search as string, mode: 'insensitive' } },
                    { lastName: { contains: search as string, mode: 'insensitive' } },
                ];
            }

            const skip = (Number(page) - 1) * Number(limit);

            const [users, total] = await Promise.all([
                prisma.user.findMany({
                    where,
                    skip,
                    take: Number(limit),
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                        role: true,
                        isActive: true,
                        emailVerified: true,
                        createdAt: true,
                        lastLogin: true,
                    },
                    orderBy: { createdAt: 'desc' },
                }),
                prisma.user.count({ where }),
            ]);

            res.json({
                success: true,
                data: {
                    users,
                    pagination: {
                        page: Number(page),
                        limit: Number(limit),
                        total,
                        totalPages: Math.ceil(total / Number(limit)),
                    },
                },
            });
        } catch (error: any) {
            logger.error('Get users error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'FETCH_FAILED',
                    message: error.message || 'Failed to fetch users',
                },
            });
        }
    }
);

/**
 * POST /api/v1/users
 * Create user (Admin only)
 */
router.post(
    '/',
    authenticate,
    requirePermission(PERMISSIONS.USER_CREATE),
    async (_req: AuthRequest, res: Response) => {
        try {
            // Implementation with registration logic would go here
            res.status(501).json({
                success: false,
                error: {
                    code: 'NOT_IMPLEMENTED',
                    message: 'Use /api/v1/auth/register to create users',
                },
            });
        } catch (error: any) {
            logger.error('Create user error:', error);
            res.status(400).json({
                success: false,
                error: {
                    code: 'CREATE_FAILED',
                    message: error.message || 'Failed to create user',
                },
            });
        }
    }
);

/**
 * PATCH /api/v1/users/:id/role
 * Update user role (Super Admin only)
 */
router.patch(
    '/:id/role',
    authenticate,
    requireRole(UserRole.SUPER_ADMIN),
    async (req: AuthRequest, res: Response) => {
        try {
            const id = req.params.id as string;
            const { role, firstName, lastName } = req.body;

            if (!role || !Object.values(UserRole).includes(role)) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Valid role is required',
                    },
                });
                return;
            }

            const updateData: { role: UserRole; firstName?: string; lastName?: string } = { role };

            if (firstName !== undefined) {
                updateData.firstName = firstName;
            }
            if (lastName !== undefined) {
                updateData.lastName = lastName;
            }

            const user = await prisma.user.update({
                where: { id },
                data: updateData,
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                },
            });

            res.json({
                success: true,
                data: { user },
                message: 'User role updated successfully',
            });
        } catch (error: any) {
            logger.error('Update role error:', error);
            res.status(400).json({
                success: false,
                error: {
                    code: 'UPDATE_FAILED',
                    message: error.message || 'Failed to update user role',
                },
            });
        }
    }
);

/**
 * PATCH /api/v1/users/:id/deactivate
 * Deactivate user
 */
router.patch(
    '/:id/deactivate',
    authenticate,
    requirePermission(PERMISSIONS.USER_DELETE),
    async (req: AuthRequest, res: Response) => {
        try {
            const id = req.params.id as string;

            const user = await prisma.user.update({
                where: { id },
                data: { isActive: false },
                select: {
                    id: true,
                    email: true,
                    isActive: true,
                },
            });

            res.json({
                success: true,
                data: { user },
                message: 'User deactivated successfully',
            });
        } catch (error: any) {
            logger.error('Deactivate user error:', error);
            res.status(400).json({
                success: false,
                error: {
                    code: 'DEACTIVATION_FAILED',
                    message: error.message || 'Failed to deactivate user',
                },
            });
        }
    }
);

export default router;
