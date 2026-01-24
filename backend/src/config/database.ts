import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
});

// Lazy connection - Prisma connects on first query
// prisma.$connect()
//     .then(() => logger.info('✅ Database connected successfully'))
//     .catch((error: Error) => logger.error('❌ Database connection failed:', error));

export { prisma };
