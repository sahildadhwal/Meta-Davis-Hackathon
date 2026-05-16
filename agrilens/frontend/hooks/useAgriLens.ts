'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { getSocket, disconnectSocket } from '@/lib/socket';
import {
  analyzeImage,
  callBob,
  DiagnosisData,
  Transcript,
  CallStatus,
  AnalysisResult,
} from '@/lib/api';

export function useAgriLens() {
  const [demoMode, setDemoMode] = useState<boolean>(true);
  const [diagnosis, setDiagnosis] = useState<DiagnosisData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [callStatus, setCallStatus] = useState<CallStatus>({
    status: 'idle',
    message: '',
  });
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [callLanguage, setCallLanguage] = useState<string>('en');
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Track blob URLs to revoke them on unmount / replacement
  const blobUrlRef = useRef<string | null>(null);

  // ── Socket Connection ──────────────────────────────────────────────────────
  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    const onAnalysisComplete = (data: DiagnosisData) => {
      setDiagnosis(data);
      setIsAnalyzing(false);
    };

    const onCallStatus = (status: CallStatus) => {
      setCallStatus(status);
    };

    const onCallLanguage = (lang: string) => {
      setCallLanguage(lang);
    };

    const onTranscript = (transcript: Transcript) => {
      setTranscripts((prev) => [...prev, transcript]);
    };

    const onTranscriptsCleared = () => {
      setTranscripts([]);
    };

    // Attach listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('analysis:complete', onAnalysisComplete);
    socket.on('call:status', onCallStatus);
    socket.on('call:language', onCallLanguage);
    socket.on('transcript', onTranscript);
    socket.on('transcripts:cleared', onTranscriptsCleared);

    // Sync initial connection state
    if (socket.connected) setIsConnected(true);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('analysis:complete', onAnalysisComplete);
      socket.off('call:status', onCallStatus);
      socket.off('call:language', onCallLanguage);
      socket.off('transcript', onTranscript);
      socket.off('transcripts:cleared', onTranscriptsCleared);
      disconnectSocket();
    };
  }, []);

  // ── Revoke stale blob URLs ─────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleImageUpload = useCallback(async (file: File) => {
    // Revoke previous blob URL
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
    }
    const objectUrl = URL.createObjectURL(file);
    blobUrlRef.current = objectUrl;

    setIsAnalyzing(true);
    setUploadedImage(objectUrl);
    setDiagnosis(null);

    try {
      const result: AnalysisResult = await analyzeImage(file);
      if (result.success && result.data) {
        setDiagnosis(result.data);
      } else {
        console.error('Analysis returned unsuccessful result:', result.error);
      }
    } catch (e) {
      console.error('Image analysis error:', e);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const handleCallBob = useCallback(async () => {
    setTranscripts([]);
    setCallLanguage('en');
    setCallStatus({ status: 'dialing', message: 'Initiating call...' });

    try {
      await callBob(demoMode, diagnosis);
    } catch (e) {
      console.error('Call Bob error:', e);
      setCallStatus({ status: 'idle', message: 'Call failed. Try again.' });
    }
  }, [demoMode, diagnosis]);

  return {
    demoMode,
    setDemoMode,
    diagnosis,
    isAnalyzing,
    uploadedImage,
    callStatus,
    transcripts,
    callLanguage,
    isConnected,
    handleImageUpload,
    handleCallBob,
  };
}
