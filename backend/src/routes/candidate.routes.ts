import { Router } from 'express';
import { candidateController } from '../controllers/candidate.controller';

const router = Router();

router.get('/', candidateController.getAll);
router.get('/user/:userId', candidateController.getByUserId);
router.get('/:id', candidateController.getById);
router.post('/', candidateController.create);
router.put('/:id', candidateController.update);
router.delete('/:id', candidateController.delete);

export default router;
