'use strict';

const Groq = require('groq-sdk');

function getClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) { console.warn('[Groq] GROQ_API_KEY not set'); return null; }
  return new Groq({ apiKey });
}

const SYSTEM_PROMPT = (produceInfo, language) => `You are AgriLens AI, an agricultural quality inspection AI assistant on a phone call with a field worker named Bob.

Context:
- You just inspected a produce shipment (Lot #6) and found SERIOUS quality issues
- Produce type: ${produceInfo?.produceType || 'Lettuce'}
- Severity: ${produceInfo?.severity || 'HIGH'}
- Issues: ${(produceInfo?.issues || ['Severe wilting', 'Dark discoloration', 'Signs of mold']).join(', ')}
- The shipment must be rejected

Rules:
- Respond ONLY in ${language === 'es' ? 'Spanish' : 'English'}
- Keep responses SHORT (2-3 sentences max) — this is a phone call
- Be professional but direct
- Guide Bob to reject the shipment and document the issue
- If Bob says goodbye or confirms action, wrap up the call warmly
- Never break character`;

async function getResponse(callSid, bobMessage, language, produceInfo) {
  const client = getClient();
  if (!client) return getFallback(language);

  if (!global.conversations) global.conversations = {};
  if (!global.conversations[callSid]) {
    global.conversations[callSid] = [
      { role: 'system', content: SYSTEM_PROMPT(produceInfo, language) }
    ];
  }

  global.conversations[callSid].push({ role: 'user', content: bobMessage });

  try {
    const completion = await client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: global.conversations[callSid],
      max_tokens: 150,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content?.trim() || getFallback(language);
    global.conversations[callSid].push({ role: 'assistant', content: reply });
    console.log('[Groq] Response:', reply.substring(0, 100));
    return reply;
  } catch (err) {
    console.error('[Groq] Error:', err.message);
    return getFallback(language);
  }
}

function getFallback(language) {
  return language === 'es'
    ? 'Entendido Bob. Por favor rechace el lote completo y contacte a su supervisor. ¿Necesita algo más?'
    : 'Understood Bob. Please reject the entire lot and contact your supervisor. Is there anything else?';
}

function endConversation(callSid) {
  if (global.conversations) delete global.conversations[callSid];
}

module.exports = { getResponse, endConversation };
