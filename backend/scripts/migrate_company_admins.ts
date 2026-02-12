
import mongoose from 'mongoose';
import User from '../src/models/user.model';
import Employer from '../src/models/employer.model';
import Institution from '../src/models/institution.model';
import { config } from '../src/config';

const migrateCompanyAdmins = async () => {
    try {
        await mongoose.connect(config.mongoUri);
        console.log('Connected to MongoDB');

        try {
            await Employer.collection.dropIndex('name_1');
            console.log('Dropped unique index "name_1" on employers collection');
        } catch (e) {
            console.log('Index "name_1" not found or already dropped');
        }

        // Find all institution_admins
        const users = await User.find({ role: 'institution_admin' });

        console.log(`Found ${users.length} institution_admins to check...`);

        let migratedCount = 0;

        for (const user of users) {
            if (!user.institution) continue;

            const inst = await Institution.findById(user.institution);

            if (inst && inst.institutionType === 'company') {
                console.log(`Migrating User: ${user.email} (Institution: ${inst.name})`);

                // 1. Update Role to 'employer'
                user.role = 'employer';
                await user.save();
                console.log('  -> Role updated to "employer"');

                // 2. Check/Create Employer Record
                const existingEmployer = await Employer.findOne({ user: user._id });
                if (!existingEmployer) {
                    await Employer.create({
                        user: user._id,
                        institution: inst._id,
                        name: inst.name,
                        industry: 'Technology', // Default since we don't have it on Institution
                        website: inst.website,
                        contactEmail: user.email,
                        description: `Employer account for ${inst.name}`
                    });
                    console.log('  -> Created missing Employer record');
                } else {
                    console.log('  -> Employer record already exists');
                }

                migratedCount++;
            }
        }

        console.log('---------------------------------------------------');
        console.log(`Migration Complete. Migrated ${migratedCount} users.`);
        console.log('---------------------------------------------------');

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

migrateCompanyAdmins();
