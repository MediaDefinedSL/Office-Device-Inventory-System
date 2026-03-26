const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

// Load env from Backend/.env
dotenv.config({ path: path.join(__dirname, "Backend", ".env") });

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes (from Backend)
const authRoutes = require("./Backend/routes/authRoutes");
app.use("/api/auth", authRoutes);

const deviceRoutes = require("./Backend/routes/deviceRoutes");
app.use("/api/devices", deviceRoutes);

const analyticsRoutes = require("./Backend/routes/analyticsRoutes");
app.use("/api/analytics", analyticsRoutes);

const serviceLogRoutes = require("./Backend/routes/serviceLogRoutes");
app.use("/api/service-logs", serviceLogRoutes);

const userRoutes = require("./Backend/routes/userRoutes");
app.use("/api/users", userRoutes);

const notificationRoutes = require("./Backend/routes/notificationRoutes");
app.use("/api/notifications", notificationRoutes);

const ticketRoutes = require("./Backend/routes/ticketRoutes");
app.use("/api/tickets", ticketRoutes);

// Serve Frontend static files
app.use(express.static(path.join(__dirname, "Frontend", "dist")));

// SPA fallback - serve index.html for any non-API route
app.get("*path", (req, res) => {
    res.sendFile(path.join(__dirname, "Frontend", "dist", "index.html"));
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || "Internal Server Error",
    });
});

// Database Connection & Start Server
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("MongoDB connection failed:", err);
    });
