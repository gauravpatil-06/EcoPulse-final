const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin)
router.get('/users', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    try {
        const { role, search } = req.query;
        let matchQuery = {};

        if (role && role !== 'All') {
            if (role === 'Collector') {
                matchQuery.role = { $regex: /^(Swachhta Mitra|collector)$/i };
            } else {
                matchQuery.role = { $regex: new RegExp(`^${role}$`, 'i') };
            }
        }
        
        if (search) {
            matchQuery.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { zone: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.aggregate([
            { $match: matchQuery },
            { $sort: { createdAt: -1 } },
            
            // Lookup Badges
            {
                $lookup: {
                    from: 'userbadges',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'badgeData'
                }
            },

            // Lookup most recent report to get Area (if not in User model)
            {
                $lookup: {
                    from: 'reports',
                    let: { userId: "$_id", userRole: "$role" },
                    pipeline: [
                        { $match: { 
                            $expr: { 
                                $or: [
                                    { $eq: ["$citizenId", "$$userId"] },
                                    { $eq: ["$collectorId", "$$userId"] }
                                ]
                            } 
                        } },
                        { $sort: { createdAt: -1 } },
                        { $limit: 1 }
                    ],
                    as: 'recentReport'
                }
            },

            // Format data for response
            {
                $project: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    phone: 1,
                    role: 1,
                    zone: 1,
                    city: 1,
                    area: { $ifNull: ["$area", { $arrayElemAt: ["$recentReport.area", 0] }] },
                    avatar: 1,
                    isActive: 1,
                    createdAt: 1,
                    badges: "$badgeData.badgeName"
                }
            }
        ]);

        res.json(users);
    } catch (err) {
        console.error('Admin Fetch Users Error:', err.message);
        res.status(500).json({ message: 'Internal Server Error while fetching users' });
    }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Toggle user status (Active/Inactive)
// @access  Private (Admin)
router.put('/users/:id/status', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied.' });
    }

    try {
        const { isActive } = req.body;
        const user = await User.findById(req.params.id);
        
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.role === 'admin') return res.status(400).json({ message: 'Admin status cannot be toggled' });

        user.isActive = isActive;
        await user.save();
        
        res.json({ message: `User ${isActive ? 'activated' : 'deactivated'} successfully`, user });
    } catch (err) {
        console.error('Toggle User Status Error:', err.message);
        res.status(500).json({ message: 'Server Error: Failed to update status' });
    }
});

// @route   PUT /api/admin/users/:id/zone
// @desc    Update user zone
// @access  Private (Admin)
router.put('/users/:id/zone', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied.' });
    }

    try {
        const { zone } = req.body;
        const user = await User.findById(req.params.id);
        
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.zone = zone;
        await user.save();
        
        res.json({ message: 'User zone updated successfully', user });
    } catch (err) {
        console.error('Update User Zone Error:', err.message);
        res.status(500).json({ message: 'Server Error: Failed to update zone' });
    }
});

// @route   DELETE /api/admin/users/:id
// @desc    Permanently delete a user record
// @access  Private (Admin)
router.delete('/users/:id', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied.' });
    }

    try {
        const user = await User.findById(req.params.id);
        
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.role === 'admin') return res.status(400).json({ message: 'Admin accounts cannot be deleted' });

        await User.findByIdAndDelete(req.params.id);
        
        res.json({ message: 'User record permanently deleted from database' });
    } catch (err) {
        console.error('Delete User Error:', err.message);
        res.status(500).json({ message: 'Server Error: Database deletion failed' });
    }
});

module.exports = router;
