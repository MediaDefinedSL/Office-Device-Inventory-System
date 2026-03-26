const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['info', 'warning', 'success', 'error'],
        default: 'info'
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    link: {
        type: String
    },
    metadata: {
        deviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Device'
        },
        serviceLogId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ServiceLog'
        }
    }
}, { timestamps: true });

module.exports = mongoose.model("Notification", NotificationSchema);
