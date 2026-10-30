import { Request, Response, NextFunction } from 'express';
import { Device } from '../types';
declare global {
    namespace Express {
        interface Request {
            device?: Device;
        }
    }
}
export declare function authenticateDevice(req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.d.ts.map