import { Request, Response } from 'express';
import User from '../models/user.model';
import Institution from '../models/institution.model';

export class AdminController {

    // Get all users/institutions requiring validation
    async getPendingValidations(req: Request, res: Response) {
        try {
            const pendingInstitutions = await Institution.find({ status: 'pending' });
            const pendingEmployers = await User.find({
                role: 'employer',
                isActive: false
            }).populate('institution');

            res.json({
                institutions: pendingInstitutions,
                employers: pendingEmployers
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // Approve an institution and its admin
    async approveInstitution(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const institution = await Institution.findByIdAndUpdate(id, { status: 'active' }, { new: true });

            if (!institution) {
                return res.status(404).json({ error: 'Institution not found' });
            }

            // Also activate the admin user associated with this institution
            await User.findOneAndUpdate(
                { email: institution.adminEmail, role: 'institution_admin' },
                { isActive: true }
            );

            res.json({ message: 'Institution and admin approved successfully', institution });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // Approve a specific employer
    async approveEmployer(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const user = await User.findByIdAndUpdate(id, { isActive: true }, { new: true });

            if (!user) {
                return res.status(404).json({ error: 'Employer not found' });
            }

            res.json({ message: 'Employer approved successfully', user });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // Reject/Suspend (Generic)
    async rejectValidation(req: Request, res: Response) {
        try {
            const { type, id } = req.body; // type: 'user' | 'institution'

            if (type === 'institution') {
                await Institution.findByIdAndUpdate(id, { status: 'suspended' });
                // Optionally deactivate associated users
            } else {
                await User.findByIdAndUpdate(id, { isActive: false });
            }

            res.json({ message: 'Validation rejected/suspended' });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}

export const adminController = new AdminController();
