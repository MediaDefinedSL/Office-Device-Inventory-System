const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existing = await User.findOne({ email: 'admin@office.com' });
    if (existing) {
        // Promote to Admin if exists
        existing.role = 'Admin';
        await existing.save({ validateBeforeSave: false });
        console.log('✅ Existing user promoted to Admin:', existing.email);
    } else {
        // Create new admin user
        const admin = await User.create({
            name: 'System Admin',
            email: 'admin@office.com',
            password: 'admin123',
            role: 'Admin'
        });
        console.log('✅ Admin user created!');
        console.log('   Email:    admin@office.com');
        console.log('   Password: admin123');
        console.log('   Role:     Admin');
    }

    mongoose.disconnect();
    console.log('Done!');
}).catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});
