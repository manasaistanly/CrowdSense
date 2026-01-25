import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { prisma } from '../config/database';
import { JWTPayload } from '../middleware/auth';
import { logger } from '../utils/logger';

const SALT_ROUNDS = 12;

interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: UserRole;
}

interface LoginData {
    email: string;
    password: string;
}

interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

export class AuthService {
    /**
     * Register a new user
     */
    async register(data: RegisterData) {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

        // Create user
        const user = await prisma.user.create({
            data: {
                email: data.email,
                passwordHash,
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                role: data.role || UserRole.TOURIST,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                createdAt: true,
            },
        });

        // Generate tokens
        const tokens = this.generateTokens({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        return {
            user,
            ...tokens,
        };
    }



    /**
     * Login user
     */
    async login(data: LoginData) {
        // Find user
        const user = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (!user) {
            logger.warn(`Login failed: User not found for email ${data.email}`);
            throw new Error('Invalid credentials');
        }

        // Check if user is active
        if (!user.isActive) {
            logger.warn(`Login failed: User ${data.email} is inactive`);
            throw new Error('Account is deactivated');
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(data.password, user.passwordHash);

        if (!isValidPassword) {
            logger.warn(`Login failed: Invalid password for user ${data.email}`);
            throw new Error('Invalid credentials');
        }

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
        });

        // Generate tokens
        const tokens = this.generateTokens({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                role: user.role,
                avatarUrl: user.avatarUrl,
            },
            ...tokens,
        };
    }

    /**
     * Refresh access token
     */
    async refreshAccessToken(refreshToken: string) {
        const secret = process.env.REFRESH_TOKEN_SECRET;
        if (!secret) {
            throw new Error('REFRESH_TOKEN_SECRET is not defined');
        }

        try {
            const decoded = jwt.verify(refreshToken, secret) as JWTPayload;

            // Verify user still exists and is active
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
            });

            if (!user || !user.isActive) {
                throw new Error('Invalid refresh token');
            }

            // Generate new access token
            const accessToken = this.generateAccessToken({
                userId: user.id,
                email: user.email,
                role: user.role,
            });

            return { accessToken };
        } catch (error) {
            throw new Error('Invalid refresh token');
        }
    }

    /**
     * Get user profile
     */
    async getUserProfile(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                avatarUrl: true,
                emailVerified: true,
                createdAt: true,
                lastLogin: true,
            },
        });

        if (!user) {
            throw new Error('User not found');
        }

        return user;
    }

    /**
     * Update user profile
     */
    async updateProfile(userId: string, data: {
        firstName?: string;
        lastName?: string;
        phone?: string;
    }) {
        const user = await prisma.user.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                avatarUrl: true,
            },
        });

        return user;
    }

    /**
     * Change password
     */
    async changePassword(userId: string, currentPassword: string, newPassword: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new Error('User not found');
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);

        if (!isValidPassword) {
            throw new Error('Current password is incorrect');
        }

        // Hash new password
        const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

        // Update password
        await prisma.user.update({
            where: { id: userId },
            data: { passwordHash: newPasswordHash },
        });

        return { success: true };
    }

    /**
     * Generate access and refresh tokens
     */
    private generateTokens(payload: JWTPayload): TokenPair {
        const accessToken = this.generateAccessToken(payload);
        const refreshToken = this.generateRefreshToken(payload);

        return { accessToken, refreshToken };
    }

    /**
     * Generate access token (short-lived)
     */
    private generateAccessToken(payload: JWTPayload): string {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET is not defined');
        }

        const options: jwt.SignOptions = {
            expiresIn: (process.env.JWT_EXPIRY || '15m') as any,
        };
        return jwt.sign(payload, secret, options);
    }

    /**
     * Generate refresh token (long-lived)
     */
    private generateRefreshToken(payload: JWTPayload): string {
        const secret = process.env.REFRESH_TOKEN_SECRET;
        if (!secret) {
            throw new Error('REFRESH_TOKEN_SECRET is not defined');
        }

        const options: jwt.SignOptions = {
            expiresIn: (process.env.REFRESH_TOKEN_EXPIRY || '7d') as any,
        };
        return jwt.sign(payload, secret, options);
    }
}

export const authService = new AuthService();
