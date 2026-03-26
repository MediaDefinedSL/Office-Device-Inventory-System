const express = require("express");
const router = express.Router();
const Ticket = require("../models/Ticket");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { protect, authorize } = require("../middleware/authMiddleware");

// Submit a new ticket (Employee)
router.post("/", protect, async (req, res) => {
    try {
        const { device, issueDescription, priority } = req.body;
        const newTicket = new Ticket({
            device,
            reportedBy: req.user._id,
            issueDescription,
            priority
        });
        await newTicket.save();

        // Generate notifications for Admins
        const admins = await User.find({ role: 'Admin' });
        const notifications = admins.map(admin => ({
            userId: admin._id,
            type: priority === 'High' ? 'error' : 'warning',
            title: 'New IT Ticket Created',
            message: `A new ${priority} priority ticket has been reported.`,
            link: '/tickets',
            metadata: {
                deviceId: device,
                ticketId: newTicket._id
            }
        }));
        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

        res.status(201).json(newTicket);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get user's own tickets (Employee)
router.get("/my-tickets", protect, async (req, res) => {
    try {
        const tickets = await Ticket.find({ reportedBy: req.user._id })
            .populate('device', 'brand model assetTag serialNumber')
            .sort({ createdAt: -1 });
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all tickets (IT Admin)
router.get("/", protect, authorize('Admin'), async (req, res) => {
    try {
        const tickets = await Ticket.find()
            .populate('device', 'brand model assetTag serialNumber')
            .populate('reportedBy', 'name email')
            .sort({ createdAt: -1 });
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update ticket status (IT Admin)
router.put("/:id", protect, authorize('Admin'), async (req, res) => {
    try {
        const { status, adminNotes } = req.body;
        const ticket = await Ticket.findByIdAndUpdate(
            req.params.id, 
            { status, adminNotes }, 
            { new: true, runValidators: true }
        )
        .populate('device', 'brand model assetTag serialNumber')
        .populate('reportedBy', 'name email');
        
        if (!ticket) return res.status(404).json({ error: "Ticket not found" });

        // Notify the User who reported it
        if (ticket.reportedBy) {
            await Notification.create({
                userId: ticket.reportedBy._id,
                type: status === 'Resolved' ? 'success' : 'info',
                title: 'IT Ticket Updated',
                message: `Your IT ticket for ${ticket.device ? ticket.device.brand + ' ' + ticket.device.model : 'your device'} is now: ${status}.`,
                link: '/'
            });
        }

        res.json(ticket);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete ticket (IT Admin)
router.delete("/:id", protect, authorize('Admin'), async (req, res) => {
    try {
        const ticket = await Ticket.findByIdAndDelete(req.params.id);

        if (!ticket) return res.status(404).json({ error: "Ticket not found" });

        res.json({ message: "Ticket deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
