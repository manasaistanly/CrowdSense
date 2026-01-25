import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
// import { useAuth } from '../stores/authStore';

// Access env variable properly in Vite
const SOCKET_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3000';

export const useSocket = () => {
    // const { user } = useAuth();
    const socketRef = useRef<Socket | null>(null);

    // Lazy initialization to ensure socket exists when 'on' is called
    if (!socketRef.current) {
        socketRef.current = io(SOCKET_URL, {
            withCredentials: true,
            transports: ['websocket'], // Force websocket
            autoConnect: true,
        });

        socketRef.current.on('connect', () => {
            console.log('Socket connected:', socketRef.current?.id);
        });

        socketRef.current.on('connect_error', (err) => {
            console.error('Socket connection error:', err);
        });
    }

    useEffect(() => {
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, []);

    const emit = useCallback((eventName: string, data: any) => {
        if (socketRef.current) {
            socketRef.current.emit(eventName, data);
        }
    }, []);

    const on = useCallback((eventName: string, callback: (data: any) => void) => {
        if (socketRef.current) {
            socketRef.current.on(eventName, callback);
        }

        // Cleanup listener function
        return () => {
            if (socketRef.current) {
                socketRef.current.off(eventName, callback);
            }
        };
    }, []);

    return { socket: socketRef.current, emit, on };
};

