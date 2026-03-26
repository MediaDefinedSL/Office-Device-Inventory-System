const mongoose = require('mongoose');
require('dotenv').config({ path: './Backend/.env' });

const ServiceLogSchema = new mongoose.Schema({
    device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device' },
    nextServiceDate: Date
});

const ServiceLog = mongoose.model('ServiceLogCheck', ServiceLogSchema, 'servicelogs');

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const logs = await ServiceLog.find({ nextServiceDate: { $exists: true } }).lean();
    console.log(JSON.stringify(logs, null, 2));
    await mongoose.connection.close();
}

check();
