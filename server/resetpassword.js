// resetpassword.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');

async function resetPassword() {
    await mongoose.connect(process.env.MONGO_URI);
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('newpassword123', salt);
    
    await User.findOneAndUpdate(
        { email: 'idk@gmail.com' },
        { password: hashedPassword }
    );
    
    console.log('Password reset successfully!');
    mongoose.disconnect();
}

resetPassword();