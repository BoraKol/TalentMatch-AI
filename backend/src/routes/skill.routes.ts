import { Router, Request, Response } from 'express';

const router = Router();

// Skills Resource
import Skill from '../models/skill.model';

// GET all skills
router.get('/', async (req, res) => {
    try {
        const skills = await Skill.find().sort({ createdAt: -1 });
        res.json(skills);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST create new skill
router.post('/', async (req, res) => {
    try {
        const newSkill = await Skill.create(req.body);
        res.status(201).json(newSkill);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// POST import skills from CSV (accepts JSON array)
router.post('/import', async (req: Request, res: Response) => {
    try {
        const { skills } = req.body;

        if (!skills || !Array.isArray(skills)) {
            return res.status(400).json({ error: 'Skills array is required' });
        }

        let imported = 0;
        for (const skill of skills) {
            if (skill.name) {
                await Skill.findOneAndUpdate(
                    { name: skill.name },
                    { name: skill.name, isActive: skill.isActive !== false },
                    { upsert: true }
                );
                imported++;
            }
        }

        res.json({ message: `Successfully imported ${imported} skills` });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// PATCH update skill
router.patch('/:id', async (req, res) => {
    try {
        const updated = await Skill.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE skill
router.delete('/:id', async (req, res) => {
    try {
        await Skill.findByIdAndDelete(req.params.id);
        res.json({ message: 'Skill deleted' });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

export default router;
