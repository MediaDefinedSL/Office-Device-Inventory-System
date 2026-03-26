const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

// Load env
dotenv.config({ path: path.join(__dirname, "..", "Backend", ".env") });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection caching for serverless
let isConnected = false;

async function connectDB() {
    if (isConnected) return;
    try {
        await mongoose.connect(process.env.MONGO_URI);
        isConnected = true;
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("MongoDB connection failed:", err);
        throw err;
    }
}

// Connect before handling routes
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        res.status(500).json({ error: "Database connection failed" });
    }
});

// API Routes
const authRoutes = require("../Backend/routes/authRoutes");
app.use("/api/auth", authRoutes);

const deviceRoutes = require("../Backend/routes/deviceRoutes");
app.use("/api/devices", deviceRoutes);

const analyticsRoutes = require("../Backend/routes/analyticsRoutes");
app.use("/api/analytics", analyticsRoutes);

const serviceLogRoutes = require("../Backend/routes/serviceLogRoutes");
app.use("/api/service-logs", serviceLogRoutes);

const userRoutes = require("../Backend/routes/userRoutes");
app.use("/api/users", userRoutes);

const notificationRoutes = require("../Backend/routes/notificationRoutes");
app.use("/api/notifications", notificationRoutes);

const ticketRoutes = require("../Backend/routes/ticketRoutes");
app.use("/api/tickets", ticketRoutes);

// Health check
app.get("/api", (req, res) => {
    res.json({ message: "Office Device Inventory API is running!" });
});

module.exports = app;
