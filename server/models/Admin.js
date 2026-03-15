const mongoose = require('mongoose');
const crypto = require('crypto');

const AdminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: false
    },
    role: {
        type: String,
        default: 'admin'
    },
    zone: {
        type: String,
        default: 'all',
        lowercase: true,
        trim: true
    },
    avatar: {
        type: String,
        default: ""
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    area: {
        type: String,
        default: "",
        lowercase: true,
        trim: true
    },
    city: {
        type: String,
        default: "",
        lowercase: true,
        trim: true
    }
}, { timestamps: true });

AdminSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    return resetToken;
};

module.exports = mongoose.model('Admin', AdminSchema);
