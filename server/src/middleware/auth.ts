import { Request, Response, NextFunction } from 'express';
import { findDeviceByApiKey } from '../database';
import { Device } from '../types';

// Extend Express Request to include device
declare global {
  namespace Express {
    interface Request {
      device?: Device;
    }
  }
}

export function authenticateDevice(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const apiKey = req.headers['x-api-key'] as string | undefined;

  if (!apiKey) {
    res.status(401).json({
      success: false,
      error: 'Missing X-API-Key header',
    });
    return;
  }

  try {
    const device = findDeviceByApiKey(apiKey);

    if (!device) {
      res.status(401).json({
        success: false,
        error: 'Invalid API key',
      });
      return;
    }

    req.device = device;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Authentication error',
    });
  }
}
