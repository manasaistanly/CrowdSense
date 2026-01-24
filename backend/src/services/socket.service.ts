import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { logger } from '../utils/logger';

export class SocketService {
    private static instance: SocketService;
    private io: SocketIOServer | null = null;

    private constructor() { }

    public static getInstance(): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }

    public init(httpServer: HttpServer) {
        this.io = new SocketIOServer(httpServer, {
            cors: {
                origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
                methods: ['GET', 'POST'],
                credentials: true,
            },
        });

        this.io.on('connection', (socket) => {
            logger.info(`Socket connected: ${socket.id}`);

            socket.on('disconnect', () => {
                logger.info(`Socket disconnected: ${socket.id}`);
            });

            // Example: Join room based on role or user ID (if auth implemented on socket)
            // socket.on('join_room', (room) => {
            //     socket.join(room);
            // });
        });

        logger.info('Socket.io initialized');
    }

    public getIO(): SocketIOServer {
        if (!this.io) {
            throw new Error('Socket.io not initialized!');
        }
        return this.io;
    }

    /**
     * Broadcast capacity update for a destination
     */
    public safeEmitCapacityUpdate(destinationId: string, data: any) {
        if (this.io) {
            this.io.emit(`capacity_update_${destinationId}`, data);
            // Also emit to admin room if we used rooms
            this.io.emit('admin_capacity_update', { destinationId, ...data });
        }
    }
}

export const socketService = SocketService.getInstance();
