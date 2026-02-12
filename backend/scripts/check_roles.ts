
import mongoose from 'mongoose';
import User from '../src/models/user.model';
import { config } from '../src/config';

const checkRoles = async () => {
    try {
        await mongoose.connect(config.mongoUri);
        console.log('Connected to MongoDB');

        const users = await User.find({}, 'email role firstName lastName institution');

        console.log('--- User Roles ---');
        users.forEach(u => {
            console.log(`${u.email}: ${u.role} (Inst: ${u.institution})`);
        });
        console.log('------------------');

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

checkRoles();
