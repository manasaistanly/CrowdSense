import { UserRole } from '@prisma/client';

// Permission constants
export const PERMISSIONS = {
    // Destination Management
    DESTINATION_CREATE: 'destination:create',
    DESTINATION_UPDATE: 'destination:update',
    DESTINATION_DELETE: 'destination:delete',
    DESTINATION_VIEW: 'destination:view',
    DESTINATION_VIEW_ALL: 'destination:view:all',

    // Capacity Management
    CAPACITY_CONFIGURE: 'capacity:configure',
    CAPACITY_VIEW: 'capacity:view',
    CAPACITY_UPDATE_REALTIME: 'capacity:update:realtime',
    CAPACITY_OVERRIDE: 'capacity:override',

    // Booking Management
    BOOKING_CREATE: 'booking:create',
    BOOKING_CREATE_WALKIN: 'booking:create:walkin',
    BOOKING_VIEW_OWN: 'booking:view:own',
    BOOKING_VIEW_ALL: 'booking:view:all',
    BOOKING_UPDATE: 'booking:update',
    BOOKING_CANCEL: 'booking:cancel',
    BOOKING_APPROVE: 'booking:approve',
    BOOKING_VERIFY: 'booking:verify',

    // Analytics
    ANALYTICS_VIEW_BASIC: 'analytics:view:basic',
    ANALYTICS_VIEW_DETAILED: 'analytics:view:detailed',
    ANALYTICS_VIEW_FINANCIAL: 'analytics:view:financial',
    ANALYTICS_EXPORT: 'analytics:export',

    // User Management
    USER_CREATE: 'user:create',
    USER_UPDATE: 'user:update',
    USER_DELETE: 'user:delete',
    USER_VIEW: 'user:view',
    USER_ASSIGN_ROLE: 'user:assign:role',

    // Financial
    FINANCE_VIEW_REVENUE: 'finance:view:revenue',
    FINANCE_CONFIGURE_PRICING: 'finance:configure:pricing',
    FINANCE_VIEW_TRANSACTIONS: 'finance:view:transactions',
    FINANCE_EXPORT: 'finance:export',

    // Community Impact
    COMMUNITY_VIEW_METRICS: 'community:view:metrics',
    COMMUNITY_SUBMIT_FEEDBACK: 'community:submit:feedback',
    COMMUNITY_VIEW_DISTRIBUTION: 'community:view:distribution',

    // Reports
    REPORT_GENERATE: 'report:generate',
    REPORT_SCHEDULE: 'report:schedule',
    REPORT_EXPORT: 'report:export',

    // System
    SYSTEM_CONFIGURE: 'system:configure',
    SYSTEM_AUDIT_LOGS: 'system:audit:logs',
    SYSTEM_API_KEYS: 'system:api:keys',
} as const;

// Role-Permission Mapping
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
    [UserRole.SUPER_ADMIN]: Object.values(PERMISSIONS), // All permissions

    [UserRole.DESTINATION_ADMIN]: [
        PERMISSIONS.DESTINATION_UPDATE,
        PERMISSIONS.DESTINATION_VIEW,
        PERMISSIONS.CAPACITY_CONFIGURE,
        PERMISSIONS.CAPACITY_VIEW,
        PERMISSIONS.CAPACITY_UPDATE_REALTIME,
        PERMISSIONS.BOOKING_CREATE,
        PERMISSIONS.BOOKING_CREATE_WALKIN,
        PERMISSIONS.BOOKING_VIEW_ALL,
        PERMISSIONS.BOOKING_APPROVE,
        PERMISSIONS.ANALYTICS_VIEW_DETAILED,
        PERMISSIONS.ANALYTICS_VIEW_FINANCIAL,
        PERMISSIONS.ANALYTICS_EXPORT,
        PERMISSIONS.USER_CREATE,
        PERMISSIONS.USER_UPDATE,
        PERMISSIONS.FINANCE_VIEW_REVENUE,
        PERMISSIONS.FINANCE_CONFIGURE_PRICING,
        PERMISSIONS.REPORT_GENERATE,
        PERMISSIONS.REPORT_SCHEDULE,
    ],

    [UserRole.STAFF]: [
        PERMISSIONS.DESTINATION_VIEW,
        PERMISSIONS.CAPACITY_VIEW,
        PERMISSIONS.CAPACITY_UPDATE_REALTIME,
        PERMISSIONS.BOOKING_CREATE_WALKIN,
        PERMISSIONS.BOOKING_VIEW_ALL,
        PERMISSIONS.BOOKING_VERIFY,
        PERMISSIONS.ANALYTICS_VIEW_BASIC,
    ],

    [UserRole.ANALYST]: [
        PERMISSIONS.DESTINATION_VIEW,
        PERMISSIONS.ANALYTICS_VIEW_DETAILED,
        PERMISSIONS.ANALYTICS_EXPORT,
        PERMISSIONS.REPORT_GENERATE,
        PERMISSIONS.REPORT_EXPORT,
        PERMISSIONS.COMMUNITY_VIEW_METRICS,
    ],

    [UserRole.COMMUNITY_REP]: [
        PERMISSIONS.DESTINATION_VIEW,
        PERMISSIONS.ANALYTICS_VIEW_BASIC,
        PERMISSIONS.COMMUNITY_VIEW_METRICS,
        PERMISSIONS.COMMUNITY_SUBMIT_FEEDBACK,
        PERMISSIONS.COMMUNITY_VIEW_DISTRIBUTION,
        PERMISSIONS.FINANCE_VIEW_REVENUE,
    ],

    [UserRole.TOURIST]: [
        PERMISSIONS.DESTINATION_VIEW,
        PERMISSIONS.CAPACITY_VIEW,
        PERMISSIONS.BOOKING_CREATE,
        PERMISSIONS.BOOKING_VIEW_OWN,
        PERMISSIONS.BOOKING_CANCEL,
        PERMISSIONS.ANALYTICS_VIEW_BASIC,
    ],

    [UserRole.ZONE_ADMIN]: [
        PERMISSIONS.DESTINATION_UPDATE,
        PERMISSIONS.DESTINATION_VIEW,
        PERMISSIONS.CAPACITY_CONFIGURE,
        PERMISSIONS.CAPACITY_VIEW,
        PERMISSIONS.CAPACITY_UPDATE_REALTIME,
        PERMISSIONS.CAPACITY_OVERRIDE,
        PERMISSIONS.BOOKING_VIEW_ALL,
        PERMISSIONS.ANALYTICS_VIEW_DETAILED,
        PERMISSIONS.USER_CREATE,
        PERMISSIONS.USER_UPDATE,
        PERMISSIONS.REPORT_GENERATE,
    ],

    [UserRole.NODAL_OFFICER]: [
        PERMISSIONS.DESTINATION_VIEW,
        PERMISSIONS.CAPACITY_VIEW,
        PERMISSIONS.CAPACITY_UPDATE_REALTIME,
        PERMISSIONS.BOOKING_VERIFY,
        PERMISSIONS.BOOKING_VIEW_ALL,
        PERMISSIONS.ANALYTICS_VIEW_BASIC,
    ],
};

/**
 * Check if a user role has a specific permission
 */
export const hasPermission = (userRole: UserRole, permission: string): boolean => {
    return ROLE_PERMISSIONS[userRole]?.includes(permission) ?? false;
};

/**
 * Get all permissions for a role
 */
export const getRolePermissions = (userRole: UserRole): string[] => {
    return ROLE_PERMISSIONS[userRole] || [];
};

/**
 * Check if a user has any of the specified permissions
 */
export const hasAnyPermission = (userRole: UserRole, permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(userRole, permission));
};

/**
 * Check if a user has all of the specified permissions
 */
export const hasAllPermissions = (userRole: UserRole, permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(userRole, permission));
};
