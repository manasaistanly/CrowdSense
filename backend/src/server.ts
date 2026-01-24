import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes';
import destinationRoutes from './routes/destination.routes';
import bookingRoutes from './routes/booking.routes';
import userRoutes from './routes/user.routes';
import capacityRoutes from './routes/capacity.routes';
import { analyticsRoutes } from './routes/analytics.routes';
import pricingRoutes from './routes/pricing.routes';
import { environmentalRoutes } from './routes/environmental.routes';
import { communityRoutes } from './routes/community.routes';
import { reportRoutes } from './routes/report.routes';
import { logger } from './utils/logger';
import { prisma } from './config/database';

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(compression()); // Compress all responses
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
        success: false,
        error: {
            code: 'TOO_MANY_REQUESTS',
            message: 'Too many requests from this IP, please try again later.'
        }
    }
});
app.use('/api/', limiter);

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/destinations', destinationRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/capacity', capacityRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/pricing', pricingRoutes);
app.use('/api/v1/environmental', environmentalRoutes);
app.use('/api/v1/community', communityRoutes);
app.use('/api/v1/reports', reportRoutes);

// 404 handler
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: 'Endpoint not found',
        },
    });
});

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error('Error:', err);

    res.status(err.status || 500).json({
        success: false,
        error: {
            code: err.code || 'INTERNAL_SERVER_ERROR',
            message: err.message || 'Something went wrong',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        },
    });
});

// Graceful shutdown
const gracefulShutdown = async () => {
    logger.info('Shutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
import http from 'http';
import { socketService } from './services/socket.service';

const httpServer = http.createServer(app);

// Initialize Socket.io
socketService.init(httpServer);

httpServer.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🔗 API URL: http://localhost:${PORT}/api/v1`);
});

export default app;
