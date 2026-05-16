/**
 * AgriLens AI - Demo Simulation
 *
 * Simulates a full AI-to-field-worker phone call conversation using
 * pre-scripted dialogue with realistic timing delays. Emits Socket.io
 * events that the frontend consumes in real time.
 *
 * Timeline (all times relative to when runDemoSimulation is called):
 *   1.0s  – Dialing status
 *   2.5s  – Ringing status
 *   4.0s  – Connected status
 *   5.0s  – AI greeting (English)
 *   9.0s  – Bob replies (Spanish preference)
 *  10.0s  – Language selected event
 *  12.0s  – AI quality report (Spanish)
 *  20.0s  – Bob explains refrigerator failure (Spanish)
 *  25.0s  – AI follow-up (Spanish)
 *  31.0s  – Bob confirms action (Spanish)
 *  35.0s  – AI closes call (Spanish)
 *  38.0s  – Call ended status
 */

'use strict';

const { v4: uuidv4 } = require('uuid');

// ---------------------------------------------------------------------------
// Helper – emit a transcript event and store it in global.transcripts
// ---------------------------------------------------------------------------

function emitTranscript(io, transcript) {
  // Persist to in-memory store
  if (!global.transcripts) global.transcripts = [];
  global.transcripts.push(transcript);

  // Broadcast to all connected Socket.io clients
  io.emit('transcript', transcript);
  console.log(`[Simulation] 📡 transcript – ${transcript.speaker}: "${transcript.text.substring(0, 60)}..."`);
}

// ---------------------------------------------------------------------------
// Helper – schedule an event emission
// ---------------------------------------------------------------------------

function schedule(delayMs, fn) {
  setTimeout(fn, delayMs);
}

// ---------------------------------------------------------------------------
// runDemoSimulation
// ---------------------------------------------------------------------------

/**
 * Run the full demo phone call simulation.
 *
 * @param {import('socket.io').Server} io - Socket.io server instance
 * @param {object} [produceInfo]          - Quality analysis result (optional, for context)
 */
function runDemoSimulation(io, produceInfo) {
  console.log('[Simulation] Starting demo simulation...');
  if (produceInfo) {
    console.log('[Simulation] Produce context – type:', produceInfo.produceType, '| severity:', produceInfo.severity);
  }

  // --- 1.0s – Dialing --------------------------------------------------------
  schedule(1000, () => {
    io.emit('call:status', {
      status: 'dialing',
      message: 'Calling Bob at +1 (555) 867-5309...',
    });
    console.log('[Simulation] call:status → dialing');
  });

  // --- 2.5s – Ringing --------------------------------------------------------
  schedule(2500, () => {
    io.emit('call:status', {
      status: 'ringing',
      message: 'Ringing...',
    });
    console.log('[Simulation] call:status → ringing');
  });

  // --- 4.0s – Connected ------------------------------------------------------
  schedule(4000, () => {
    io.emit('call:status', {
      status: 'connected',
      message: 'Bob answered',
    });
    console.log('[Simulation] call:status → connected');
  });

  // --- 5.0s – AI Greeting (English) ------------------------------------------
  schedule(5000, () => {
    emitTranscript(io, {
      id: uuidv4(),
      speaker: 'AI',
      text: 'Hello Bob. This is AgriLens AI. What is your preferred language?',
      lang: 'en',
      translation: null,
      timestamp: Date.now(),
    });
  });

  // --- 9.0s – Bob replies (Spanish preference) -------------------------------
  schedule(9000, () => {
    emitTranscript(io, {
      id: uuidv4(),
      speaker: 'Bob',
      text: 'Español, por favor.',
      lang: 'es',
      translation: 'Spanish, please.',
      timestamp: Date.now(),
    });
  });

  // --- 10.0s – Language selection event --------------------------------------
  schedule(10000, () => {
    io.emit('call:language', { language: 'es' });
    console.log('[Simulation] call:language → es');
  });

  // --- 12.0s – AI delivers quality report in Spanish -------------------------
  schedule(12000, () => {
    emitTranscript(io, {
      id: uuidv4(),
      speaker: 'AI',
      text:
        'Hola Bob. Hemos inspeccionado el Lote número seis y encontramos problemas serios de calidad. ' +
        'Las lechugas muestran signos evidentes de deterioro: están marchitas, con manchas oscuras y ' +
        'presentan mal olor. El nivel de severidad es ALTO. Esto indica que el lote no es apto para distribución.',
      lang: 'es',
      translation:
        'Hello Bob. We have inspected Lot number six and found serious quality issues. ' +
        'The lettuces show obvious signs of deterioration: wilting, dark spots, and bad odor. ' +
        'The severity level is HIGH. This indicates the lot is not suitable for distribution.',
      timestamp: Date.now(),
    });
  });

  // --- 20.0s – Bob explains the refrigerator failure -------------------------
  schedule(20000, () => {
    emitTranscript(io, {
      id: uuidv4(),
      speaker: 'Bob',
      text:
        'Sí, entiendo. El refrigerador tuvo fallas ayer por la noche. ' +
        'La temperatura subió a quince grados centígrados por unas cuatro horas.',
      lang: 'es',
      translation:
        'Yes, I understand. The refrigerator had failures last night. ' +
        'The temperature rose to fifteen degrees Celsius for about four hours.',
      timestamp: Date.now(),
    });
  });

  // --- 25.0s – AI follow-up with action request ------------------------------
  schedule(25000, () => {
    emitTranscript(io, {
      id: uuidv4(),
      speaker: 'AI',
      text:
        'Entendido, Bob. Con esa exposición de temperatura, el lote está completamente comprometido. ' +
        'Necesitamos rechazar el envío completo y documentar las condiciones del refrigerador. ' +
        '¿Puede tomar fotografías del equipo ahora mismo?',
      lang: 'es',
      translation:
        'Understood, Bob. With that temperature exposure, the lot is completely compromised. ' +
        'We need to reject the entire shipment and document the refrigerator conditions. ' +
        'Can you take photos of the equipment right now?',
      timestamp: Date.now(),
    });
  });

  // --- 31.0s – Bob confirms he will act --------------------------------------
  schedule(31000, () => {
    emitTranscript(io, {
      id: uuidv4(),
      speaker: 'Bob',
      text: 'Sí, tomaré las fotos ahora. También avisaré al supervisor de inmediato.',
      lang: 'es',
      translation: 'Yes, I will take the photos now. I will also notify the supervisor immediately.',
      timestamp: Date.now(),
    });
  });

  // --- 35.0s – AI closes the call --------------------------------------------
  schedule(35000, () => {
    emitTranscript(io, {
      id: uuidv4(),
      speaker: 'AI',
      text:
        'Perfecto, Bob. El informe de rechazo será generado automáticamente. ' +
        'Contacte al proveedor hoy mismo para coordinar el reemplazo del lote. ' +
        'Muchas gracias por su colaboración. ¡Que tenga un buen día!',
      lang: 'es',
      translation:
        'Perfect, Bob. The rejection report will be generated automatically. ' +
        'Contact the supplier today to coordinate lot replacement. ' +
        'Thank you very much for your cooperation. Have a great day!',
      timestamp: Date.now(),
    });
  });

  // --- 38.0s – Call ended ----------------------------------------------------
  schedule(38000, () => {
    io.emit('call:status', {
      status: 'ended',
      message: 'Call completed — 38 seconds',
    });
    console.log('[Simulation] call:status → ended');
    console.log('[Simulation] Demo simulation complete ✓');
  });
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = { runDemoSimulation };
