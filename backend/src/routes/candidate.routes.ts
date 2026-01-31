import { Router } from 'express';
import { getCandidates, createCandidate, inviteCandidate } from '../controllers/candidate.controller';

const router = Router();

router.get('/', getCandidates);
router.post('/', createCandidate);
router.post('/:id/invite', inviteCandidate);

export default router;
