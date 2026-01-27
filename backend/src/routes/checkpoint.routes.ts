import express, { Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import { checkpointService } from '../services/checkpoint.service';

const router = express.Router();

/**
 * Scan Entry/Exit
 * Auth: STAFF, ZONE_ADMIN
 */
router.post(
    '/scan',
    authenticate,
    authorize([UserRole.STAFF, UserRole.ZONE_ADMIN, UserRole.SUPER_ADMIN]),
    async (req: AuthRequest, res: Response) => {
        try {
            const { qrCode, type, checkpointId } = req.body;

            if (!qrCode || !type) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'QR Code and Type (ENTRY/EXIT) are required'
                    }
                });
                return;
            }

            let result;
            if (type === 'ENTRY') {
                result = await checkpointService.scanEntry(qrCode, checkpointId);
            } else if (type === 'EXIT') {
                result = await checkpointService.scanExit(qrCode, checkpointId);
            } else {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_TYPE',
                        message: 'Type must be ENTRY or EXIT'
                    }
                });
                return;
            }

            res.json(result);

        } catch (error: any) {
            console.error('Scan Error:', error);
            res.status(400).json({
                success: false,
                error: {
                    code: 'SCAN_FAILED',
                    message: error.message || 'Scan failed'
                }
            });
        }
    }
);

export default router;
