/**
 * AgriLens iOS - Twilio Service
 *
 * Handles outbound call initiation and TwiML response generation
 * for the AI-to-field-worker phone call workflow.
 */

'use strict';

// ---------------------------------------------------------------------------
// Client factory – created lazily so missing env vars don't crash on startup
// ---------------------------------------------------------------------------

function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    console.warn('[Twilio] TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN not set');
    return null;
  }

  const twilio = require('twilio');
  return twilio(accountSid, authToken);
}

// ---------------------------------------------------------------------------
// initiateCall
// ---------------------------------------------------------------------------

/**
 * Place an outbound call to a field worker via Twilio.
 *
 * @param {string} toNumber      - Destination phone number in E.164 format
 * @param {string} webhookBaseUrl - Base URL for TwiML webhook endpoints
 * @returns {Promise<string>} Twilio call SID
 */
async function initiateCall(toNumber, webhookBaseUrl) {
  console.log('[Twilio] initiateCall – to:', toNumber, '| webhook:', webhookBaseUrl);

  const client = getTwilioClient();
  if (!client) {
    throw new Error('Twilio client not initialised – check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN');
  }

  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  if (!fromNumber) {
    throw new Error('TWILIO_PHONE_NUMBER environment variable not set');
  }

  const call = await client.calls.create({
    url: `${webhookBaseUrl}/api/twiml/greeting`,
    to: toNumber,
    from: fromNumber,
    statusCallback: `${webhookBaseUrl}/api/twiml/status`,
    statusCallbackMethod: 'POST',
  });

  console.log('[Twilio] Call initiated – SID:', call.sid);
  return call.sid;
}

// ---------------------------------------------------------------------------
// TwiML Builders
// ---------------------------------------------------------------------------

/**
 * Build the initial greeting TwiML.
 * Asks Bob for his preferred language (English or Spanish).
 *
 * @returns {string} TwiML XML string
 */
function buildGreetingTwiml() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="en-US">
    Hello Bob. This is the AgriLens AI system.
    What is your preferred language? Please say English or Spanish.
  </Say>
  <Gather input="speech" action="/api/twiml/language" method="POST" speechTimeout="auto" language="en-US">
    <Say voice="alice" language="en-US">Please say English or Spanish now.</Say>
  </Gather>
  <Say voice="alice" language="en-US">We did not receive your response. Please call back when ready.</Say>
</Response>`;
}

/**
 * Build a Spanish-language TwiML response for Bob.
 * Delivers the quality inspection message and gathers his next reply.
 *
 * @param {string} message - Spanish message to speak to Bob
 * @returns {string} TwiML XML string
 */
function buildSpanishTwiml(message) {
  // Escape XML special characters in the message
  const safeMessage = message
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="es-MX">${safeMessage}</Say>
  <Gather input="speech" action="/api/twiml/respond" method="POST" speechTimeout="auto" language="es-MX">
    <Say voice="alice" language="es-MX">Por favor, responda ahora.</Say>
  </Gather>
</Response>`;
}

/**
 * Build TwiML for ending the call gracefully in Spanish.
 *
 * @returns {string} TwiML XML string
 */
function buildEndCallTwiml() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="es-MX">Gracias Bob. Hasta luego.</Say>
  <Hangup/>
</Response>`;
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  initiateCall,
  buildGreetingTwiml,
  buildSpanishTwiml,
  buildEndCallTwiml,
};
