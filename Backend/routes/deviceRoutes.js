const express = require("express");
const router = express.Router();

const Device = require("../models/Device");
const { protect, authorize } = require("../middleware/authMiddleware");

// Add Device (Admin only)
router.post("/", protect, authorize('Admin'), async (req, res) => {
    try {
        const device = new Device(req.body);
        await device.save();
        res.status(201).json(device);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Add My Device (Employee)
router.post("/my-device", protect, async (req, res) => {
    try {
        const { deviceType, brand, model, serialNumber, hardwareConfig } = req.body;
        
        const existingDevice = await Device.findOne({ serialNumber });
        if (existingDevice) {
            return res.status(400).json({ error: "A device with this serial number already exists." });
        }

        const device = new Device({
            deviceType,
            brand,
            model,
            serialNumber,
            hardwareConfig,
            assignedUser: req.user.name,
            status: 'Active'
        });
        await device.save();
        res.status(201).json(device);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get All Devices
router.get("/", protect, async (req, res) => {
    try {
        const devices = await Device.find();
        res.json(devices);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get My Devices (Employee)
router.get("/my-devices", protect, async (req, res) => {
    try {
        // Find devices where assignedUser exactly matches the logged-in user's name
        const devices = await Device.find({ 
            assignedUser: new RegExp(`^${req.user.name}$`, 'i')
        });
        res.json(devices);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Devices Under Repair
router.get("/status/under-repair", protect, async (req, res) => {
    try {
        const ServiceLog = require("../models/ServiceLog");
        const devices = await Device.find({ status: "Under Repair" }).lean();

        // For each device, find its latest repair log
        const devicesWithLogs = await Promise.all(devices.map(async (device) => {
            const latestLog = await ServiceLog.findOne({
                device: device._id,
                logType: "Repair"
            }).sort({ serviceDate: -1 });

            return {
                ...device,
                latestRepairLog: latestLog
            };
        }));

        res.json(devicesWithLogs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Single Device
router.get("/:id", protect, async (req, res) => {
    try {
        const device = await Device.findById(req.params.id);
        if (!device) return res.status(404).json({ error: "Device not found" });
        res.json(device);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Device (Admin only)
router.put("/:id", protect, authorize('Admin'), async (req, res) => {
    try {
        const oldDevice = await Device.findById(req.params.id);
        if (!oldDevice) return res.status(404).json({ error: "Device not found" });

        const device = await Device.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

        // If status changed, create a service log entry
        if (req.body.status && req.body.status !== oldDevice.status) {
            try {
                const ServiceLog = require("../models/ServiceLog");
                const newLog = new ServiceLog({
                    device: device._id,
                    serviceDate: new Date(),
                    description: `Device status updated from "${oldDevice.status}" to "${req.body.status}"`,
                    servicedBy: "System (Inventory Update)",
                    cost: 0
                });
                await newLog.save();
                console.log(`✅ Auto-logged status change for device ${device.assetTag}`);
            } catch (logError) {
                console.error("❌ Failed to create auto service log:", logError);
                // We don't want to fail the whole update if logging fails, but we want to know
            }
        }

        res.json(device);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete Device (Admin only)
router.delete("/:id", protect, authorize('Admin'), async (req, res) => {
    try {
        const device = await Device.findByIdAndDelete(req.params.id);
        if (!device) return res.status(404).json({ error: "Device not found" });
        res.json({ message: "Device deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;
