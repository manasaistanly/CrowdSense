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


// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(compression()); // Compress all responses
app.use(cors({
    origin: true, // Allow all origins for now to fix connectivity
    credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);


// Routes
app.get('/', (_req, res) => {
    res.status(200).json({ status: 'OK', message: 'Backend is running' });
});

app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

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
