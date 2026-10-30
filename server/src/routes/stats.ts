import { Router, Request, Response } from 'express';
import { getSystemStats } from '../database';

const router = Router();

// GET / — System-wide stats
router.get('/', (_req: Request, res: Response) => {
  try {
    const stats = getSystemStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('[Stats] Error getting system stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get system stats',
    });
  }
});

export default router;
