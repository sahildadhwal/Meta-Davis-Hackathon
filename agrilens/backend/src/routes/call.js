/**
 * AgriLens AI - Call Route
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

const express = require('express');
const twilioService = require('../services/twilio');
const geminiService = require('../services/gemini');
const { runDemoSimulation } = require('../simulation');

const router = express.Router();

// ---------------------------------------------------------------------------
// POST /api/call-bob
// ---------------------------------------------------------------------------

/**
 * Initiate a call to Bob.
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

/**
 * Initial TwiML greeting when Bob picks up.
 * Asks for language preference.
 */
router.get('/twiml/greeting', (req, res) => {
  console.log('[Call] GET /api/twiml/greeting');
  res.set('Content-Type', 'text/xml');
  res.send(twilioService.buildGreetingTwiml());
});

// Also handle POST for flexibility (Twilio can use either)
router.post('/twiml/greeting', (req, res) => {
  console.log('[Call] POST /api/twiml/greeting');
  res.set('Content-Type', 'text/xml');
  res.send(twilioService.buildGreetingTwiml());
});

// ---------------------------------------------------------------------------
// POST /api/twiml/language
// ---------------------------------------------------------------------------

/**
 * Handles Bob's language preference response.
 * Twilio sends SpeechResult in the body.
 */
router.post('/twiml/language', async (req, res) => {
  console.log('[Call] POST /api/twiml/language');

  const speechResult = (req.body.SpeechResult || '').toLowerCase().trim();
  console.log('[Call] SpeechResult from Bob:', speechResult);

  const io = req.app.get('io');

  // Detect Spanish from the speech result
  const isSpanish =
    speechResult.includes('español') ||
    speechResult.includes('spanish') ||
    speechResult.includes('espanol') ||
    speechResult.includes('es');

  res.set('Content-Type', 'text/xml');

  if (isSpanish) {
    console.log('[Call] Language detected: Spanish');

    // Notify frontend
    if (io) {
      io.emit('call:language', { language: 'es' });
    }

    // Generate contextual Spanish explanation using Gemini
    const produceInfo = global.currentProduceInfo;
    let spanishExplanation;

    try {
      spanishExplanation = await geminiService.generateSpanishResponse(
        'Bob selected Spanish as preferred language. Deliver the quality inspection report.',
        produceInfo
      );
    } catch (err) {
      console.error('[Call] Failed to generate Spanish response:', err.message);
      spanishExplanation =
        'Hola Bob. Hemos inspeccionado el lote y encontramos problemas serios de calidad. ' +
        'El nivel de severidad es ALTO. Por favor rechace el envío y contacte a su supervisor.';
    }

    return res.send(twilioService.buildSpanishTwiml(spanishExplanation));
  } else {
    // English or unclear – default to English quality report
    console.log('[Call] Language detected: English (default)');

    if (io) {
      io.emit('call:language', { language: 'en' });
    }

    const englishTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="en-US">
    Thank you Bob. We have inspected Lot 6 and found serious quality issues.
    The produce shows high severity defects including wilting, discoloration, and signs of spoilage.
    Please reject the entire shipment and contact your supervisor immediately.
    A rejection report will be generated automatically. Thank you and goodbye.
  </Say>
  <Hangup/>
</Response>`;

    return res.send(englishTwiml);
  }
});

// ---------------------------------------------------------------------------
// POST /api/twiml/respond
// ---------------------------------------------------------------------------

/**
 * Handles ongoing conversation responses from Bob after the quality report.
 */
router.post('/twiml/respond', async (req, res) => {
  console.log('[Call] POST /api/twiml/respond');

  const speechResult = (req.body.SpeechResult || '').trim();
  console.log('[Call] Bob said:', speechResult);

  const io = req.app.get('io');

  // Emit Bob's response as a transcript
  if (io && speechResult) {
    const { v4: uuidv4 } = require('uuid');
    const transcript = {
      id: uuidv4(),
      speaker: 'Bob',
      text: speechResult,
      lang: 'es',
      translation: null,
      timestamp: Date.now(),
    };
    if (!global.transcripts) global.transcripts = [];
    global.transcripts.push(transcript);
    io.emit('transcript', transcript);
  }

  res.set('Content-Type', 'text/xml');

  // Generate a closing Spanish response
  const closingTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="es-MX">
    Gracias por su confirmación, Bob. El informe de rechazo ha sido registrado.
    Por favor contacte al proveedor para coordinar el reemplazo. Hasta luego.
  </Say>
  <Hangup/>
</Response>`;

  return res.send(closingTwiml);
});

// ---------------------------------------------------------------------------
// POST /api/twiml/status
// ---------------------------------------------------------------------------

/**
 * Twilio status callback – receives call lifecycle events.
 * Broadcasts them to frontend via Socket.io.
 */
router.post('/twiml/status', (req, res) => {
  const callStatus = req.body.CallStatus || 'unknown';
  const callSid = req.body.CallSid || 'unknown';
  console.log('[Call] POST /api/twiml/status – CallSid:', callSid, '| CallStatus:', callStatus);

  const io = req.app.get('io');

  // Map Twilio call statuses to our frontend statuses
  const statusMap = {
    queued: { status: 'dialing', message: 'Call queued...' },
    initiated: { status: 'dialing', message: 'Call initiated...' },
    ringing: { status: 'ringing', message: 'Ringing...' },
    'in-progress': { status: 'connected', message: 'Call in progress' },
    completed: { status: 'ended', message: 'Call completed successfully' },
    busy: { status: 'failed', message: 'Bob\'s line is busy' },
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
