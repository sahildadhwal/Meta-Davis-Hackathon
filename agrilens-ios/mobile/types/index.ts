export interface DiagnosisData {
  status: 'BAD_QUALITY' | 'ACCEPTABLE' | 'GOOD';
  produceType: string;
  issues: string[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  severityScore: number;
  summary: string;
  recommendations: string[];
  workerScript: string;
  imageUrl?: string;
  lotNumber: string;
}

export interface Transcript {
  id: string;
  speaker: 'AI' | 'Bob';
  text: string;
  lang: string;
  translation: string | null;
  timestamp: number;
}

export type CallStatusType = 'idle' | 'dialing' | 'ringing' | 'connected' | 'ended';

export interface CallStatus {
  status: CallStatusType;
  message: string;
}

export interface AppState {
  demoMode: boolean;
  diagnosis: DiagnosisData | null;
  isAnalyzing: boolean;
  uploadedImageUri: string | null;
  callStatus: CallStatus;
  transcripts: Transcript[];
  callLanguage: string;
  isSocketConnected: boolean;
  backendUrl: string;
}
