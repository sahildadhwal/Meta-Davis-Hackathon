/**
 * AgriLens AI - Transcripts Route
 *
 * Manages the in-memory transcript store.
 *
 * Routes:
 *   GET    /api/transcripts  – Retrieve all transcripts
 *   DELETE /api/transcripts  – Clear all transcripts
 */

'use strict';

const express = require('express');

const router = express.Router();

// ---------------------------------------------------------------------------
// GET /api/transcripts
// ---------------------------------------------------------------------------

/**
 * Return all transcripts stored in memory since the server started
 * (or since the last DELETE call).
 *
 * Response:
 *   { success: true, data: [ ...transcripts ], count: number }
 */
router.get('/transcripts', (req, res) => {
  console.log('[Transcripts] GET /api/transcripts');

  const transcripts = global.transcripts || [];
  console.log('[Transcripts] Returning', transcripts.length, 'transcript(s)');

  return res.status(200).json({
    success: true,
    data: transcripts,
    count: transcripts.length,
  });
});

// ---------------------------------------------------------------------------
// DELETE /api/transcripts
// ---------------------------------------------------------------------------

/**
 * Clear all transcripts from the in-memory store and notify connected clients.
 *
 * Response:
 *   { success: true, message: string }
 */
router.delete('/transcripts', (req, res) => {
  console.log('[Transcripts] DELETE /api/transcripts – clearing transcript store');

  // Clear the global store
  global.transcripts = [];

  // Broadcast to all Socket.io clients so frontends can clear their UI
  const io = req.app.get('io');
  if (io) {
    io.emit('transcripts:cleared', { timestamp: Date.now() });
    console.log('[Transcripts] Emitted transcripts:cleared via Socket.io');
  }

  return res.status(200).json({
    success: true,
    message: 'All transcripts cleared',
  });
});

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = router;
