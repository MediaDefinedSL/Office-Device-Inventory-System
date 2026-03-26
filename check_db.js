const mongoose = require('mongoose');

const uri = "mongodb+srv://admin:UHDbol0aZurmIUH8@officedevice.tzejvgt.mongodb.net/";

async function check() {
    try {
        await mongoose.connect(uri);
        console.log('Connected');

        const Device = mongoose.model('Device', new mongoose.Schema({
            status: String,
            assetTag: String
        }));

        const count = await Device.countDocuments({ status: 'Under Repair' });
        console.log('COUNT:' + count);

        const devices = await Device.find({ status: 'Under Repair' });
        console.log('DEVICES:' + JSON.stringify(devices));

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

check();
