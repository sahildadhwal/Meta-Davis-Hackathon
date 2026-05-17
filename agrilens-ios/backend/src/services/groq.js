'use strict';

const Groq = require('groq-sdk');

function getClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) { console.warn('[Groq] GROQ_API_KEY not set'); return null; }
  return new Groq({ apiKey });
}

const SYSTEM_PROMPT = (produceInfo, language) => `You are AgriLens AI, an intelligent pest detection assistant on a phone call with Lebron, a field manager at a produce market.

Incident details:
- Location: Produce Section, Stall 4B
- Affected item: ${produceInfo?.produceType || 'Banana'}
- Suspected pest: ${produceInfo?.pestType || 'Raccoon or Rat'}
- Severity: ${produceInfo?.severity || 'HIGH'}
- Evidence: Bite marks on produce, ground-level damage pattern

Your knowledge on pests:
- Raccoon bites: large (2–3 cm), irregular, often show claw marks nearby, active at dusk/dawn
- Rat bites: smaller (0.5–1 cm), more numerous, parallel tooth marks, usually overnight
- Rabbit bites: clean 45-degree cuts, typically on lower items, active early morning

Rules:
- Respond ONLY in ${language === 'es' ? 'Spanish' : 'English'}
- Keep responses SHORT — 2 to 3 sentences max. This is a phone call.
- Be professional, direct, and helpful
- If Lebron asks if it could be a specific animal, give your assessment based on bite pattern evidence
- If Lebron says he will handle it, or says goodbye/thanks, wrap up warmly and say you will notify the supervisor and log the incident
- Never break character`;

async function getResponse(callSid, bobMessage, language, produceInfo) {
  const client = getClient();
  if (!client) return getFallback(language);

  if (!global.conversations) global.conversations = {};
  if (!global.conversations[callSid]) {
    global.conversations[callSid] = [
      { role: 'system', content: SYSTEM_PROMPT(produceInfo, language) },
    ];
  }

  global.conversations[callSid].push({ role: 'user', content: bobMessage });

  try {
    const completion = await client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: global.conversations[callSid],
      max_tokens: 120,
      temperature: 0.6,
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
    ? 'Entendido Lebron. Registraré esto y notificaré a su supervisor de inmediato.'
    : 'Understood Lebron. I will log this incident and notify your supervisor right away.';
}

function endConversation(callSid) {
  if (global.conversations) delete global.conversations[callSid];
}

async function analyzeProduceText() {
  const client = getClient();
  if (!client) return null;

  try {
    const completion = await client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: 'You are an agricultural pest damage detection AI. Return ONLY raw JSON with no markdown, no code fences, no extra text.',
        },
        {
          role: 'user',
          content: `Return ONLY this JSON with no changes to the field names or structure. Fill in realistic values for a banana pest damage incident:
{"status":"PEST_DAMAGE","produceType":"Banana","pestType":"Raccoon / Rat (suspected)","location":"Produce Section — Stall 4B","issues":["issue 1","issue 2","issue 3","issue 4"],"severity":"HIGH","severityScore":8,"summary":"Two sentence summary of the banana damage.","recommendations":["action 1","action 2","action 3","action 4"],"workerScript":"Short verbal explanation for field worker about the banana damage."}`,
        },
      ],
      max_tokens: 400,
      temperature: 0.4,
    });

    const text = completion.choices[0]?.message?.content?.trim() || '';
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      console.log('[Groq] analyzeProduceText success – produceType:', parsed.produceType);
      return parsed;
    }
    return null;
  } catch (err) {
    console.error('[Groq] analyzeProduceText error:', err.message);
    return null;
  }
}

module.exports = { getResponse, endConversation, analyzeProduceText };
