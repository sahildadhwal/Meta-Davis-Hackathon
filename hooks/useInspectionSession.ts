import { useState, useEffect, useCallback, useRef } from 'react';
import type { InspectionSession, InspectionResult } from '../types/index';
import {
  loadInspectionSession,
  saveInspectionSession,
  clearInspectionSession,
  createEmptyInspectionSession,
  createMockNeedsAttentionSession,
} from '../services/session/index';

interface UseInspectionSessionReturn {
  session: InspectionSession | null;
  isLoaded: boolean;
  error: string | null;
  createNewSession: () => Promise<void>;
  updateSession: (patch: Partial<InspectionSession>) => Promise<void>;
  resetSession: () => Promise<void>;
  markTimeline: (id: string) => Promise<void>;
  loadMockNeedsAttentionSession: () => Promise<void>;
  setCapturedImage: (uri: string) => Promise<void>;
  setInspectionResult: (result: InspectionResult, nextAction: string) => Promise<void>;
}

export function useInspectionSession(): UseInspectionSessionReturn {
  const [session, setSession] = useState<InspectionSession | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref holds latest session so sequential async calls don't overwrite each other
  // via stale closures. updateSession always reads from here, not from the render-
  // time snapshot.
  const latestSession = useRef<InspectionSession | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const stored = await loadInspectionSession();
        const s = stored ?? createEmptyInspectionSession();
        if (!stored) await saveInspectionSession(s);
        latestSession.current = s;
        setSession(s);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load session');
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  const updateSession = useCallback(async (patch: Partial<InspectionSession>) => {
    const current = latestSession.current;
    if (!current) return;
    const updated: InspectionSession = {
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    latestSession.current = updated;
    try {
      await saveInspectionSession(updated);
      setSession(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update session');
    }
  }, []);

  const createNewSession = useCallback(async () => {
    try {
      const fresh = createEmptyInspectionSession();
      latestSession.current = fresh;
      await saveInspectionSession(fresh);
      setSession(fresh);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create session');
    }
  }, []);

  const resetSession = useCallback(async () => {
    try {
      await clearInspectionSession();
      const fresh = createEmptyInspectionSession();
      latestSession.current = fresh;
      await saveInspectionSession(fresh);
      setSession(fresh);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to reset session');
    }
  }, []);

  const markTimeline = useCallback(
    async (id: string) => {
      const current = latestSession.current;
      if (!current) return;
      const now = new Date().toISOString();
      const timeline = current.timeline.map((event) =>
        event.id === id
          ? { ...event, status: 'completed' as const, timestamp: now }
          : event,
      );
      await updateSession({ timeline });
    },
    [updateSession],
  );

  const loadMockNeedsAttentionSession = useCallback(async () => {
    try {
      const mock = createMockNeedsAttentionSession();
      latestSession.current = mock;
      await saveInspectionSession(mock);
      setSession(mock);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load mock session');
    }
  }, []);

  // Atomically saves image URI + marks image-captured timeline in one write.
  const setCapturedImage = useCallback(
    async (uri: string) => {
      const current = latestSession.current;
      if (!current) return;
      const now = new Date().toISOString();
      const timeline = current.timeline.map((event) =>
        event.id === 'image-captured'
          ? { ...event, status: 'completed' as const, timestamp: now }
          : event,
      );
      await updateSession({ imageUri: uri, imageCaptured: true, timeline });
    },
    [updateSession],
  );

  // Atomically saves inspection result + marks produce-analyzed timeline in one write.
  const setInspectionResult = useCallback(
    async (result: InspectionResult, nextAction: string) => {
      const current = latestSession.current;
      if (!current) return;
      const now = new Date().toISOString();
      const timeline = current.timeline.map((event) =>
        event.id === 'produce-analyzed'
          ? { ...event, status: 'completed' as const, timestamp: now }
          : event,
      );
      await updateSession({ inspectionResult: result, nextAction, timeline });
    },
    [updateSession],
  );

  return {
    session,
    isLoaded,
    error,
    createNewSession,
    updateSession,
    resetSession,
    markTimeline,
    loadMockNeedsAttentionSession,
    setCapturedImage,
    setInspectionResult,
  };
}
