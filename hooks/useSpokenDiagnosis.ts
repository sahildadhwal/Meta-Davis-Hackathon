import { useState, useEffect, useCallback, useRef } from 'react';
import * as Speech from 'expo-speech';

export type SpeechStatus = 'idle' | 'speaking' | 'stopped' | 'error';

interface UseSpokenDiagnosisReturn {
  isSpeaking: boolean;
  status: SpeechStatus;
  error: string | null;
  speak: (message: string) => void;
  stop: () => void;
}

export function useSpokenDiagnosis(): UseSpokenDiagnosisReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [status, setStatus] = useState<SpeechStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      // Do NOT call Speech.stop() here — React Strict Mode runs this cleanup
      // immediately after mount and would kill any in-progress auto-speech.
      // Screen-level cleanup is handled where needed (e.g. navigation away).
    };
  }, []);

  const speak = useCallback((message: string) => {
    if (!message.trim()) {
      console.warn('[useSpokenDiagnosis] speak() called with empty message');
      return;
    }
    setError(null);
    setIsSpeaking(true);
    setStatus('speaking');

    // Stop any stuck utterance first, then start new speech in the callback.
    void Speech.stop().then(() => {
      if (!mounted.current) return;
      Speech.speak(message, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.9,
        // Separate audio session so iOS speech works regardless of camera/media session state.
        useApplicationAudioSession: false,
        onStart: () => {
          if (mounted.current) {
            setIsSpeaking(true);
            setStatus('speaking');
          }
        },
        onDone: () => {
          if (mounted.current) {
            setIsSpeaking(false);
            setStatus('stopped');
          }
        },
        onStopped: () => {
          if (mounted.current) {
            setIsSpeaking(false);
            setStatus('stopped');
          }
        },
        onError: (e: Error) => {
          console.error('[useSpokenDiagnosis] Speech error:', e);
          if (mounted.current) {
            setIsSpeaking(false);
            setStatus('error');
            setError(e.message ?? 'Speech failed.');
          }
        },
      });
    });
  }, []);

  const stop = useCallback(() => {
    void Speech.stop();
    if (mounted.current) {
      setIsSpeaking(false);
      setStatus('stopped');
    }
  }, []);

  return { isSpeaking, status, error, speak, stop };
}
