const Notification = require('../models/Notification');
const ServiceLog = require('../models/ServiceLog');
const Device = require('../models/Device');

// @desc    Get all notifications for current user
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
    try {
        // First, check for upcoming services and generate notifications
        await checkAndGenerateServiceNotifications(req.user.id);

        const notifications = await Notification.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50);

        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (notification) {
            if (notification.userId.toString() !== req.user.id) {
                return res.status(401).json({ message: 'Not authorized' });
            }
            notification.isRead = true;
            await notification.save();
            res.json(notification);
        } else {
            res.status(404).json({ message: 'Notification not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user.id, isRead: false },
            { isRead: true }
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (notification) {
            if (notification.userId.toString() !== req.user.id) {
                return res.status(401).json({ message: 'Not authorized' });
            }
            await notification.deleteOne();
            res.json({ message: 'Notification removed' });
        } else {
            res.status(404).json({ message: 'Notification not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper function to check for upcoming services and generate notifications
const checkAndGenerateServiceNotifications = async (userId) => {
    try {
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Start of today

        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        sevenDaysFromNow.setHours(23, 59, 59, 999); // End of 7th day

        console.log(`Checking notifications for user ${userId} between ${now.toISOString()} and ${sevenDaysFromNow.toISOString()}`);

        const upcomingServices = await ServiceLog.find({
            nextServiceDate: { $lte: sevenDaysFromNow, $gte: now }
        }).populate('device');

        console.log(`Found ${upcomingServices.length} upcoming service logs`);

        for (const log of upcomingServices) {
            if (!log.device) {
                console.log(`Log ${log._id} has no associated device, skipping.`);
                continue;
            }

            console.log(`Evaluating notification for device ${log.device.assetTag}, next service: ${log.nextServiceDate}`);

            const existingNotification = await Notification.findOne({
                userId,
                'metadata.serviceLogId': log._id,
                type: 'warning'
            });

            if (!existingNotification) {
                console.log(`Creating new notification for ${log.device.assetTag}`);
                await Notification.create({
                    userId,
                    type: 'warning',
                    title: 'Service Due Soon',
                    message: `Device ${log.device.assetTag} (${log.device.model}) is due for service on ${new Date(log.nextServiceDate).toLocaleDateString()}.`,
                    link: `/service-logs`,
                    metadata: {
                        deviceId: log.device._id,
                        serviceLogId: log._id
                    }
                });
            } else {
                console.log(`Notification already exists for ${log.device.assetTag} (log: ${log._id})`);
            }
        }
    } catch (error) {
        console.error('Error generating notifications:', error);
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
};
