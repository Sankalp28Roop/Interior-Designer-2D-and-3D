import { callGeminiEnhancer } from '../services/promptEnhancer.js';
import { db } from '../config/database.js';
import { generateId, safeJsonStringify } from '../utils/helpers.js';

export async function enhancePromptHandler(req, res) {
  try {
    const { prompt, projectId, sessionId } = req.body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a non-empty prompt.'
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const result = await callGeminiEnhancer(prompt.trim(), apiKey);

    // If a sessionId or projectId is provided, record it in chat messages
    if (sessionId) {
      try {
        const msgId = generateId('msg');
        db.prepare(`
          INSERT INTO chat_messages (
            id, session_id, sender, original_text, detected_language,
            enhanced_prompt, classified_intent, payload
          ) VALUES (?, ?, 'user', ?, ?, ?, ?, ?)
        `).run(
          msgId,
          sessionId,
          prompt.trim(),
          result.detectedLanguage,
          result.enhancedPrompt,
          result.intent,
          safeJsonStringify(result.metadata)
        );
      } catch (dbErr) {
        console.warn('Could not save prompt to chat session:', dbErr.message);
      }
    }

    return res.json({
      success: true,
      originalPrompt: prompt.trim(),
      detectedLanguage: result.detectedLanguage,
      translatedPrompt: result.translatedPrompt,
      enhancedPrompt: result.enhancedPrompt,
      intent: result.intent,
      metadata: result.metadata
    });
  } catch (err) {
    console.error('Prompt enhance handler error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to process prompt enhancement.'
    });
  }
}
