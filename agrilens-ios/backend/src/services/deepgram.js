/**
 * AgriLens iOS - Deepgram Service
 *
 * Speech-to-text integration using the Deepgram SDK.
 * Supports transcription from in-memory audio buffers and remote URLs.
 */

'use strict';

const { createClient } = require('@deepgram/sdk');

// ---------------------------------------------------------------------------
// Client factory
// ---------------------------------------------------------------------------

const getClient = () => {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) {
    console.warn('[Deepgram] DEEPGRAM_API_KEY not set – transcription unavailable');
    return null;
  }
  return createClient(apiKey);
};

// ---------------------------------------------------------------------------
// Helper – extract transcript string from Deepgram result
// ---------------------------------------------------------------------------

function extractTranscript(result) {
  try {
    const channels = result.results.channels;
    if (!channels || channels.length === 0) return '';
    const alternatives = channels[0].alternatives;
    if (!alternatives || alternatives.length === 0) return '';
    return alternatives[0].transcript || '';
  } catch (err) {
    console.error('[Deepgram] Failed to extract transcript from result:', err.message);
    return '';
  }
}

// ---------------------------------------------------------------------------
// transcribeAudio
// ---------------------------------------------------------------------------

/**
 * Transcribe audio from an in-memory Buffer.
 *
 * @param {Buffer} audioBuffer - Raw audio data
 * @param {string} mimeType    - Audio MIME type, e.g. 'audio/wav'
 * @returns {Promise<string|null>} Transcript text or null on failure
 */
async function transcribeAudio(audioBuffer, mimeType) {
  console.log('[Deepgram] transcribeAudio called – buffer size:', audioBuffer ? audioBuffer.length : 0, 'bytes');

  const deepgram = getClient();
  if (!deepgram) return null;

  try {
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(audioBuffer, {
      model: 'nova-2',
      smart_format: true,
      language: 'es', // Default to Spanish for Bob (AgriLens demo worker)
      mimetype: mimeType,
    });

    if (error) {
      console.error('[Deepgram] transcribeAudio API error:', error);
      return null;
    }

    const transcript = extractTranscript(result);
    console.log('[Deepgram] transcribeAudio success – transcript:', transcript.substring(0, 100));
    return transcript;
  } catch (err) {
    console.error('[Deepgram] transcribeAudio exception:', err.message);
    return null;
  }
}

// ---------------------------------------------------------------------------
// transcribeUrl
// ---------------------------------------------------------------------------

/**
 * Transcribe audio from a remote URL.
 *
 * @param {string} audioUrl  - Publicly accessible URL of the audio file
 * @param {string} language  - BCP-47 language code, e.g. 'es' or 'en-US'
 * @returns {Promise<string|null>} Transcript text or null on failure
 */
async function transcribeUrl(audioUrl, language) {
  console.log('[Deepgram] transcribeUrl called – url:', audioUrl, '| language:', language || 'es');

  const deepgram = getClient();
  if (!deepgram) return null;

  try {
    const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(
      { url: audioUrl },
      {
        model: 'nova-2',
        smart_format: true,
        language: language || 'es',
      }
    );

    if (error) {
      console.error('[Deepgram] transcribeUrl API error:', error);
      return null;
    }

    const transcript = extractTranscript(result);
    console.log('[Deepgram] transcribeUrl success – transcript:', transcript.substring(0, 100));
    return transcript;
  } catch (err) {
    console.error('[Deepgram] transcribeUrl exception:', err.message);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  transcribeAudio,
  transcribeUrl,
};
