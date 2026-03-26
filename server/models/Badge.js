const mongoose = require('mongoose');

const BadgeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    icon: {
        type: String, // lucide icon name or emoji
        required: true
    },
    conditionType: {
        type: String,
        enum: ['total_reports', 'resolved_reports', 'streak', 'zone_hero'],
        required: true
    },
    conditionValue: {
        type: Number,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Badge', BadgeSchema);
