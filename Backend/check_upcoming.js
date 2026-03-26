const mongoose = require('mongoose');
require('dotenv').config();

const ServiceLogSchema = new mongoose.Schema({
    device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device' },
    nextServiceDate: Date,
    description: String
});
const DeviceSchema = new mongoose.Schema({
    assetTag: String,
    model: String,
    deviceType: String
});

const ServiceLog = mongoose.model('ServiceLogCheck', ServiceLogSchema, 'servicelogs');
const Device = mongoose.model('DeviceCheck', DeviceSchema, 'devices');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const logs = await ServiceLog.find({ nextServiceDate: { $exists: true } }).lean();
        console.log(`Total logs with nextServiceDate: ${logs.length}`);
        logs.forEach(l => {
            console.log(`- Device ID: ${l.device}, Next Date: ${l.nextServiceDate}, ID: ${l._id}`);
        });

        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

check();
