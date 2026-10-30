"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../database");
const router = (0, express_1.Router)();
// GET / — System-wide stats
router.get('/', (_req, res) => {
    try {
        const stats = (0, database_1.getSystemStats)();
        res.json({
            success: true,
            data: stats,
        });
    }
    catch (error) {
        console.error('[Stats] Error getting system stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get system stats',
        });
    }
});
exports.default = router;
//# sourceMappingURL=stats.js.map