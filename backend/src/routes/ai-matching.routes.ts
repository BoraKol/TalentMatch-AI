import { Router } from 'express';
import { aiMatchingService } from '../services/ai-matching.service';

const router = Router();

// Find top candidates for a job using AI (with fallback to quick-match)
router.post('/find-candidates', async (req, res) => {
    try {
        const { jobId, forceRefresh } = req.body;

        if (!jobId) {
            return res.status(400).json({ error: 'jobId is required' });
        }

        console.log(`AI Matching: Starting analysis for job ${jobId} (forceRefresh: ${!!forceRefresh})`);

        try {
            // Try AI matching first
            const result = await aiMatchingService.findTopCandidates(jobId, !!forceRefresh);
            console.log(`AI Matching: Success - found ${result.matches.length} matches`);
            res.json(result);
        } catch (aiError: any) {
            // If AI fails, fallback to quick-match
            console.error('AI Matching failed, falling back to quick-match:', aiError.message);
            const fallbackResult = await aiMatchingService.quickMatch(jobId);
            console.log(`Quick Match: Success - found ${fallbackResult.matches.length} matches`);
            res.json({
                ...fallbackResult,
                note: 'AI analysis unavailable, showing skill-based matches'
            });
        }
    } catch (error: any) {
        console.error('AI Matching Error (complete failure):', error);
        res.status(500).json({ error: error.message || 'Failed to find candidates' });
    }
});

// Quick match without AI (explicit fallback)
router.post('/quick-match', async (req, res) => {
    try {
        const { jobId } = req.body;

        if (!jobId) {
            return res.status(400).json({ error: 'jobId is required' });
        }

        const result = await aiMatchingService.quickMatch(jobId);
        res.json(result);
    } catch (error: any) {
        console.error('Quick Match Error:', error);
        res.status(500).json({ error: error.message || 'Failed to find candidates' });
    }
});

export default router;

