// ── TypeScript Interfaces ────────────────────────────────────────────────────

export interface DiagnosisData {
  status: string;
  produceType: string;
  issues: string[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  severityScore: number;
  summary: string;
  recommendations: string[];
  workerScript: string;
  imageUrl?: string;
  lotNumber?: string;
}

export interface Transcript {
  id: string;
  speaker: 'AI' | 'Bob';
  text: string;
  lang: string;
  translation: string | null;
  timestamp: number;
}

export interface CallStatus {
  status: 'idle' | 'dialing' | 'ringing' | 'connected' | 'ended';
  message: string;
}

export interface AnalysisResult {
  success: boolean;
  data: DiagnosisData;
  error?: string;
}

export interface CallResult {
  success: boolean;
  callSid?: string;
  message?: string;
  error?: string;
}

// ── API Base ─────────────────────────────────────────────────────────────────

const BASE_URL = '/api';

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...options.headers,
    },
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Unknown error');
    throw new Error(`API ${path} failed [${res.status}]: ${errorText}`);
  }

  return res.json() as Promise<T>;
}

// ── API Functions ─────────────────────────────────────────────────────────────

/**
 * Upload a produce image for AI quality analysis.
 */
export async function analyzeImage(file: File): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${BASE_URL}/analyze-image`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Unknown error');
    throw new Error(`analyzeImage failed [${res.status}]: ${errorText}`);
  }

  return res.json() as Promise<AnalysisResult>;
}

/**
 * Initiate a call to Bob (farm worker) via Twilio.
 */
export async function callBob(
  demoMode: boolean,
  produceInfo?: DiagnosisData | null
): Promise<CallResult> {
  return apiFetch<CallResult>('/call-bob', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ demoMode, produceInfo: produceInfo ?? null }),
  });
}

/**
 * Fetch all stored transcripts.
 */
export async function getTranscripts(): Promise<Transcript[]> {
  const result = await apiFetch<{ transcripts: Transcript[] }>('/transcripts');
  return result.transcripts ?? [];
}

/**
 * Delete all stored transcripts.
 */
export async function clearTranscripts(): Promise<void> {
  await apiFetch<void>('/transcripts', { method: 'DELETE' });
}
