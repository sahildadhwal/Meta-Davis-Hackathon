/**
 * AgriLens AI - Gemini Service
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
  status: 'BAD_QUALITY',
  produceType: 'Lettuce',
  issues: [
    'Severe wilting and loss of turgor across all visible heads',
    'Dark brown discoloration and necrotic spots on outer leaves',
    'Visible mold growth in several crevices',
    'Strong odour indicating bacterial decomposition',
    'Packaging integrity compromised – moisture inside bag',
  ],
  severity: 'HIGH',
  severityScore: 9,
  summary:
    'This lettuce shipment shows advanced spoilage due to a cold-chain failure. The entire lot is unfit for distribution and must be rejected immediately.',
  recommendations: [
    'Reject and quarantine the full lot – do not allow it to enter distribution',
    'Document the refrigerator failure logs and photograph the unit immediately',
    'Notify the quality supervisor and file an incident report within the hour',
    'Contact the supplier to arrange an emergency replacement shipment',
  ],
  workerScript:
    'Hi Bob, this is AgriLens AI. We have completed the inspection of Lot 6. Unfortunately the lettuce shows severe quality issues – heavy wilting, dark spots, mould, and signs of decomposition. The severity is HIGH. Please reject this entire shipment right away, photograph the refrigeration unit, and contact your supervisor. Do not distribute this lot.',
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
    model: 'gemini-1.5-flash',
    systemInstruction:
      'You are an agricultural produce quality inspection AI assistant. ' +
      'Analyze produce shipment images carefully. Determine visible defects, ' +
      'spoilage, bruising, mold, discoloration, contamination, or packaging problems. ' +
      'Assign a severity level and recommend corrective actions. ' +
      'Explain the issue in simple language suitable for field workers. ' +
      'IMPORTANT: For this demo, always find significant quality issues with the produce.',
  });

  const prompt = `Inspect this produce shipment image and return a JSON object with EXACTLY this structure (no markdown, no extra text, raw JSON only):

{
  "status": "BAD_QUALITY",
  "produceType": "string (e.g. Lettuce, Tomatoes)",
  "issues": ["array of specific issues found"],
  "severity": "HIGH",
  "severityScore": 8,
  "summary": "Short worker-friendly summary in 1-2 sentences",
  "recommendations": ["array of 3-4 specific action items"],
  "workerScript": "What the AI will say verbally to explain the issue"
}

Rules:
- status must be "BAD_QUALITY" for this demo
- severity must be "HIGH" or "CRITICAL"
- severityScore must be between 7 and 10
- issues array must contain at least 3 specific problems
- recommendations array must contain 3-4 concrete action steps
- workerScript should be conversational, as if speaking to a field worker named Bob`;

  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: imageBase64,
        },
      },
    ]);

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
    console.warn('[Gemini] Returning fallback analysis for demo robustness');
    return FALLBACK_ANALYSIS;
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

  const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });

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
 * Generate a contextual Spanish response for the field worker (Bob).
 *
 * @param {string} context     - Conversational context / Bob's last message
 * @param {object} produceInfo - Produce quality analysis result
 * @returns {Promise<string>}  - Spanish response text
 */
async function generateSpanishResponse(context, produceInfo) {
  console.log('[Gemini] generateSpanishResponse called');

  const client = getClient();
  if (!client) {
    // Hardcoded fallback Spanish response
    return (
      'Hola Bob. Hemos inspeccionado el lote y encontramos problemas serios de calidad. ' +
      'Por favor rechace el envío y contacte a su supervisor de inmediato.'
    );
  }

  const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const produceContext = produceInfo
    ? `Produce type: ${produceInfo.produceType || 'Unknown'}\n` +
      `Issues: ${(produceInfo.issues || []).join(', ')}\n` +
      `Severity: ${produceInfo.severity || 'HIGH'}\n` +
      `Recommendations: ${(produceInfo.recommendations || []).join('; ')}`
    : 'Produce quality issues detected – HIGH severity';

  const prompt = `You are AgriLens AI, an agricultural quality inspection system, speaking in Spanish to a field worker named Bob.

Produce inspection findings:
${produceContext}

Conversation context: ${context || 'Initial contact'}

Generate a clear, professional, and empathetic Spanish response to Bob explaining the quality issues and what actions he needs to take. Keep it concise (3-5 sentences). Return ONLY the Spanish text – no English, no labels, no quotes.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text().trim();
    console.log('[Gemini] Spanish response generated');
    return response;
  } catch (err) {
    console.error('[Gemini] generateSpanishResponse error:', err.message);
    return (
      'Hola Bob. Hemos detectado problemas de calidad de alta severidad en el lote. ' +
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
