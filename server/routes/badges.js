const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');

// @route   GET /api/badges/user
// @desc    Get user's earned badges
router.get('/user', auth, async (req, res) => {
    try {
        const userBadges = await UserBadge.find({ userId: req.user.id })
            .populate('badgeId')
            .sort({ earnedAt: -1 });
        res.json(userBadges);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/badges
// @desc    Get all available badges
router.get('/', async (req, res) => {
    try {
        const badges = await Badge.find();
        res.json(badges);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/badges/seed
// @desc    Seed initial badges (Dev only/Admin)
router.post('/seed', auth, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Unauthorized' });

    const initialBadges = [
        { name: 'First Reporter', description: 'Submit your first report', icon: '🌱', conditionType: 'total_reports', conditionValue: 1 },
        { name: 'Active Citizen', description: 'Submit 5 reports', icon: '⭐', conditionType: 'total_reports', conditionValue: 5 },
        { name: 'Eco Warrior', description: 'Submit 10 reports', icon: '🔥', conditionType: 'total_reports', conditionValue: 10 },
        { name: 'Problem Solver', description: 'Get 1 report resolved', icon: '✅', conditionType: 'resolved_reports', conditionValue: 1 },
        { name: 'Clean Zone Hero', description: 'Get 5 reports resolved', icon: '🏆', conditionType: 'resolved_reports', conditionValue: 5 },
        { name: 'City Legend', description: 'Get 10 reports resolved', icon: '👑', conditionType: 'resolved_reports', conditionValue: 10 }
    ];

    try {
        await Badge.deleteMany(); // Clear existing
        await Badge.insertMany(initialBadges);
        res.json({ message: 'Badges seeded successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
