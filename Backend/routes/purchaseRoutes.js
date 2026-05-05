const express = require("express");
const router = express.Router();
const Purchase = require("../models/Purchase");
const { protect, authorize } = require("../middleware/authMiddleware");

// Create a new purchase
router.post("/", protect, authorize('Admin'), async (req, res) => {
    try {
        const { purchaseDate, vendor, invoiceNumber, items } = req.body;
        
        let totalCost = 0;
        if (items && items.length > 0) {
            totalCost = items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
        }

        const newPurchase = new Purchase({
            purchaseDate,
            vendor,
            invoiceNumber,
            totalCost,
            items,
            purchasedBy: req.user._id
        });

        await newPurchase.save();
        res.status(201).json(newPurchase);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get all purchases
router.get("/", protect, authorize('Admin'), async (req, res) => {
    try {
        const purchases = await Purchase.find()
            .populate('purchasedBy', 'name email')
            .populate('items.assignedDevice', 'brand model assetTag')
            .populate('items.assignedUser', 'name email')
            .sort({ purchaseDate: -1, createdAt: -1 });
        res.json(purchases);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a purchase
router.delete("/:id", protect, authorize('Admin'), async (req, res) => {
    try {
        const purchase = await Purchase.findByIdAndDelete(req.params.id);
        if (!purchase) return res.status(404).json({ error: "Purchase not found" });
        res.json({ message: "Purchase deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
