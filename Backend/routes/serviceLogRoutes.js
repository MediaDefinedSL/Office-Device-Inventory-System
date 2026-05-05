const express = require('express');
const router = express.Router();
const ServiceLog = require('../models/ServiceLog');
const Device = require('../models/Device');
const { protect } = require('../middleware/authMiddleware');

console.log('--- Service Log Routes Loaded ---');

// @desc    Get all service logs
// @route   GET /api/service-logs
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const logs = await ServiceLog.find()
            .populate('device', 'assetTag assignedUser deviceType brand model')
            .sort({ serviceDate: -1 });
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @desc    Create a new service log
// @route   POST /api/service-logs
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { deviceId, serviceDate, description, servicedBy, cost, nextServiceDate, updateDeviceStatus, comments, additionalServicers, logType, expectedReadyDate } = req.body;

        const device = await Device.findById(deviceId);
        if (!device) {
            return res.status(404).json({ error: 'Device not found' });
        }

        const serviceLog = new ServiceLog({
            device: deviceId,
            serviceDate,
            description,
            servicedBy,
            cost,
            nextServiceDate: nextServiceDate || undefined,
            expectedReadyDate: expectedReadyDate || undefined,
            logType,
            comments,
            additionalServicers
        });

        await serviceLog.save();

        // Optionally update device status (e.g., from 'Under Repair' to 'Active')
        if (updateDeviceStatus) {
            device.status = updateDeviceStatus;
            await device.save();
        }

        res.status(201).json(serviceLog);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// @desc    Get service logs for a specific device
// @route   GET /api/service-logs/device/:deviceId
// @access  Private
router.get('/device/:deviceId', protect, async (req, res) => {
    try {
        const logs = await ServiceLog.find({ device: req.params.deviceId }).sort({ serviceDate: -1 });
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @desc    Get upcoming service logs within 7 days
// @route   GET /api/service-logs/upcoming
// @access  Private
router.get('/upcoming', protect, async (req, res) => {
    try {
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Start of today

        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        sevenDaysFromNow.setHours(23, 59, 59, 999); // End of 7th day

        const logs = await ServiceLog.find({
            nextServiceDate: { $lte: sevenDaysFromNow, $gte: now }
        })
            .populate('device', 'assetTag assignedUser model deviceType')
            .sort({ nextServiceDate: 1 });

        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @desc    Get recent service logs for dashboard
// @route   GET /api/service-logs/recent
// @access  Private
router.get('/recent', protect, async (req, res) => {
    try {
        const logs = await ServiceLog.find()
            .populate('device', 'assetTag assignedUser deviceType')
            .sort({ createdAt: -1 })
            .limit(5);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @desc    Get all repair logs
// @route   GET /api/service-logs/type/repair
// @access  Private
router.get('/type/repair', protect, async (req, res) => {
    try {
        const logs = await ServiceLog.find({ logType: "Repair" })
            .populate('device', 'assetTag assignedUser deviceType brand model')
            .sort({ serviceDate: -1 });
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @desc    Get single service log
// @route   GET /api/service-logs/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const log = await ServiceLog.findById(req.params.id).populate('device');
        if (!log) return res.status(404).json({ error: 'Service log not found' });
        res.json(log);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @desc    Update service log
// @route   PUT /api/service-logs/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const log = await ServiceLog.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!log) return res.status(404).json({ error: 'Service log not found' });
        res.json(log);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// @desc    Delete service log
// @route   DELETE /api/service-logs/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const log = await ServiceLog.findByIdAndDelete(req.params.id);
        if (!log) return res.status(404).json({ error: 'Service log not found' });
        res.json({ message: 'Service log deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
