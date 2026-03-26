const mongoose = require('mongoose');

const serviceLogSchema = new mongoose.Schema({
    device: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Device',
        required: true
    },
    serviceDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    servicedBy: {
        type: String,
        required: true
    },
    cost: {
        type: Number,
        default: 0
    },
    nextServiceDate: {
        type: Date
    },
    expectedReadyDate: {
        type: Date
    },
    logType: {
        type: String,
        enum: ["Service", "Repair"],
        default: "Service"
    },
    comments: {
        type: String
    },
    additionalServicers: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ServiceLog', serviceLogSchema);
