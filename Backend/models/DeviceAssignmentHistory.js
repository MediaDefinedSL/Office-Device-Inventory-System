const mongoose = require('mongoose');

const deviceAssignmentHistorySchema = new mongoose.Schema({
    device: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Device',
        required: true
    },
    previousUser: {
        type: String,
        default: null
    },
    newUser: {
        type: String,
        default: null
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedByName: {
        type: String,
        required: true
    },
    assignmentDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    notes: {
        type: String
    },
    reassignmentReason: {
        type: String,
        enum: ['New Purchase', 'Employee Transfer', 'Replacement', 'Repair Return', 'Other'],
        default: 'Other'
    }
}, { timestamps: true });

// Index for faster queries by device
deviceAssignmentHistorySchema.index({ device: 1, assignmentDate: -1 });

module.exports = mongoose.model('DeviceAssignmentHistory', deviceAssignmentHistorySchema);
