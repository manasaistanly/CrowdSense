import { Router, Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { authenticate, AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

import { validate } from '../middleware/validate';
import { registerSchema, loginSchema, changePasswordSchema, updateProfileSchema } from '../utils/validationSchemas';

const router = Router();

/**
 * POST /api/v1/auth/register
 * Register a new user
 */
router.post('/register', validate(registerSchema), async (req: Request, res: Response) => {
    try {
        const { email, password, firstName, lastName, phone, role } = req.body;
        // Validation handled by middleware

        const result = await authService.register({
            email,
            password,
            firstName,
            lastName,
            phone,
            role,
        });

        // Set refresh token in httpOnly cookie
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(201).json({
            success: true,
            data: {
                user: result.user,
                accessToken: result.accessToken,
            },
            message: 'User registered successfully',
        });
    } catch (error: any) {
        logger.error('Registration error:', error);
        res.status(400).json({
            success: false,
            error: {
                code: 'REGISTRATION_FAILED',
                message: error.message || 'Registration failed',
            },
        });
    }
});

/**
 * POST /api/v1/auth/login
 * Login user
 */
router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        // Validation handled by middleware

        const result = await authService.login({ email, password });

        // Set refresh token in httpOnly cookie
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.json({
            success: true,
            data: {
                user: result.user,
                accessToken: result.accessToken,
            },
            message: 'Login successful',
        });
    } catch (error: any) {
        logger.error('Login error:', error);
        res.status(401).json({
            success: false,
            error: {
                code: 'LOGIN_FAILED',
                message: error.message || 'Invalid credentials',
            },
        });
    }
});

/**
 * POST /api/v1/auth/refresh
 * Refresh access token
 */
router.post('/refresh', async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

        if (!refreshToken) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'NO_REFRESH_TOKEN',
                    message: 'Refresh token not provided',
                },
            });
            return;
        }

        const result = await authService.refreshAccessToken(refreshToken);

        res.json({
            success: true,
            data: {
                accessToken: result.accessToken,
            },
        });
    } catch (error: any) {
        logger.error('Token refresh error:', error);
        res.status(401).json({
            success: false,
            error: {
                code: 'REFRESH_FAILED',
                message: error.message || 'Token refresh failed',
            },
        });
    }
});

/**
 * POST /api/v1/auth/logout
 * Logout user
 */
router.post('/logout', (_req: Request, res: Response) => {
    res.clearCookie('refreshToken');
    res.json({
        success: true,
        message: 'Logged out successfully',
    });
});

/**
 * GET /api/v1/auth/me
 * Get current user profile
 */
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Not authenticated',
                },
            });
            return;
        }

        const user = await authService.getUserProfile(req.user.userId);

        res.json({
            success: true,
            data: { user },
        });
    } catch (error: any) {
        logger.error('Get profile error:', error);
        res.status(404).json({
            success: false,
            error: {
                code: 'USER_NOT_FOUND',
                message: error.message || 'User not found',
            },
        });
    }
});

/**
 * PATCH /api/v1/auth/profile
 * Update user profile
 */
router.patch('/profile', authenticate, validate(updateProfileSchema), async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Not authenticated',
                },
            });
            return;
        }

        const { firstName, lastName, phone } = req.body;
        const user = await authService.updateProfile(req.user.userId, {
            firstName,
            lastName,
            phone,
        });

        res.json({
            success: true,
            data: { user },
            message: 'Profile updated successfully',
        });
    } catch (error: any) {
        logger.error('Update profile error:', error);
        res.status(400).json({
            success: false,
            error: {
                code: 'UPDATE_FAILED',
                message: error.message || 'Profile update failed',
            },
        });
    }
});

/**
 * POST /api/v1/auth/change-password
 * Change user password
 */
router.post('/change-password', authenticate, validate(changePasswordSchema), async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Not authenticated',
                },
            });
            return;
        }

        const { currentPassword, newPassword } = req.body;
        // Validation handled by middleware

        await authService.changePassword(req.user.userId, currentPassword, newPassword);

        res.json({
            success: true,
            message: 'Password changed successfully',
        });
    } catch (error: any) {
        logger.error('Change password error:', error);
        res.status(400).json({
            success: false,
            error: {
                code: 'PASSWORD_CHANGE_FAILED',
                message: error.message || 'Password change failed',
            },
        });
    }
});

export default router;
