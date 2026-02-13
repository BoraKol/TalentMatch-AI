import { Router } from 'express';
import { referralController } from '../controllers/referral.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

// === Super Admin Routes ===
// Get all candidates for referral selection
router.get('/candidates',
    authenticate,
    requireRole('super_admin', 'institution_admin'),
    (req, res) => referralController.getCandidatesForReferral(req, res)
);

// Get AI-matched jobs for a specific candidate
router.get('/matches/:candidateId',
    authenticate,
    requireRole('super_admin', 'institution_admin'),
    (req, res) => referralController.getMatchesForCandidate(req, res)
);

// Create a referral
router.post('/',
    authenticate,
    requireRole('super_admin', 'institution_admin'),
    (req, res) => referralController.createReferral(req, res)
);

// Get all referrals (admin view)
router.get('/',
    authenticate,
    requireRole('super_admin', 'institution_admin'),
    (req, res) => referralController.getAllReferrals(req, res)
);

// Update referral status
router.patch('/:referralId/status',
    authenticate,
    requireRole('super_admin'),
    (req, res) => referralController.updateReferralStatus(req, res)
);

// === Candidate Routes ===
// Get my referrals
router.get('/my',
    authenticate,
    (req, res) => referralController.getMyReferrals(req, res)
);

// Respond to a referral (accept/decline)
router.patch('/:referralId/respond',
    authenticate,
    (req, res) => referralController.respondToReferral(req, res)
);

router.post('/auto-match',
    authenticate,
    requireRole('super_admin', 'institution_admin'),
    (req, res) => referralController.autoMatch(req, res)
);

export default router;
