// ─── Produce Inspection ──────────────────────────────────────────────────────

export type ProduceStatus = 'Sufficient' | 'Needs attention' | 'Not sufficient';

export type ConfidenceLevel = 'low' | 'medium' | 'high';

export interface InspectionResult {
  produceStatus: ProduceStatus;
  identifiedIssue: string;
  suggestedSolution: string;
  spokenMessage: string;
  confidence: ConfidenceLevel;
}

// ─── Timeline ────────────────────────────────────────────────────────────────

export type TimelineEventStatus = 'pending' | 'completed';

export interface TimelineEvent {
  id: string;
  label: string;
  status: TimelineEventStatus;
  timestamp: string | null;
}

// ─── Bob Communication ───────────────────────────────────────────────────────

export type BobCommunicationStatus =
  | 'not_started'
  | 'language_requested'
  | 'message_sent'
  | 'response_received'
  | 'translated';

export interface BobCommunicationState {
  preferredLanguage: string | null;
  messageToBob: string | null;
  bobResponseOriginal: string | null;
  bobResponseTranslated: string | null;
  communicationStatus: BobCommunicationStatus;
}

// ─── Session ─────────────────────────────────────────────────────────────────

export interface InspectionSession {
  sessionId: string;
  imageUri: string | null;
  imageCaptured: boolean;
  inspectionResult: InspectionResult | null;
  userConfirmedNotifyBob: boolean;
  bobCommunication: BobCommunicationState;
  nextAction: string | null;
  timeline: TimelineEvent[];
  createdAt: string;
  updatedAt: string;
}
