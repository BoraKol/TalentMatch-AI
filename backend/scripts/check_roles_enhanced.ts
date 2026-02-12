
import mongoose from 'mongoose';
import User from '../src/models/user.model';
import Employer from '../src/models/employer.model';
import Institution from '../src/models/institution.model';
import { config } from '../src/config';

const checkRoles = async () => {
    try {
        await mongoose.connect(config.mongoUri);
        console.log('Connected to MongoDB');

        const users = await User.find({}, 'email role firstName lastName institution');

        console.log('--- User Analysis ---');
        for (const u of users) {
            const emp = await Employer.findOne({ user: u._id });
            const inst = u.institution ? await Institution.findById(u.institution) : null;

            let status = '';
            if (u.role === 'institution_admin' && emp) {
                status = '⚠️ POTENTIAL MISMATCH: Role is institution_admin but has Employer record';
            } else if (u.role === 'employer' && !emp) {
                status = '⚠️ ERROR: Role is employer but NO Employer record';
            }

            console.log(`User: ${u.email} | Role: ${u.role}`);
            if (inst) console.log(`  -> Inst: ${inst.name} (${inst.institutionType})`);
            if (emp) console.log(`  -> Employer: ${emp.name} (Ind: ${emp.industry})`);
            if (status) console.log(`  -> ${status}`);
            console.log('---');
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

checkRoles();
