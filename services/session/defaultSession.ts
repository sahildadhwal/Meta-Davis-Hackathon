import type {
  InspectionSession,
  TimelineEvent,
  BobCommunicationState,
} from '../../types/index';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

const TIMELINE_DEFINITIONS: Array<{ id: string; label: string }> = [
  { id: 'image-captured',          label: 'Image captured'                 },
  { id: 'produce-analyzed',        label: 'Produce analyzed'               },
  { id: 'diagnosis-spoken',        label: 'Diagnosis spoken'               },
  { id: 'user-confirmed-bob',      label: 'User confirmed Bob notification' },
  { id: 'bob-selected-language',   label: 'Bob selected language'          },
  { id: 'spanish-update-sent',     label: 'Spanish update sent'            },
  { id: 'bob-response-translated', label: 'Bob response translated'        },
  { id: 'dashboard-synced',        label: 'Dashboard synced'               },
];

export function createTimeline(): TimelineEvent[] {
  return TIMELINE_DEFINITIONS.map(({ id, label }) => ({
    id,
    label,
    status: 'pending',
    timestamp: null,
  }));
}

const emptyBobState: BobCommunicationState = {
  preferredLanguage: null,
  messageToBob: null,
  bobResponseOriginal: null,
  bobResponseTranslated: null,
  communicationStatus: 'not_started',
};

export function createEmptyInspectionSession(): InspectionSession {
  const now = new Date().toISOString();
  return {
    sessionId: generateId(),
    imageUri: null,
    imageCaptured: false,
    inspectionResult: null,
    userConfirmedNotifyBob: false,
    bobCommunication: { ...emptyBobState },
    nextAction: null,
    timeline: createTimeline(),
    createdAt: now,
    updatedAt: now,
  };
}

export function createMockNeedsAttentionSession(): InspectionSession {
  const now = new Date().toISOString();
  const timeline = createTimeline().map((event) => {
    const completedIds = [
      'image-captured',
      'produce-analyzed',
      'diagnosis-spoken',
      'user-confirmed-bob',
      'bob-selected-language',
      'spanish-update-sent',
      'bob-response-translated',
    ];
    if (completedIds.includes(event.id)) {
      return { ...event, status: 'completed' as const, timestamp: now };
    }
    return event;
  });

  return {
    sessionId: generateId(),
    imageUri: null,
    imageCaptured: true,
    inspectionResult: {
      produceStatus: 'Needs attention',
      identifiedIssue: 'Some produce appears damaged or quality is uncertain.',
      suggestedSolution: 'Set the box aside and mark it for manual inspection.',
      spokenMessage:
        "I'm seeing a possible quality issue with this box. Some produce may be damaged or below expected condition. I recommend setting it aside for inspection.",
      confidence: 'medium',
    },
    userConfirmedNotifyBob: true,
    bobCommunication: {
      preferredLanguage: 'Spanish',
      messageToBob:
        'Hola Bob, detecté un posible problema con una caja de productos. Algunos productos parecen dañados o no están en buenas condiciones. Recomiendo separar esta caja, marcarla para inspección y revisar si otras cajas cercanas tienen el mismo problema.',
      bobResponseOriginal: 'Está bien, sepárala y revisaré la caja cuando llegue.',
      bobResponseTranslated: "Okay, set it aside and I'll inspect the box when I arrive.",
      communicationStatus: 'translated',
    },
    nextAction: 'Keep the box separated until Bob reviews it.',
    timeline,
    createdAt: now,
    updatedAt: now,
  };
}
