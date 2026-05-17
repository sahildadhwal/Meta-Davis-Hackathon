/**
 * AgriLens iOS - Gemini Service
 *
 * Wraps Google Gemini API calls for produce image analysis,
 * text translation, and Spanish conversation generation.
 */

'use strict';

const { GoogleGenerativeAI } = require('@google/generative-ai');

// ---------------------------------------------------------------------------
// Client initialisation
// ---------------------------------------------------------------------------

const getClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('[Gemini] GEMINI_API_KEY is not set – using fallback responses');
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

// ---------------------------------------------------------------------------
// Fallback result used when Gemini is unavailable or during demo robustness
// ---------------------------------------------------------------------------

const FALLBACK_ANALYSIS = {
  status: 'PEST_DAMAGE',
  produceType: 'Banana',
  pestType: 'Raccoon / Rat (suspected)',
  location: 'Produce Section — Stall 4B',
  issues: [
    'Visible bite marks consistent with medium-sized mammal activity',
    'Teeth impression pattern suggests raccoon or large rat',
    'Multiple bananas affected across lower shelf level',
    'Damage concentrated at ground level — indicates rodent or raccoon entry',
    'Possible pest entry point near rear storage door',
  ],
  severity: 'HIGH',
  severityScore: 8,
  summary: 'Banana display at Stall 4B shows clear signs of animal damage. Bite patterns are consistent with raccoon or rat activity. Immediate pest control intervention required.',
  recommendations: [
    'Quarantine all affected produce immediately',
    'Inspect storage area for pest entry points',
    'Contact pest control for on-site assessment',
    'Photograph all damage for incident report',
    'Notify store manager and health inspector',
  ],
  workerScript: 'Hello Lebron. We detected animal damage on the banana display at Stall 4B. Bite marks suggest raccoon or rat activity. This needs immediate attention.',
};

// ---------------------------------------------------------------------------
// analyzeProduceImage
// ---------------------------------------------------------------------------

/**
 * Analyse a produce image using Gemini Vision.
 *
 * @param {string} imageBase64  - Base-64 encoded image data
 * @param {string} mimeType     - MIME type, e.g. 'image/jpeg'
 * @returns {Promise<object>}   - Structured quality-inspection result
 */
async function analyzeProduceImage(imageBase64, mimeType) {
  console.log('[Gemini] analyzeProduceImage called, mimeType:', mimeType);

  const client = getClient();
  if (!client) {
    console.warn('[Gemini] No client available – returning fallback analysis');
    return FALLBACK_ANALYSIS;
  }

  const model = client.getGenerativeModel({
    model: 'gemini-2.0-flash-lite',
    systemInstruction:
      'You are an agricultural pest damage detection AI assistant. ' +
      'Analyze produce images carefully and honestly. ' +
      'If you see bite marks, teeth impressions, claw marks, holes, or chewing damage, identify the likely pest. ' +
      'If the produce looks healthy and undamaged, say so — use status PASS. ' +
      'Assign a severity level and recommend appropriate actions. ' +
      'Explain findings in simple language suitable for field workers.',
  });

  const prompt = `Inspect this produce image for pest or animal damage and return a JSON object with EXACTLY this structure (no markdown, no extra text, raw JSON only):

{
  "status": "PEST_DAMAGE",
  "produceType": "string (e.g. Banana, Apple)",
  "pestType": "string (e.g. Raccoon / Rat (suspected))",
  "location": "string (e.g. Produce Section — Stall 4B)",
  "issues": ["array of specific damage observations found"],
  "severity": "HIGH",
  "severityScore": 8,
  "summary": "Short worker-friendly summary in 1-2 sentences",
  "recommendations": ["array of 3-5 specific pest control action items"],
  "workerScript": "What the AI will say verbally to explain the pest incident to a field worker"
}

Rules:
- If produce looks healthy: status = "PASS", severity = "NONE", severityScore = 0, issues = [], pestType = null
- If damage is visible: status = "PEST_DAMAGE", severity = "HIGH" or "CRITICAL", severityScore 7-10
- pestType should identify the likely pest based on visible evidence
- issues array: at least 3 observations if damaged, empty if PASS
- recommendations: appropriate actions for the situation
- workerScript should be conversational, as if speaking to a field worker named Lebron`;

  try {
    const geminiCall = model.generateContent([
      prompt,
      { inlineData: { mimeType, data: imageBase64 } },
    ]);
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Gemini timeout')), 10000)
    );
    const result = await Promise.race([geminiCall, timeout]);

    const responseText = result.response.text();
    console.log('[Gemini] Raw response (first 300 chars):', responseText.substring(0, 300));

    // Strip markdown code fences if present
    let jsonText = responseText.trim();
    const fenceMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
      jsonText = fenceMatch[1].trim();
    }

    const parsed = JSON.parse(jsonText);
    console.log('[Gemini] Analysis complete – status:', parsed.status, '| severity:', parsed.severity);
    return parsed;
  } catch (err) {
    console.error('[Gemini] analyzeProduceImage error:', err.message);
    console.warn('[Gemini] Trying Groq as fallback for image analysis...');
    try {
      const { analyzeProduceText } = require('./groq');
      const groqResult = await analyzeProduceText();
      if (groqResult) {
        console.log('[Gemini] Groq fallback succeeded');
        return { ...groqResult, isFallback: true };
      }
    } catch (groqErr) {
      console.error('[Gemini] Groq fallback failed:', groqErr.message);
    }
    console.warn('[Gemini] Returning hardcoded fallback analysis');
    return { ...FALLBACK_ANALYSIS, isFallback: true };
  }
}

// ---------------------------------------------------------------------------
// translateText
// ---------------------------------------------------------------------------

/**
 * Translate text into the specified language using Gemini.
 *
 * @param {string} text           - Source text to translate
 * @param {string} targetLanguage - Target language name, e.g. 'English'
 * @returns {Promise<string>}     - Translated text
 */
async function translateText(text, targetLanguage) {
  console.log('[Gemini] translateText called, target:', targetLanguage);

  const client = getClient();
  if (!client) {
    console.warn('[Gemini] No client – returning original text as translation fallback');
    return text;
  }

  const model = client.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

  const prompt = `Translate the following text to ${targetLanguage}. Return only the translated text with no extra commentary, no quotation marks, and no explanation.\n\nText to translate:\n${text}`;

  try {
    const result = await model.generateContent(prompt);
    const translated = result.response.text().trim();
    console.log('[Gemini] Translation complete');
    return translated;
  } catch (err) {
    console.error('[Gemini] translateText error:', err.message);
    return text; // graceful fallback – return original
  }
}

// ---------------------------------------------------------------------------
// generateSpanishResponse
// ---------------------------------------------------------------------------

/**
 * Generate a contextual Spanish response for the field worker (Lebron).
 *
 * @param {string} context     - Conversational context / Lebron's last message
 * @param {object} produceInfo - Produce quality analysis result
 * @returns {Promise<string>}  - Spanish response text
 */
async function generateSpanishResponse(context, produceInfo) {
  console.log('[Gemini] generateSpanishResponse called');

  const client = getClient();
  if (!client) {
    // Hardcoded fallback Spanish response
    return (
      'Hola Lebron. Hemos inspeccionado el lote y encontramos problemas serios de calidad. ' +
      'Por favor rechace el envío y contacte a su supervisor de inmediato.'
    );
  }

  const model = client.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

  const produceContext = produceInfo
    ? `Produce type: ${produceInfo.produceType || 'Unknown'}\n` +
      `Issues: ${(produceInfo.issues || []).join(', ')}\n` +
      `Severity: ${produceInfo.severity || 'HIGH'}\n` +
      `Recommendations: ${(produceInfo.recommendations || []).join('; ')}`
    : 'Produce quality issues detected – HIGH severity';

  const prompt = `You are AgriLens AI, an agricultural quality inspection system, speaking in Spanish to a field worker named Lebron.

Produce inspection findings:
${produceContext}

Conversation context: ${context || 'Initial contact'}

Generate a clear, professional, and empathetic Spanish response to Lebron explaining the quality issues and what actions he needs to take. Keep it concise (3-5 sentences). Return ONLY the Spanish text – no English, no labels, no quotes.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text().trim();
    console.log('[Gemini] Spanish response generated');
    return response;
  } catch (err) {
    console.error('[Gemini] generateSpanishResponse error:', err.message);
    return (
      'Hola Lebron. Hemos detectado problemas de calidad de alta severidad en el lote. ' +
      'Por favor rechace el envío completo y notifique a su supervisor inmediatamente.'
    );
  }
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  analyzeProduceImage,
  translateText,
  generateSpanishResponse,
};
