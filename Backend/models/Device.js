const mongoose = require("mongoose");

const DeviceSchema = new mongoose.Schema({
    deviceType: String,
    brand: String,
    model: String,
    serialNumber: { type: String, unique: true },
    assetTag: String,
    department: String,
    assignedUser: String,
    purchaseDate: Date,
    purchasePrice: Number,
    warrantyExpiryDate: Date,
    status: {
        type: String,
        enum: ["Active", "Under Repair", "Retired"]
    },
    hardwareConfig: {
        cpu: String,
        ram: String,
        storageType: {
            type: String,
            enum: ["HDD", "SSD", "NVMe"]
        },
        storageCapacity: String,
        operatingSystem: {
            type: String,
            enum: ["Windows 10", "Windows 11", "macOS", "Linux", "Other"]
        }
    }
}, { timestamps: true });

module.exports = mongoose.model("Device", DeviceSchema);
