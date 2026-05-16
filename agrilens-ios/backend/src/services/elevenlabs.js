/**
 * AgriLens iOS - ElevenLabs Service
 *
 * Text-to-speech integration with ElevenLabs API.
 * Supports returning audio as base64-encoded strings or raw Buffers.
 */

'use strict';

const fetch = require('node-fetch');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

// Default voice settings that work well for clear, professional speech
const DEFAULT_VOICE_SETTINGS = {
  stability: 0.5,
  similarity_boost: 0.75,
};

// ---------------------------------------------------------------------------
// Internal helper – fetch audio from ElevenLabs
// ---------------------------------------------------------------------------

/**
 * Calls the ElevenLabs TTS API and returns the raw audio as a Buffer.
 *
 * @param {string} text     - Text to convert to speech
 * @param {string} voiceId  - ElevenLabs voice ID
 * @param {string} modelId  - ElevenLabs model ID (defaults to eleven_multilingual_v2)
 * @returns {Promise<Buffer|null>}
 */
async function _fetchAudioBuffer(text, voiceId, modelId) {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    console.warn('[ElevenLabs] ELEVENLABS_API_KEY not set – skipping TTS request');
    return null;
  }

  if (!voiceId) {
    console.warn('[ElevenLabs] No voiceId provided – skipping TTS request');
    return null;
  }

  const url = `${ELEVENLABS_BASE_URL}/${voiceId}`;
  const body = {
    text,
    model_id: modelId || 'eleven_multilingual_v2',
    voice_settings: DEFAULT_VOICE_SETTINGS,
  };

  console.log(`[ElevenLabs] Requesting TTS – voice: ${voiceId} | model: ${body.model_id} | chars: ${text.length}`);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs API error ${response.status}: ${errorText}`);
  }

  // Read the binary audio response into a Buffer
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// ---------------------------------------------------------------------------
// textToSpeechBase64
// ---------------------------------------------------------------------------

/**
 * Convert text to speech and return the audio as a base64-encoded string.
 *
 * @param {string} text     - Text to synthesise
 * @param {string} voiceId  - ElevenLabs voice ID
 * @param {string} modelId  - ElevenLabs model ID (optional)
 * @returns {Promise<string|null>} Base64-encoded MP3 audio, or null on failure
 */
async function textToSpeechBase64(text, voiceId, modelId) {
  try {
    const buffer = await _fetchAudioBuffer(text, voiceId, modelId);
    if (!buffer) return null;

    const base64 = buffer.toString('base64');
    console.log(`[ElevenLabs] textToSpeechBase64 success – ${buffer.length} bytes`);
    return base64;
  } catch (err) {
    console.error('[ElevenLabs] textToSpeechBase64 error:', err.message);
    return null;
  }
}

// ---------------------------------------------------------------------------
// textToSpeechBuffer
// ---------------------------------------------------------------------------

/**
 * Convert text to speech and return the audio as a raw Buffer.
 *
 * @param {string} text    - Text to synthesise
 * @param {string} voiceId - ElevenLabs voice ID
 * @returns {Promise<Buffer|null>} Raw audio buffer, or null on failure
 */
async function textToSpeechBuffer(text, voiceId) {
  try {
    const buffer = await _fetchAudioBuffer(text, voiceId);
    if (!buffer) return null;

    console.log(`[ElevenLabs] textToSpeechBuffer success – ${buffer.length} bytes`);
    return buffer;
  } catch (err) {
    console.error('[ElevenLabs] textToSpeechBuffer error:', err.message);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  textToSpeechBase64,
  textToSpeechBuffer,
};
