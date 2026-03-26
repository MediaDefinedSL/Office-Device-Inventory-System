const express = require('express');
const router = express.Router();
const Device = require('../models/Device');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private
router.get('/dashboard', protect, async (req, res) => {
    try {
        const totalDevices = await Device.countDocuments();
        console.log(`[Analytics] Total devices found: ${totalDevices}`);

        const statusCounts = await Device.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        const typeCounts = await Device.aggregate([
            { $group: { _id: "$deviceType", count: { $sum: 1 } } }
        ]);

        // Default counts for all statuses to ensure they exist in response
        const defaultStatusCounts = {
            "Active": 0,
            "Under Repair": 0,
            "Retired": 0
        };

        const mappedStatusCounts = statusCounts.reduce((acc, curr) => {
            if (curr._id) acc[curr._id] = curr.count;
            return acc;
        }, defaultStatusCounts);

        const now = new Date();
        const thirtyDaysLater = new Date();
        thirtyDaysLater.setDate(now.getDate() + 30);

        const warrantiesExpiringSoon = await Device.find({
            warrantyExpiryDate: { $gte: now, $lte: thirtyDaysLater },
            status: { $ne: "Retired" }
        }).select('assetTag brand model warrantyExpiryDate').sort({ warrantyExpiryDate: 1 });

        res.json({
            totalDevices,
            statusCounts: mappedStatusCounts,
            typeCounts: typeCounts.reduce((acc, curr) => {
                if (curr._id) acc[curr._id] = curr.count;
                return acc;
            }, {}),
            warrantiesExpiringSoon
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @desc    Get detailed report analytics
// @route   GET /api/analytics/reports
// @access  Private
router.get('/reports', protect, async (req, res) => {
    try {
        const ServiceLog = require('../models/ServiceLog');

        // 1. Monthly service cost for the last 12 months
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
        twelveMonthsAgo.setDate(1);
        twelveMonthsAgo.setHours(0, 0, 0, 0);

        const monthlySpending = await ServiceLog.aggregate([
            {
                $match: {
                    serviceDate: { $gte: twelveMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$serviceDate" },
                        month: { $month: "$serviceDate" }
                    },
                    total: { $sum: "$cost" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // 2. Distribution of devices by brand
        const brandDistribution = await Device.aggregate([
            { $group: { _id: "$brand", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // 3. Totals
        const totalMaintenanceCostRes = await ServiceLog.aggregate([
            { $group: { _id: null, total: { $sum: "$cost" } } }
        ]);

        // 4. Upcoming services (next 30 days)
        const now = new Date();
        const thirtyDaysLater = new Date();
        thirtyDaysLater.setDate(now.getDate() + 30);

        const upcomingServicesCount = await ServiceLog.countDocuments({
            nextServiceDate: { $gte: now, $lte: thirtyDaysLater }
        });

        res.json({
            monthlySpending: monthlySpending.map(item => ({
                month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
                amount: item.total
            })),
            brandDistribution: brandDistribution.map(item => ({
                brand: item._id || 'Unknown',
                count: item.count
            })),
            totals: {
                maintenanceCost: totalMaintenanceCostRes[0]?.total || 0,
                upcomingServices: upcomingServicesCount
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
