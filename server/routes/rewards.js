const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @desc    Get available reward items
router.get('/items', (req, res) => {
    const rewards = [
        { id: 1, name: 'Eco-Friendly E-Certificate', points: 100, description: 'Official digital certificate of your city contribution.', icon: '📜' },
        { id: 2, name: 'Tree Planting in Your Name', points: 500, description: 'We will plant a real tree in the city park on your behalf.', icon: '🌳' },
        { id: 3, name: 'SmartWaste Hero Badge (Exclusive)', points: 1000, description: 'Permanent elite badge shown on your community profile.', icon: '🎖️' },
        { id: 4, name: '50% Discount Voucher - City Transit', points: 1500, description: 'One-time 50% discount on city bus/metro pass.', icon: '🚌' }
    ];
    res.json(rewards);
});

// @desc    Redeem points for a reward
router.post('/redeem', auth, async (req, res) => {
    const { rewardId, points } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (user.rewardPoints < points) {
            return res.status(400).json({ message: 'Insufficient reward points' });
        }

        user.rewardPoints -= points;
        await user.save();

        res.json({ 
            message: 'Reward redeemed successfully!', 
            remainingPoints: user.rewardPoints 
        });
    } catch (err) {
        console.error('Redeem Error:', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
