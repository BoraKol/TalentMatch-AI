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

export const getSkillById = async (req: Request, res: Response) => {
    try {
        const skill = await Skill.findById(req.params.id);
        if (!skill) {
            return res.status(404).json({ error: 'Skill not found' });
        }
        res.json(skill);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const updateSkill = async (req: Request, res: Response) => {
    try {
        const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!skill) {
            return res.status(404).json({ error: 'Skill not found' });
        }
        res.json(skill);
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

export const getEmploymentTypeById = async (req: Request, res: Response) => {
    try {
        const type = await EmploymentType.findById(req.params.id);
        if (!type) {
            return res.status(404).json({ error: 'Employment type not found' });
        }
        res.json(type);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const updateEmploymentType = async (req: Request, res: Response) => {
    try {
        const type = await EmploymentType.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!type) {
            return res.status(404).json({ error: 'Employment type not found' });
        }
        res.json(type);
    } catch (err: any) { res.status(400).json({ error: err.message }); }
};

export const getAlgorithmSettings = async (req: Request, res: Response) => {
    try {
        // Find specific settings keys or return all
        const settings = await AppSetting.find({ key: { $regex: 'Algorithm.*' } });
        // Return only the value part which contains the actual setting object
        res.json(settings.map(s => s.value));
    } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const updateAlgorithmSettings = async (req: Request, res: Response) => {
    try {
        const { settings } = req.body;

        if (!settings || !Array.isArray(settings)) {
            return res.status(400).json({ error: 'Invalid settings format' });
        }

        for (const setting of settings) {
            await AppSetting.findOneAndUpdate(
                { key: `Algorithm.${setting.slug}` },
                {
                    key: `Algorithm.${setting.slug}`,
                    value: setting
                },
                { upsert: true, new: true }
            );
        }
        res.json({ message: 'Settings updated' });
    } catch (err: any) { res.status(400).json({ error: err.message }); }
};
