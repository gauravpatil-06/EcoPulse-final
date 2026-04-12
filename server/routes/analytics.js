const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   GET /api/analytics/overview
// @desc    Get city-wide waste overview (Admin)
// @access  Private (Admin)
router.get('/overview', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied.' });
    }

    try {   
        const stats = await Report.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    pending: { $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] } },
                    inProgress: { $sum: { $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0] } },
                    resolved: { $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] } }
                }
            }
        ]);

        const zones = await Report.aggregate([
            {
                $group: {
                    _id: "$zone",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        const topSwachhtaMitras = await Report.aggregate([
            { $match: { status: "Resolved", collectorId: { $exists: true } } },
            {
                $group: {
                    _id: "$collectorId",
                    completed: { $sum: 1 }
                }
            },
            { $sort: { completed: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "swachhtaMitra"
                }
            },
            { $unwind: "$swachhtaMitra" },
            {
                $project: {
                    name: "$swachhtaMitra.name",
                    completed: 1
                }
            }
        ]);

        res.json({
            stats: stats[0] || { total: 0, pending: 0, inProgress: 0, resolved: 0 },
            zoneData: zones.map(z => ({ name: z._id, count: z.count })),
            topSwachhtaMitras
        });
    } catch (err) {
        console.error('Analytics Overview Error:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/analytics/trends
// @desc    Get monthly reporting trends
// @access  Private (Admin)
router.get('/trends', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied.' });
    }

    try {
        const trends = await Report.aggregate([
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const formattedTrends = trends.map(t => ({
            month: months[t._id - 1] || "Unknown",
            reports: t.count
        }));

        res.json(formattedTrends);
    } catch (err) {
        console.error('Analytics Trends Error:', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
