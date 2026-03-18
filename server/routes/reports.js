const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { checkAndAwardBadges } = require('../utils/badgeHandler');

// @route   POST /api/reports
// @desc    Submit a new garbage report
// @access  Private (Citizen)
router.post('/', auth, async (req, res) => {
    try {
        const { garbageType, location, area, landmark, contactNumber, description, photos, urgency, initialPhotoCount } = req.body;

        if (!photos || photos.length === 0) {
            return res.status(400).json({ message: 'At least one photo is required' });
        }

        // 🔥 AUTHORITATIVE CITY/ZONE: Always use reporting user's profile data
        const submitter = await User.findById(req.user.id);
        if (!submitter) {
            return res.status(404).json({ message: 'User not found' });
        }

        const newReport = new Report({
            citizenId: req.user.id,
            garbageType,
            location,
            city: submitter.city, // Inherit from profile
            zone: submitter.zone, // Inherit from profile
            area,
            landmark,
            contactNumber,
            description,
            photos,
            urgency,
            initialPhotoCount: initialPhotoCount || (photos ? photos.length : 1),
            status: 'Pending'
        });

        const report = await newReport.save();

        // 🔥 Award +10 points for submission
        await submitter.addPoints(10);

        try {
            const citizenNotif = new Notification({
                user: req.user.id,
                report: report._id,
                title: 'Report Successfully Filed',
                message: '✅ Your report is now active and you earned +10 points! Thank you for helping keep our surroundings clean.',
                type: 'Reward',
                points: 10
            });
            await citizenNotif.save();
        } catch (notifErr) {
            console.error('FAILED to save citizen notification:', notifErr.message);
        }

        try {
            const cleanReportZone = (report.zone || "").trim().toLowerCase();
            const cleanReportCity = (report.city || "").trim().toLowerCase();

            // STRICT MATCH: Only collectors in exact city and zone
            const collectors = await User.find({
                role: { $in: ['Swachhta Mitra', 'collector'] },
                zone: cleanReportZone,
                city: cleanReportCity
            });

            for (const collector of collectors) {
                const newNotif = new Notification({
                    user: collector._id,
                    report: report._id,
                    title: 'New Pickup Request',
                    message: `📍 Action Required: Clean up in ${report.area || report.location}. Complete this to earn +50 points!`,
                    type: 'New Task'
                });
                await newNotif.save();
            }
        } catch (collectorNotifErr) {
            console.error('FAILED to save collector notifications:', collectorNotifErr.message);
        }

        res.json(report);
    } catch (err) {
        console.error('Report submission error:', err);
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ message: 'Validation Error: ' + messages.join(', ') });
        }
        res.status(500).json({ message: 'Server Error: ' + err.message });
    }
});

// @route   GET /api/reports
// @desc    Get all reports (with filters)
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const { zone, status, citizenId, search, urgency, sortBy, from, to, page = 1, limit = 50 } = req.query;
        let query = {};

        // Date Range Logic
        if (from || to) {
            query.createdAt = {};
            if (from) query.createdAt.$gte = new Date(from);
            if (to) {
                const endDate = new Date(to);
                endDate.setHours(23, 59, 59, 999);
                query.createdAt.$lte = endDate;
            }
        }

        // Base Filters
        if (zone) query.zone = zone;
        if (status && status !== 'All') query.status = status;
        if (urgency && urgency !== 'All') query.urgency = urgency;

        // Collector Context Logic (Auto-filter by City/Zone)
        if (req.user.role === 'Swachhta Mitra' || req.user.role === 'collector') {
            const user = await User.findById(req.user.id);
            if (user) {
                const cleanCity = (user.city || "").trim().toLowerCase();
                const cleanZone = (user.zone || "").trim().toLowerCase();

                if (status === 'In Progress' || status === 'Resolved') {
                    query.collectorId = req.user.id;
                } else {
                    // STRICT MATCH: No regex, exact lowercase match
                    query.city = cleanCity;
                    query.zone = cleanZone;
                    
                    // SECURITY: Only Pending or My pickups
                    query.$or = [
                        { status: 'Pending' },
                        { collectorId: req.user.id }
                    ];
                }
            }
        }

        // Search Logic (Regex)
        if (search) {
            query.$or = [
                { location: { $regex: search, $options: 'i' } },
                { area: { $regex: search, $options: 'i' } },
                { landmark: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Citizen scope (SECURITY FEATURE)
        if (req.user.role === 'citizen') {
            query.citizenId = req.user.id;
        } else if (citizenId) {
            query.citizenId = citizenId;
        }

        // Sorting Logic
        let sort = { createdAt: -1 };
        if (sortBy === 'oldest') sort = { createdAt: 1 };

        let fetchQuery;
        if (sortBy === 'priority-hl' || sortBy === 'priority-lh') {
            // Enhanced Priority Sorting using Aggregation
            fetchQuery = Report.aggregate([
                { $match: query },
                {
                    $addFields: {
                        urgencyWeight: {
                            $switch: {
                                branches: [
                                    { case: { $eq: ["$urgency", "High"] }, then: 3 },
                                    { case: { $eq: ["$urgency", "Medium"] }, then: 2 },
                                    { case: { $eq: ["$urgency", "Low"] }, then: 1 }
                                ],
                                default: 0
                            }
                        }
                    }
                },
                { $sort: { urgencyWeight: sortBy === 'priority-hl' ? -1 : 1, createdAt: -1 } },
                { $skip: (parseInt(page) - 1) * parseInt(limit) },
                { $limit: parseInt(limit) }
            ]);
        } else {
            // Standard fetch for simple sorts
            fetchQuery = Report.find(query)
                .sort(sort)
                .skip((parseInt(page) - 1) * parseInt(limit))
                .limit(parseInt(limit))
                .lean();
        }

        // Parallel count and fetch
        const [totalReports, reports] = await Promise.all([
            Report.countDocuments(query),
            fetchQuery
        ]);

        res.json({
            success: true,
            reports,
            totalReports,
            totalPages: Math.ceil(totalReports / parseInt(limit)),
            currentPage: parseInt(page)
        });
    } catch (err) {
        console.error('Fetch reports error:', err.message);
        res.status(500).json({ success: false, message: 'Server Error: ' + err.message });
    }
});

// @route   GET /api/reports/:id
// @desc    Get report by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const report = await Report.findById(req.params.id)
            .populate('citizenId', 'name email phone')
            .lean();
        if (!report) return res.status(404).json({ message: 'Report not found' });
        res.json(report);
    } catch (err) {
        console.error('Fetch report details error:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/reports/:id
// @desc    Update a garbage report
// @access  Private (Citizen - only if pending)
router.put('/:id', auth, async (req, res) => {
    try {
        let report = await Report.findById(req.params.id);
        if (!report) return res.status(404).json({ message: 'Report not found' });

        // Ensure user owns report
        if (report.citizenId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized to edit this report' });
        }

        // Only allow editing if Status is Pending
        if (report.status !== 'Pending') {
            return res.status(400).json({ message: 'Only pending reports can be edited' });
        }

        const { garbageType, location, city, zone, area, landmark, contactNumber, description, photos, urgency } = req.body;

        // Update fields
        if (garbageType) report.garbageType = garbageType;
        if (location) report.location = location;
        if (city) report.city = city;
        if (zone) report.zone = zone;
        if (area) report.area = area;
        if (landmark) report.landmark = landmark;
        if (contactNumber) report.contactNumber = contactNumber;
        if (description) report.description = description;
        if (photos) report.photos = photos;
        if (urgency) report.urgency = urgency;

        const updatedReport = await report.save();
        res.json(updatedReport);
    } catch (err) {
        console.error('Update report error:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/reports/:id
// @desc    Delete a garbage report
// @access  Private (Citizen/Admin - citizen only if pending)
router.delete('/:id', auth, async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) return res.status(404).json({ message: 'Report not found' });

        // If not admin, check ownership and status
        if (req.user.role !== 'admin') {
            if (report.citizenId.toString() !== req.user.id) {
                return res.status(401).json({ message: 'User not authorized to delete this report' });
            }
            if (report.status !== 'Pending') {
                return res.status(400).json({ message: 'Only pending reports can be deleted by citizen' });
            }
        }

        // 🔥 CASCADING DELETE: Remove all notifications related to this report first
        await Notification.deleteMany({ report: req.params.id });
        
        // Then remove the report itself
        await Report.findByIdAndDelete(req.params.id);
        
        res.json({ message: 'Report and all associated activity permanently removed' });
    } catch (err) {
        console.error('Delete report error:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/reports/:id/status
// @desc    Update report status
// @access  Private (Collector/Admin)
router.put('/:id/status', auth, async (req, res) => {
    try {
        const { status, photos, evidenceUploaded, initialPhotoCount } = req.body;

        let report = await Report.findById(req.params.id);
        if (!report) return res.status(404).json({ message: 'Report not found' });

        const previousStatus = report.status;

        // If collector, they can only update if they are assigned or if it's pending in their zone
        if (req.user.role === 'Swachhta Mitra' || req.user.role === 'collector') {
            const User = require('../models/User');
            const user = await User.findById(req.user.id);
            if (report.zone !== user.zone || report.city !== user.city) {
                return res.status(403).json({ message: 'Not authorized for this city/zone' });
            }

            // Set collectorId if not set
            if (!report.collectorId) {
                report.collectorId = req.user.id;
            }
        }

        if (status) {
            // If status is transitioning to In Progress for the first time, record current photo count
            if (status === 'In Progress' && previousStatus === 'Pending') {
                report.initialPhotoCount = report.photos.length;
            }
            report.status = status;
        }
        if (photos) report.photos = photos;
        if (evidenceUploaded !== undefined) report.evidenceUploaded = evidenceUploaded;
        if (initialPhotoCount !== undefined) report.initialPhotoCount = initialPhotoCount;

        await report.save();

        let awardedBadges = [];
        // If report is resolved, award points (+50) and check for badges for the citizen
        if (status === 'Resolved') {
            const User = require('../models/User');

            // 🔥 AUTHORITATIVE SCORING: Award +50 points for Resolution
            const [citizenUser, collectorUser] = await Promise.all([
                User.findById(report.citizenId),
                report.collectorId ? User.findById(report.collectorId) : Promise.resolve(null)
            ]);

            if (citizenUser) await citizenUser.addPoints(50);
            if (collectorUser) await collectorUser.addPoints(50);

            const badgeResults = await Promise.all([
                checkAndAwardBadges(report.citizenId),
                report.collectorId ? checkAndAwardBadges(report.collectorId) : Promise.resolve([])
            ]);

            // Combine awarded badges for response (if any were awarded to the current user)
            const citizenAwarded = badgeResults[0] || [];
            const collectorAwarded = badgeResults[1] || [];

            if (req.user.role === 'citizen') awardedBadges = citizenAwarded;
            else awardedBadges = collectorAwarded;
        }

        // --- RESTORED NOTIFICATION LOGIC ---
        let citizenTitle = '';
        let citizenMessage = '';
        let collectorTitle = '';
        let collectorMessage = '';

        if (status === 'Resolved') {
            citizenTitle = 'Report Resolved';
            citizenMessage = '🎉 Great news! Your reported issue has been successfully resolved. You have been awarded +50 reward points!';
            collectorTitle = 'Task Completed';
            collectorMessage = '✅ Excellent work! You have successfully resolved the task. You earned +50 reward points!';
        } else if (status === 'In Progress') {
            if (previousStatus === 'Pending') {
                citizenTitle = 'Request Accepted';
                citizenMessage = '📥 Your request has been accepted by a Swachhta Mitra.';
                collectorTitle = 'Task Accepted';
                collectorMessage = '📥 You accepted a new cleanup request.';
            } else {
                citizenTitle = 'Work in Progress';
                citizenMessage = '🚧 Cleaning work is in progress at your reported location.';
                collectorTitle = 'Work in Progress';
                collectorMessage = '🚧 You started cleaning work.';
            }
        } else if (evidenceUploaded === true) {
            citizenTitle = 'Evidence Uploaded';
            citizenMessage = '📸 Evidence has been uploaded. You can view it now.';
        }

        // Save Citizen Notification
        if (citizenTitle) {
            try {
                const citizenNotif = new Notification({
                    user: report.citizenId,
                    report: report._id,
                    title: citizenTitle,
                    message: (citizenTitle === 'Report Resolved')
                        ? `🎉 Congratulations! Your report from ${report.area} is now Resolved. You have earned +50 extra reward points!`
                        : citizenMessage,
                    type: (citizenTitle === 'Report Resolved') ? 'Reward' : 'Status Update',
                    points: (citizenTitle === 'Report Resolved') ? 50 : 0
                });
                await citizenNotif.save();
            } catch (err) {
                console.error('Failed to notify citizen:', err.message);
            }
        }

        // Save Collector Notification (Self)
        if (collectorTitle && (req.user.role === 'Swachhta Mitra' || req.user.role === 'collector')) {
            try {
                const selfNotif = new Notification({
                    user: req.user.id,
                    report: report._id,
                    title: (collectorTitle === 'Request Accepted') ? 'Pickup Assigned' : collectorTitle,
                    message: (collectorTitle === 'Task Completed')
                        ? `✅ Task cleanup verified! You've successfully resolved this report and earned +50 points.`
                        : collectorMessage,
                    type: (collectorTitle === 'Task Completed') ? 'Reward' : 'New Task',
                    points: (collectorTitle === 'Task Completed') ? 50 : 0
                });
                await selfNotif.save();
            } catch (err) {
                console.error('Failed to notify collector:', err.message);
            }
        }

        res.json({
            report,
            awardedBadges,
            message: status === 'Resolved' ? 'Congratulations! Report Resolved and Points Awarded.' : 'Status Updated.'
        });
    } catch (err) {
        console.error('Update status error:', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
