const express = require('express');
const router = express.Router();
const Device = require('../models/Device');
const { protect } = require('../middleware/authMiddleware');
const Purchase = require('../models/Purchase');

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

        // 1. Date range for last 12 months
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
        twelveMonthsAgo.setDate(1);
        twelveMonthsAgo.setHours(0, 0, 0, 0);

        // 2. Monthly service cost (all types)
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

        // 3. Monthly REPAIR costs only
        const monthlyRepairSpending = await ServiceLog.aggregate([
            {
                $match: {
                    serviceDate: { $gte: twelveMonthsAgo },
                    $or: [
                        { logType: 'Repair' },
                        { serviceType: 'Repair' }
                    ]
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

        // 4. Monthly SERVICE costs only
        const monthlyServiceSpending = await ServiceLog.aggregate([
            {
                $match: {
                    serviceDate: { $gte: twelveMonthsAgo },
                    $or: [
                        { logType: 'Service' },
                        { serviceType: { $in: ['Maintenance', 'Service'] } }
                    ]
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

        // 5. Monthly PURCHASE costs
        const monthlyPurchaseSpending = await Purchase.aggregate([
            {
                $match: {
                    purchaseDate: { $gte: twelveMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$purchaseDate" },
                        month: { $month: "$purchaseDate" }
                    },
                    total: { $sum: "$totalCost" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // 6. Distribution of devices by brand
        const brandDistribution = await Device.aggregate([
            { $group: { _id: "$brand", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // 7. Totals - Repair
        const totalRepairCostRes = await ServiceLog.aggregate([
            {
                $match: {
                    $or: [
                        { logType: 'Repair' },
                        { serviceType: 'Repair' }
                    ]
                }
            },
            { $group: { _id: null, total: { $sum: "$cost" } } }
        ]);

        // 8. Totals - Service
        const totalServiceCostRes = await ServiceLog.aggregate([
            {
                $match: {
                    $or: [
                        { logType: 'Service' },
                        { serviceType: { $in: ['Maintenance', 'Service'] } }
                    ]
                }
            },
            { $group: { _id: null, total: { $sum: "$cost" } } }
        ]);

        // 9. Totals - All Maintenance (combined)
        const totalMaintenanceCostRes = await ServiceLog.aggregate([
            { $group: { _id: null, total: { $sum: "$cost" } } }
        ]);

        // 10. Totals - Purchases
        const totalPurchaseCostRes = await Purchase.aggregate([
            { $group: { _id: null, total: { $sum: "$totalCost" } } }
        ]);

        // 11. Upcoming services (next 30 days)
        const now = new Date();
        const thirtyDaysLater = new Date();
        thirtyDaysLater.setDate(now.getDate() + 30);

        const upcomingServicesCount = await ServiceLog.countDocuments({
            nextServiceDate: { $gte: now, $lte: thirtyDaysLater }
        });

        // 12. Recent repair and service logs for detailed reports
        const recentRepairs = await ServiceLog.find({
            $or: [
                { logType: 'Repair' },
                { serviceType: 'Repair' }
            ]
        })
            .populate('device', 'assetTag brand model')
            .sort({ serviceDate: -1 })
            .limit(50);

        const recentServices = await ServiceLog.find({
            $or: [
                { logType: 'Service' },
                { serviceType: { $in: ['Maintenance', 'Service'] } }
            ]
        })
            .populate('device', 'assetTag brand model')
            .sort({ serviceDate: -1 })
            .limit(50);

        // 13. All purchases for detailed report
        const allPurchases = await Purchase.find()
            .populate('items.assignedUser', 'name')
            .populate('items.assignedDevice', 'assetTag brand model')
            .sort({ purchaseDate: -1 });

        res.json({
            monthlySpending: monthlySpending.map(item => ({
                month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
                amount: item.total
            })),
            monthlyRepairSpending: monthlyRepairSpending.map(item => ({
                month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
                amount: item.total
            })),
            monthlyServiceSpending: monthlyServiceSpending.map(item => ({
                month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
                amount: item.total
            })),
            monthlyPurchaseSpending: monthlyPurchaseSpending.map(item => ({
                month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
                amount: item.total
            })),
            brandDistribution: brandDistribution.map(item => ({
                brand: item._id || 'Unknown',
                count: item.count
            })),
            totals: {
                maintenanceCost: totalMaintenanceCostRes[0]?.total || 0,
                repairCost: totalRepairCostRes[0]?.total || 0,
                serviceCost: totalServiceCostRes[0]?.total || 0,
                purchaseCost: totalPurchaseCostRes[0]?.total || 0,
                upcomingServices: upcomingServicesCount
            },
            details: {
                recentRepairs,
                recentServices,
                allPurchases
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
