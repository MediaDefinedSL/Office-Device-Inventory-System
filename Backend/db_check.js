const mongoose = require('mongoose');
require('dotenv').config();

const ServiceLogSchema = new mongoose.Schema({
    device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device' },
    nextServiceDate: Date,
    description: String
});
const DeviceSchema = new mongoose.Schema({
    assetTag: String,
    model: String
});

const ServiceLog = mongoose.model('ServiceLogCheck', ServiceLogSchema, 'servicelogs');
const Device = mongoose.model('DeviceCheck', DeviceSchema, 'devices');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const now = new Date();
        const sevenDays = new Date();
        sevenDays.setDate(sevenDays.getDate() + 7);

        const logs = await ServiceLog.find({
            nextServiceDate: { $lte: sevenDays, $gte: now }
        }).lean();

        console.log(`Found ${logs.length} logs due in next 7 days:`);
        console.log(JSON.stringify(logs, null, 2));

        const allLogsWithNextDate = await ServiceLog.find({
            nextServiceDate: { $exists: true }
        }).lean();
        console.log(`Total logs with nextServiceDate: ${allLogsWithNextDate.length}`);
        allLogsWithNextDate.forEach(l => {
            console.log(`- Device ID: ${l.device}, Next Date: ${l.nextServiceDate}`);
        });

        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

check();
