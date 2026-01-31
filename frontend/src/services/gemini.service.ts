import { Injectable } from '@angular/core';
import { GoogleGenAI, Type } from '@google/genai';

import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: environment.geminiApiKey });
  }

  async findTopCandidates(jobDescription: any, candidates: any[], settings: any) {
    const model = this.ai.models;
    // Construct a context-aware prompt
    const promptContext = `
      You are an expert HR Recruiter and AI Talent Matcher.
      
      JOB DESCRIPTION:
      Title: ${jobDescription.title}
      Type: ${jobDescription.type} 
      Description: ${jobDescription.description}
      Required Skills: ${jobDescription.primarySkills.join(', ')}
      Bonus Skills: ${jobDescription.secondarySkills.join(', ')}

      CANDIDATE POOL:
      ${JSON.stringify(candidates.map(c => ({
      id: c.id,
      name: c.name,
      title: c.role,
      skills: c.skills,
      experience: c.experience,
      bio: c.bio
    })))}

      TASK:
      Analyze the candidates and find the top 3 matches for this job.
      Return a JSON array of objects.
      
      OUTPUT FORMAT:
      [
        {
          "candidateId": "exact_id_from_pool",
          "matchPercentage": 85,
          "analysis": "1-sentence explanation...",
          "strengths": ["skill1", "skill2"]
        }
      ]
      
      Strictly return ONLY valid JSON.
    `;

    try {
      const response = await model.generateContent({
        model: 'gemini-2.5-flash',
        contents: promptContext,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                candidateId: { type: Type.STRING },
                matchPercentage: { type: Type.INTEGER, description: "0-100 score" },
                analysis: { type: Type.STRING, description: "Why this candidate is a good fit (2 sentences max)" },
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            }
          }
        }
      });

      return JSON.parse(response.text);
    } catch (error) {
      console.error('Gemini API Error:', error);
      return [];
    }
  }
}