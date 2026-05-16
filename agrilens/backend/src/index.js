/**
 * AgriLens AI - Backend Server
 *
 * Express + Socket.io server powering the AgriLens AI hackathon demo.
 *
 * Services:
 *   - Google Gemini (vision + text)
 *   - ElevenLabs (text-to-speech)
 *   - Deepgram (speech-to-text)
 *   - Twilio (outbound phone calls)
 *   - Socket.io (real-time frontend updates)
 *
 * Endpoints:
 *   POST /api/analyze-image  – Produce quality inspection
 *   POST /api/call-bob       – Initiate AI phone call
 *   GET  /api/transcripts    – Retrieve call transcripts
 *   DELETE /api/transcripts  – Clear transcript store
 *   GET/POST /api/twiml/*    – Twilio webhook handlers
 *   GET  /uploads/*          – Static image serving
 */

'use strict';

// Load environment variables first – must happen before any other import
require('dotenv').config();

const path = require('path');
const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');

// ---------------------------------------------------------------------------
// Route imports
// ---------------------------------------------------------------------------

const analyzeRouter = require('./routes/analyze');
const callRouter = require('./routes/call');
const transcriptsRouter = require('./routes/transcripts');

// ---------------------------------------------------------------------------
// App & server setup
// ---------------------------------------------------------------------------

const app = express();
const httpServer = http.createServer(app);

// Socket.io – allow all origins for hackathon simplicity
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    credentials: false,
  },
  // Increase ping timeout for demo stability
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Make `io` accessible everywhere:
// 1. Via req.app.get('io') inside route handlers
// 2. Via global.io for modules that don't have access to req/res
app.set('io', io);
global.io = io;

// ---------------------------------------------------------------------------
// Global in-memory transcript store
// ---------------------------------------------------------------------------

global.transcripts = [];

// ---------------------------------------------------------------------------
// Express middleware
// ---------------------------------------------------------------------------

// CORS – allow all origins for hackathon frontend dev
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS', 'PUT', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: false,
  })
);

// Parse JSON and URL-encoded bodies
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ---------------------------------------------------------------------------
// Static file serving – uploaded produce images
// ---------------------------------------------------------------------------

const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));
console.log('[Server] Serving uploads from:', uploadsPath);

// ---------------------------------------------------------------------------
// Health check / root endpoint
// ---------------------------------------------------------------------------

app.get('/', (req, res) => {
  res.json({
    name: 'AgriLens AI Backend',
    version: '0.1.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      analyzeImage: 'POST /api/analyze-image',
      callBob: 'POST /api/call-bob',
      transcripts: 'GET /api/transcripts',
      clearTranscripts: 'DELETE /api/transcripts',
      twimlGreeting: 'GET /api/twiml/greeting',
    },
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ---------------------------------------------------------------------------
// API routes
// ---------------------------------------------------------------------------

app.use('/api', analyzeRouter);
app.use('/api', callRouter);
app.use('/api', transcriptsRouter);

// ---------------------------------------------------------------------------
// 404 handler for unmatched routes
// ---------------------------------------------------------------------------

app.use((req, res) => {
  console.warn('[Server] 404 –', req.method, req.originalUrl);
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ---------------------------------------------------------------------------
// Global error handler
// ---------------------------------------------------------------------------

app.use((err, req, res, next) => {
  console.error('[Server] Unhandled error:', err.message);
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ---------------------------------------------------------------------------
// Socket.io event handlers
// ---------------------------------------------------------------------------

io.on('connection', (socket) => {
  console.log('[Socket.io] Client connected – ID:', socket.id);

  // Send current transcript history to newly connected clients
  if (global.transcripts && global.transcripts.length > 0) {
    socket.emit('transcripts:history', global.transcripts);
    console.log('[Socket.io] Sent', global.transcripts.length, 'historical transcripts to', socket.id);
  }

  // Simple ping/pong for connection health checks
  socket.on('ping', () => {
    console.log('[Socket.io] Ping from', socket.id);
    socket.emit('pong', { timestamp: Date.now() });
  });

  // Client can request a fresh copy of transcripts
  socket.on('request:transcripts', () => {
    console.log('[Socket.io] request:transcripts from', socket.id);
    socket.emit('transcripts:history', global.transcripts || []);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket.io] Client disconnected – ID:', socket.id, '| Reason:', reason);
  });

  socket.on('error', (err) => {
    console.error('[Socket.io] Socket error – ID:', socket.id, '|', err.message);
  });
});

// ---------------------------------------------------------------------------
// Server startup
// ---------------------------------------------------------------------------

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║           AgriLens AI — Backend Server                  ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`  HTTP server  : http://localhost:${PORT}`);
  console.log(`  Socket.io    : ws://localhost:${PORT}`);
  console.log(`  Environment  : ${process.env.NODE_ENV || 'development'}`);
  console.log('');
  console.log('  Service status:');
  console.log(`  [${process.env.GEMINI_API_KEY ? '✓' : '✗'}] Google Gemini        ${process.env.GEMINI_API_KEY ? 'API key set' : 'GEMINI_API_KEY missing – using fallback'}`);
  console.log(`  [${process.env.ELEVENLABS_API_KEY ? '✓' : '✗'}] ElevenLabs TTS      ${process.env.ELEVENLABS_API_KEY ? 'API key set' : 'ELEVENLABS_API_KEY missing – TTS disabled'}`);
  console.log(`  [${process.env.DEEPGRAM_API_KEY ? '✓' : '✗'}] Deepgram STT        ${process.env.DEEPGRAM_API_KEY ? 'API key set' : 'DEEPGRAM_API_KEY missing – STT disabled'}`);
  console.log(`  [${process.env.TWILIO_ACCOUNT_SID ? '✓' : '✗'}] Twilio Calls        ${process.env.TWILIO_ACCOUNT_SID ? 'Configured' : 'TWILIO_ACCOUNT_SID missing – demo mode only'}`);
  console.log('');
  console.log('  Ready to receive requests.');
  console.log('');
});

// ---------------------------------------------------------------------------
// Graceful shutdown
// ---------------------------------------------------------------------------

process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received – shutting down gracefully...');
  httpServer.close(() => {
    console.log('[Server] HTTP server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n[Server] SIGINT received – shutting down gracefully...');
  httpServer.close(() => {
    console.log('[Server] HTTP server closed.');
    process.exit(0);
  });
});

// Catch unhandled promise rejections to prevent silent failures
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Server] Unhandled Promise Rejection at:', promise, '| Reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[Server] Uncaught Exception:', err.message);
  console.error(err.stack);
  // Give logs a moment to flush, then exit – supervisor/nodemon will restart
  process.exit(1);
});

module.exports = { app, httpServer, io };
