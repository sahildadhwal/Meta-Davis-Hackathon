/**
 * AgriLens iOS - Call Route
 *
 * Handles outbound AI phone calls to field workers.
 *
 * Routes:
 *   POST /api/call-bob              – Initiate call (demo or real Twilio)
 *   GET  /api/twiml/greeting        – TwiML: initial greeting
 *   POST /api/twiml/language        – TwiML: language selection handler
 *   POST /api/twiml/respond         – TwiML: ongoing conversation handler
 *   POST /api/twiml/status          – TwiML: Twilio status callback
 */

'use strict';

const path = require('path');
const fs = require('fs');
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const twilioService = require('../services/twilio');
const geminiService = require('../services/gemini');
const elevenlabs = require('../services/elevenlabs');
const groqService = require('../services/groq');
const { runDemoSimulation } = require('../simulation');

const uploadsDir = path.join(__dirname, '../../uploads');

// Generate ElevenLabs audio, save to uploads/, return public URL or null
async function ttsToUrl(text) {
  try {
    const voiceId = process.env.ELEVENLABS_VOICE_ID;
    const buffer = await elevenlabs.textToSpeechBuffer(text, voiceId);
    if (!buffer) return null;
    const filename = `tts-${uuidv4()}.mp3`;
    fs.writeFileSync(path.join(uploadsDir, filename), buffer);
    return `${process.env.PUBLIC_URL}/uploads/${filename}`;
  } catch (err) {
    console.error('[TTS] Failed to generate audio:', err.message);
    return null;
  }
}

// Store a transcript entry and emit via Socket.io
function emitTranscript(speaker, text, lang, translation) {
  const entry = { id: uuidv4(), speaker, text, lang, translation, timestamp: Date.now() };
  if (!global.transcripts) global.transcripts = [];
  global.transcripts.push(entry);
  if (global.io) global.io.emit('transcript', entry);
  return entry;
}

const router = express.Router();

// ---------------------------------------------------------------------------
// POST /api/call-bob
// ---------------------------------------------------------------------------

/**
 * Initiate a call to Lebron.
 *
 * Body:
 *   demoMode    {boolean}  - If true, run the simulated conversation
 *   phoneNumber {string}   - Target phone number (real mode only)
 *   produceInfo {object}   - Quality analysis result for context (optional)
 */
router.post('/call-bob', async (req, res) => {
  console.log('[Call] POST /api/call-bob received');

  const { demoMode = true, phoneNumber, produceInfo } = req.body;
  const io = req.app.get('io');

  console.log('[Call] demoMode:', demoMode, '| phoneNumber:', phoneNumber || '(not provided)');

  try {
    if (demoMode) {
      // --- Demo simulation mode ---------------------------------------------
      console.log('[Call] Starting demo simulation...');

      // Store produce info globally so TwiML handlers can reference it
      global.currentProduceInfo = produceInfo || null;

      // Run simulation asynchronously – response returns immediately
      runDemoSimulation(io, produceInfo);

      return res.status(200).json({
        success: true,
        mode: 'demo',
        message: 'Demo simulation started',
      });
    } else {
      // --- Real Twilio call mode --------------------------------------------
      console.log('[Call] Initiating real Twilio call...');

      const targetNumber = phoneNumber || process.env.BOB_PHONE_NUMBER;
      if (!targetNumber) {
        return res.status(400).json({
          success: false,
          error: 'No phone number provided and BOB_PHONE_NUMBER env var not set',
        });
      }

      const webhookBaseUrl = process.env.PUBLIC_URL;
      if (!webhookBaseUrl) {
        return res.status(400).json({
          success: false,
          error: 'PUBLIC_URL environment variable not set – required for Twilio webhooks',
        });
      }

      // Store produce info globally for TwiML handlers
      global.currentProduceInfo = produceInfo || null;

      const callSid = await twilioService.initiateCall(targetNumber, webhookBaseUrl);
      console.log('[Call] Real call initiated – SID:', callSid);

      // Emit initial status
      if (io) {
        io.emit('call:status', { status: 'dialing', message: `Calling ${targetNumber}...` });
      }

      return res.status(200).json({
        success: true,
        mode: 'real',
        callSid,
      });
    }
  } catch (err) {
    console.error('[Call] Error in /api/call-bob:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to initiate call',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
});

// ---------------------------------------------------------------------------
// GET /api/twiml/greeting
// ---------------------------------------------------------------------------

async function handleGreeting(req, res) {
  console.log('[Call] twiml/greeting');
  const greetingText = 'Hello Lebron. This is AgriLens AI. We have detected a possible pest incident in the produce section. What language do you prefer — English or Spanish?';
  emitTranscript('AI', greetingText, 'en', null);
  res.set('Content-Type', 'text/xml');
  const greetingAudio = await ttsToUrl(greetingText);
  if (greetingAudio) {
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" action="/api/twiml/language" method="POST" speechTimeout="6" language="en-US">
    <Play>${greetingAudio}</Play>
  </Gather>
  <Redirect>/api/twiml/greeting</Redirect>
</Response>`);
  } else {
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" action="/api/twiml/language" method="POST" speechTimeout="6" language="en-US">
    <Say voice="Polly.Joanna-Neural">${greetingText}</Say>
  </Gather>
  <Redirect>/api/twiml/greeting</Redirect>
</Response>`);
  }
}

router.get('/twiml/greeting', handleGreeting);
router.post('/twiml/greeting', handleGreeting);

// ---------------------------------------------------------------------------
// POST /api/twiml/language
// ---------------------------------------------------------------------------

/**
 * Handles Lebron's language preference response.
 * Twilio sends SpeechResult in the body.
 */
router.post('/twiml/language', async (req, res) => {
  console.log('[Call] POST /api/twiml/language');
  const speechResult = (req.body.SpeechResult || '').toLowerCase().trim();
  console.log('[Call] SpeechResult from Lebron:', speechResult);
  const io = req.app.get('io');

  const isSpanish =
    speechResult.includes('español') ||
    speechResult.includes('spanish') ||
    speechResult.includes('espanol') ||
    speechResult.includes('es');

  // Store Lebron's language choice as transcript
  if (speechResult) {
    emitTranscript('Lebron', speechResult, isSpanish ? 'es' : 'en', isSpanish ? 'Spanish, please.' : null);
  }

  res.set('Content-Type', 'text/xml');

  if (isSpanish) {
    if (!global.callLanguage) global.callLanguage = {};
    global.callLanguage[req.body.CallSid] = 'es';
    if (io) io.emit('call:language', { language: 'es' });

    const produceInfo = global.currentProduceInfo;
    const spanishExplanation = await groqService.getResponse(
      req.body.CallSid + '-intro',
      'Lebron selected Spanish. Give a concise pest damage report for the produce incident.',
      'es',
      produceInfo
    );

    emitTranscript('AI', spanishExplanation, 'es', 'Hello Lebron. We inspected Lot 6 and found serious quality issues. Severity is HIGH. Please reject the shipment and contact your supervisor immediately.');

    const fullSpanish = spanishExplanation + ' ¿Tiene alguna pregunta?';
    const spanishAudio = await ttsToUrl(fullSpanish);
    if (spanishAudio) {
      return res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" action="/api/twiml/respond" method="POST" speechTimeout="8" language="es-MX">
    <Play>${spanishAudio}</Play>
  </Gather>
  <Redirect>/api/twiml/respond</Redirect>
</Response>`);
    }
    const safeMsg = fullSpanish.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    return res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" action="/api/twiml/respond" method="POST" speechTimeout="8" language="es-MX">
    <Say voice="Polly.Mia-Neural" language="es-MX">${safeMsg}</Say>
  </Gather>
  <Redirect>/api/twiml/respond</Redirect>
</Response>`);
  } else {
    if (!global.callLanguage) global.callLanguage = {};
    global.callLanguage[req.body.CallSid] = 'en';
    if (io) io.emit('call:language', { language: 'en' });
    const englishText = 'Thank you Lebron. We detected animal damage on the banana display at Stall 4B. Bite marks are visible on multiple bananas and appear consistent with raccoon or rat activity. The damage is at ground level near the rear storage area. Do you have any questions or should I connect you with pest control?';
    emitTranscript('AI', englishText, 'en', null);
    const englishAudio = await ttsToUrl(englishText);
    if (englishAudio) {
      return res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" action="/api/twiml/respond" method="POST" speechTimeout="8" language="en-US">
    <Play>${englishAudio}</Play>
  </Gather>
  <Redirect>/api/twiml/respond</Redirect>
</Response>`);
    }
    return res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" action="/api/twiml/respond" method="POST" speechTimeout="8" language="en-US">
    <Say voice="Polly.Joanna-Neural">${englishText}</Say>
  </Gather>
  <Redirect>/api/twiml/respond</Redirect>
</Response>`);
  }
});

// ---------------------------------------------------------------------------
// POST /api/twiml/respond
// ---------------------------------------------------------------------------

/**
 * Handles ongoing conversation responses from Lebron after the quality report.
 */
router.post('/twiml/respond', async (req, res) => {
  console.log('[Call] POST /api/twiml/respond');

  const speechResult = (req.body.SpeechResult || '').trim();
  const callSid = req.body.CallSid || 'unknown';
  const language = global.callLanguage?.[callSid] || 'es';
  const voice = language === 'es' ? 'Polly.Mia-Neural' : 'Polly.Joanna-Neural';
  const gatherLang = language === 'es' ? 'es-MX' : 'en-US';

  console.log('[Call] Lebron said:', speechResult);

  if (speechResult) {
    emitTranscript('Lebron', speechResult, language, null);
  }

  // Detect if Lebron is ending the call
  const endPhrases = ['adiós', 'hasta luego', 'gracias', 'goodbye', 'bye', 'thank you', 'that\'s all'];
  const isEnding = endPhrases.some(p => speechResult.toLowerCase().includes(p));

  const aiReply = await groqService.getResponse(callSid, speechResult, language, global.currentProduceInfo);
  emitTranscript('AI', aiReply, language, null);

  const safeReply = aiReply.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

  res.set('Content-Type', 'text/xml');

  const replyAudio = await ttsToUrl(aiReply);

  if (isEnding) {
    groqService.endConversation(callSid);
    if (replyAudio) {
      return res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Play>${replyAudio}</Play>
  <Hangup/>
</Response>`);
    }
    return res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${voice}" language="${gatherLang}">${safeReply}</Say>
  <Hangup/>
</Response>`);
  }

  if (replyAudio) {
    return res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" action="/api/twiml/respond" method="POST" speechTimeout="8" language="${gatherLang}">
    <Play>${replyAudio}</Play>
  </Gather>
  <Redirect>/api/twiml/respond</Redirect>
</Response>`);
  }
  return res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" action="/api/twiml/respond" method="POST" speechTimeout="8" language="${gatherLang}">
    <Say voice="${voice}" language="${gatherLang}">${safeReply}</Say>
  </Gather>
  <Redirect>/api/twiml/respond</Redirect>
</Response>`);
});

// ---------------------------------------------------------------------------
// POST /api/twiml/status
// ---------------------------------------------------------------------------

/**
 * Twilio status callback – receives call lifecycle events.
 * Broadcasts them to the app via Socket.io.
 */
router.post('/twiml/status', (req, res) => {
  const callStatus = req.body.CallStatus || 'unknown';
  const callSid = req.body.CallSid || 'unknown';
  console.log('[Call] POST /api/twiml/status – CallSid:', callSid, '| CallStatus:', callStatus);

  const io = req.app.get('io');

  // Map Twilio call statuses to our app statuses
  const statusMap = {
    queued: { status: 'dialing', message: 'Call queued...' },
    initiated: { status: 'dialing', message: 'Call initiated...' },
    ringing: { status: 'ringing', message: 'Ringing...' },
    'in-progress': { status: 'connected', message: 'Call in progress' },
    completed: { status: 'ended', message: 'Call completed successfully' },
    busy: { status: 'failed', message: "Lebron's line is busy" },
    'no-answer': { status: 'failed', message: 'No answer' },
    failed: { status: 'failed', message: 'Call failed' },
    canceled: { status: 'ended', message: 'Call was cancelled' },
  };

  const mapped = statusMap[callStatus] || { status: callStatus, message: `Call status: ${callStatus}` };

  if (io) {
    io.emit('call:status', { ...mapped, callSid, raw: callStatus });
    console.log('[Call] Emitted call:status →', mapped.status);
  }

  // Twilio expects a 200 OK with no body for status callbacks
  res.status(200).send('');
});

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = router;
