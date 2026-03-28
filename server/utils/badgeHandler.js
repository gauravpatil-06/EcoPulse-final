const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const Report = require('../models/Report');
const Notification = require('../models/Notification');

const checkAndAwardBadges = async (userId) => {
    try {
        // 1. Get badge definitions
        const badges = await Badge.find();

        // 2. Get user's resolved reports count
        const resolvedCount = await Report.countDocuments({
            $or: [{ citizenId: userId }, { collectorId: userId }],
            status: 'Resolved'
        });

        // 3. Get user's total reports count
        const totalCount = await Report.countDocuments({
            $or: [{ citizenId: userId }, { collectorId: userId }]
        });

        const awardedThisTurn = [];

        if (badges.length === 0) {
            console.log('No badges found in database. Please run seed script.');
            return [];
        }

        for (const badge of badges) {
            let conditionMet = false;

            if (badge.conditionType === 'total_reports' && totalCount >= badge.conditionValue) {
                conditionMet = true;
            } else if (badge.conditionType === 'resolved_reports' && resolvedCount >= badge.conditionValue) {
                conditionMet = true;
            }

            if (conditionMet) {
                // Check if already awarded
                const alreadyEarned = await UserBadge.findOne({ userId, badgeId: badge._id });
                if (!alreadyEarned) {
                    console.log(`AWARDING BADGE: ${badge.name} to user: ${userId}`);
                    const newBadgeRecord = await UserBadge.create({ userId, badgeId: badge._id });
                    console.log(`✓ USERBADGE RECORD SAVED: ${newBadgeRecord._id} for badge: ${badge.name}`);

                    // 4. Fetch User Role for personalized messaging
                    const User = require('../models/User');
                    const userData = await User.findById(userId);
                    const userRole = (userData?.role || 'citizen').toLowerCase();
                    const isCollector = userRole === 'swachhta mitra' || userRole === 'collector';

                    // 🔥 AUTHORITATIVE SCORING: Award +100 points for Badge Unlock
                    if (userData) {
                        await userData.addPoints(100);
                        console.log(`[Score] +100 pts awarded to ${userData.name} for badge achievement: ${badge.name}`);
                    }

                    // 5. Create Role-Specific Notification
                    let roleTitle = `Achievement Unlocked: ${badge.name}`;
                    let roleMessage = `🏆 Great work! You have earned the '${badge.name}' badge! You earned +100 bonus reward points for this achievement. View it in your Profile now! ✨`;

                    if (isCollector) {
                        roleTitle = `Swachhta Mitra Achievement: ${badge.name} 🏅`;
                        roleMessage = `Heroic Performance! As a dedicated Swachhta Mitra, you've earned the prestigious '${badge.name}' badge. Your outstanding service to the city has earned you +100 bonus points! ✨`;
                    } else {
                        roleTitle = `Environmental Excellence: ${badge.name} 🏆`;
                        roleMessage = `Eco Hero! Your active contribution to EcoPulse has earned you the '${badge.name}' badge. Thank you for helping us build a cleaner tomorrow! +100 bonus points rewarded! ✨`;
                    }

                    await Notification.create({
                        user: userId,
                        title: roleTitle,
                        message: roleMessage,
                        type: 'Badge',
                        points: 100
                    });
                    console.log(`--- ROLE-AWARE BADGE SYNC: ${badge.name} sent to ${userData?.role}: ${userId} ---`);
                    awardedThisTurn.push({
                        name: badge.name,
                        title: roleTitle,
                        message: roleMessage
                    });
                }
            }
        }

        return awardedThisTurn;
    } catch (err) {
        console.error('Badge Award Error:', err);
        return [];
    }
};

module.exports = { checkAndAwardBadges };
