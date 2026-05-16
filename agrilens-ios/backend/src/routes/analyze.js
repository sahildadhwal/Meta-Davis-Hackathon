/**
 * AgriLens iOS - Analyze Route
 *
 * POST /api/analyze-image
 *
 * Accepts a multipart/form-data image upload, runs it through Gemini Vision
 * for produce quality analysis, and broadcasts the result via Socket.io.
 *
 * iOS note: also accepts image/heic (iPhone native format).
 */

'use strict';

const path = require('path');
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const geminiService = require('../services/gemini');

const router = express.Router();

// ---------------------------------------------------------------------------
// Multer – disk storage configuration
// ---------------------------------------------------------------------------

// Ensure the uploads directory exists (also done in index.js, but belt + braces)
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('[Analyze] Created uploads directory:', uploadsDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Use timestamp + original extension for uniqueness
    const ext = path.extname(file.originalname) || '.jpg';
    const filename = `${Date.now()}${ext}`;
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: ${allowedMimes.join(', ')}`));
    }
  },
});

// ---------------------------------------------------------------------------
// POST /api/analyze-image
// ---------------------------------------------------------------------------

router.post('/analyze-image', upload.single('image'), async (req, res) => {
  console.log('[Analyze] POST /api/analyze-image received');

  // --- Validate upload -------------------------------------------------------
  if (!req.file) {
    console.warn('[Analyze] No image file in request');
    return res.status(400).json({
      success: false,
      error: 'No image file provided. Send the image as multipart/form-data field "image".',
    });
  }

  const { filename, path: filePath, mimetype } = req.file;
  console.log('[Analyze] Received file:', filename, '| type:', mimetype, '| size:', req.file.size, 'bytes');

  try {
    // --- Read file and convert to base64 -------------------------------------
    const fileBuffer = fs.readFileSync(filePath);
    const imageBase64 = fileBuffer.toString('base64');
    console.log('[Analyze] File read and encoded – base64 length:', imageBase64.length);

    // --- Run Gemini analysis -------------------------------------------------
    console.log('[Analyze] Sending to Gemini Vision...');
    const analysisResult = await geminiService.analyzeProduceImage(imageBase64, mimetype);
    console.log('[Analyze] Gemini analysis complete – status:', analysisResult.status, '| severity:', analysisResult.severity);

    // --- Build response payload ----------------------------------------------
    const imageUrl = `/uploads/${filename}`;
    const responseData = {
      ...analysisResult,
      imageUrl,
    };

    // --- Broadcast via Socket.io ---------------------------------------------
    const io = req.app.get('io');
    if (io) {
      io.emit('analysis:complete', responseData);
      console.log('[Analyze] Emitted analysis:complete via Socket.io');
    } else {
      console.warn('[Analyze] Socket.io instance not available on app');
    }

    // --- Send HTTP response --------------------------------------------------
    return res.status(200).json({
      success: true,
      data: responseData,
      lotNumber: 'Lot #6',
    });
  } catch (err) {
    console.error('[Analyze] Error during image analysis:', err.message);
    console.error(err.stack);

    return res.status(500).json({
      success: false,
      error: 'Image analysis failed. Please try again.',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
});

// ---------------------------------------------------------------------------
// Error handler for multer errors (file size, type)
// ---------------------------------------------------------------------------

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('[Analyze] Multer error:', err.message);
    return res.status(400).json({ success: false, error: `Upload error: ${err.message}` });
  }
  if (err) {
    console.error('[Analyze] Route error:', err.message);
    return res.status(400).json({ success: false, error: err.message });
  }
  next();
});

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = router;
