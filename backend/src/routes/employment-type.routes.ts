import { Router } from 'express';

const router = Router();

// Employment Types Resource
import EmploymentType from '../models/employment-type.model';

// GET all employment types
router.get('/', async (req, res) => {
    try {
        const types = await EmploymentType.find().sort({ createdAt: -1 });
        res.json(types);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST create new employment type
router.post('/', async (req, res) => {
    try {
        const newType = await EmploymentType.create(req.body);
        res.status(201).json(newType);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// PATCH update employment type
router.patch('/:id', async (req, res) => {
    try {
        const updated = await EmploymentType.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE employment type
router.delete('/:id', async (req, res) => {
    try {
        await EmploymentType.findByIdAndDelete(req.params.id);
        res.json({ message: 'Employment type deleted' });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

export default router;
