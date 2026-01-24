import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { hasPermission } from '../utils/permissions';

/**
 * RBAC middleware - checks if user has required permission
 */
export const requirePermission = (permission: string) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
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

        const userRole = req.user.role;

        if (!hasPermission(userRole, permission)) {
            res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Insufficient permissions',
                    details: {
                        required: permission,
                        userRole: userRole,
                    },
                },
            });
            return;
        }

        next();
    };
};

/**
 * Require any of the specified permissions
 */
export const requireAnyPermission = (permissions: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
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

        const userRole = req.user.role;
        const hasAny = permissions.some(permission => hasPermission(userRole, permission));

        if (!hasAny) {
            res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Insufficient permissions',
                    details: {
                        requiredAny: permissions,
                        userRole: userRole,
                    },
                },
            });
            return;
        }

        next();
    };
};

/**
 * Require all of the specified permissions
 */
export const requireAllPermissions = (permissions: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
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

        const userRole = req.user.role;
        const hasAll = permissions.every(permission => hasPermission(userRole, permission));

        if (!hasAll) {
            res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Insufficient permissions',
                    details: {
                        requiredAll: permissions,
                        userRole: userRole,
                    },
                },
            });
            return;
        }

        next();
    };
};

/**
 * Require specific role(s)
 */
export const requireRole = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
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

        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Insufficient role',
                    details: {
                        required: roles,
                        current: req.user.role,
                    },
                },
            });
            return;
        }

        next();
    };
};
