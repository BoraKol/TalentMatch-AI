
import mongoose from 'mongoose';
import User from '../src/models/user.model';
import Employer from '../src/models/employer.model';
import Institution from '../src/models/institution.model';
import { config } from '../src/config';

const repairEmployers = async () => {
    try {
        await mongoose.connect(config.mongoUri);
        console.log('Connected to MongoDB');

        // Find all employers
        const users = await User.find({ role: 'employer' });

        console.log(`Found ${users.length} employers to check...`);

        let repairedCount = 0;

        for (const user of users) {
            if (!user.institution) continue;

            const existingEmployer = await Employer.findOne({ user: user._id });

            if (!existingEmployer) {
                const inst = await Institution.findById(user.institution);

                if (inst) {
                    console.log(`Repairing User: ${user.email} (Institution: ${inst.name})`);

                    await Employer.create({
                        user: user._id,
                        institution: inst._id,
                        name: inst.name,
                        industry: 'Technology',
                        website: inst.website,
                        contactEmail: user.email,
                        description: `Employer account for ${inst.name}`
                    });
                    console.log('  -> Created missing Employer record');
                    repairedCount++;
                } else {
                    console.log(`User ${user.email} has institution ID but Institution not found.`);
                }
            }
        }

        console.log('---------------------------------------------------');
        console.log(`Repair Complete. Repaired ${repairedCount} users.`);
        console.log('---------------------------------------------------');

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

repairEmployers();
