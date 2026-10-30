"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateDevice = authenticateDevice;
const database_1 = require("../database");
function authenticateDevice(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
        res.status(401).json({
            success: false,
            error: 'Missing X-API-Key header',
        });
        return;
    }
    try {
        const device = (0, database_1.findDeviceByApiKey)(apiKey);
        if (!device) {
            res.status(401).json({
                success: false,
                error: 'Invalid API key',
            });
            return;
        }
        req.device = device;
        next();
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Authentication error',
        });
    }
}
//# sourceMappingURL=auth.js.map