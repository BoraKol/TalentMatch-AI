import { Request, Response } from 'express';
import Skill from '../models/skill.model';
import EmploymentType from '../models/employment-type.model';
import AppSetting from '../models/app-setting.model';

export const getSkills = async (req: Request, res: Response) => {
    try {
        const skills = await Skill.find({ isActive: true });
        res.json(skills);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const addSkill = async (req: Request, res: Response) => {
    try {
        const skill = await Skill.create(req.body);
        res.status(201).json(skill);
    } catch (err: any) { res.status(400).json({ error: err.message }); }
};

export const getEmploymentTypes = async (req: Request, res: Response) => {
    try {
        const types = await EmploymentType.find({ isActive: true });
        res.json(types);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const addEmploymentType = async (req: Request, res: Response) => {
    try {
        const type = await EmploymentType.create(req.body);
        res.status(201).json(type);
    } catch (err: any) { res.status(400).json({ error: err.message }); }
};

export const getAlgorithmSettings = async (req: Request, res: Response) => {
    try {
        // Find specific settings keys or return all
        const settings = await AppSetting.find({ key: { $regex: 'Algorithm.*' } });
        res.json(settings);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const updateAlgorithmSettings = async (req: Request, res: Response) => {
    try {
        const updates = req.body; // Expect array of { key, value } or object
        // Implementation for bulk update or single update
        // For simplicity assuming single update for now or simple key-value body
        for (const [key, value] of Object.entries(updates)) {
            await AppSetting.findOneAndUpdate({ key }, { value, key }, { upsert: true, new: true });
        }
        res.json({ message: 'Settings updated' });
    } catch (err: any) { res.status(400).json({ error: err.message }); }
};
