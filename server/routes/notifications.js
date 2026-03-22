const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');

// @route   GET /api/notifications
// @desc    Get all notifications for a user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const mongoose = require('mongoose');
        const userObjId = new mongoose.Types.ObjectId(req.user.id);
        
        const notifications = await Notification.find({ user: userObjId })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();
            
        res.json(notifications);
    } catch (err) {
        console.error('Fetch notifications error:', err);
        res.status(500).json({ message: 'Server Error: ' + err.message });
    }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark a notification as read
// @access  Private
router.put('/:id/read', auth, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) return res.status(404).json({ message: 'Notification not found' });
        
        if (notification.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        notification.isRead = true;
        await notification.save();
        res.json(notification);
    } catch (err) {
        console.error('Mark read error:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', auth, async (req, res) => {
    try {
        await Notification.updateMany({ user: req.user.id, isRead: false }, { isRead: true });
        res.json({ message: 'All notifications marked as read' });
    } catch (err) {
        console.error('Read all error:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/notifications/clear-all
// @desc    Clear all notifications
// @access  Private
router.delete('/clear-all', auth, async (req, res) => {
    try {
        await Notification.deleteMany({ user: req.user.id });
        res.json({ message: 'All notifications cleared' });
    } catch (err) {
        console.error('Clear all error:', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
