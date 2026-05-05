const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
    purchaseDate: { type: Date, required: true, default: Date.now },
    vendor: { type: String },
    invoiceNumber: { type: String },
    totalCost: { type: Number, default: 0 },
    items: [{
        itemName: { type: String, required: true },
        category: { type: String, enum: ["Battery", "RAM", "Storage", "Display", "Accessory", "Other"], default: "Other" },
        price: { type: Number, required: true },
        warrantyExpiryDate: { type: Date },
        assignedDevice: { type: mongoose.Schema.Types.ObjectId, ref: 'Device' },
        assignedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['Installed', 'In Stock'], default: 'Installed' },
        notes: { type: String }
    }],
    purchasedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Purchase', purchaseSchema);
