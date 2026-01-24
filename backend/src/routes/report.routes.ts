import express, { Response } from 'express';
import { reportService } from '../services/report.service';
import { logger } from '../utils/logger';

const router = express.Router();

/**
 * GET /api/v1/reports/environmental
 * Download Environmental Impact Report (PDF)
 * Protected: Admin/Staff only ideally, but maybe public for transparency? 
 * Let's keep it authenticated for now as per MVP.
 */
router.get(
    '/environmental',
    async (_req: express.Request, res: Response) => {
        try {
            await reportService.generateEnvironmentalReport(res);
        } catch (error: any) {
            logger.error('Generate report error:', error);
            if (!res.headersSent) {
                res.status(500).json({ error: error.message });
            }
        }
    }
);

export const reportRoutes = router;
