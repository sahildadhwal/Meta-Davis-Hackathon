import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { Socket } from 'socket.io-client';
import { AppState, DiagnosisData, CallStatus, Transcript } from '../types';
import { DEFAULT_BACKEND_URL } from '../constants/config';
import { getSocket, disconnectSocket } from '../services/socket';
import * as api from '../services/api';

// ─── Actions ────────────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_DEMO_MODE'; payload: boolean }
  | { type: 'SET_DIAGNOSIS'; payload: DiagnosisData }
  | { type: 'SET_ANALYZING'; payload: boolean }
  | { type: 'SET_IMAGE_URI'; payload: string | null }
  | { type: 'SET_CALL_STATUS'; payload: CallStatus }
  | { type: 'ADD_TRANSCRIPT'; payload: Transcript }
  | { type: 'CLEAR_TRANSCRIPTS' }
  | { type: 'SET_CALL_LANGUAGE'; payload: string }
  | { type: 'SET_SOCKET_CONNECTED'; payload: boolean }
  | { type: 'SET_BACKEND_URL'; payload: string };

// ─── Initial State ───────────────────────────────────────────────────────────

const initialState: AppState = {
  demoMode: true,
  diagnosis: null,
  isAnalyzing: false,
  uploadedImageUri: null,
  callStatus: { status: 'idle', message: 'Ready' },
  transcripts: [],
  callLanguage: 'en',
  isSocketConnected: false,
  backendUrl: DEFAULT_BACKEND_URL,
};

// ─── Reducer ─────────────────────────────────────────────────────────────────

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_DEMO_MODE':
      return { ...state, demoMode: action.payload };
    case 'SET_DIAGNOSIS':
      return { ...state, diagnosis: action.payload, isAnalyzing: false };
    case 'SET_ANALYZING':
      return { ...state, isAnalyzing: action.payload };
    case 'SET_IMAGE_URI':
      return { ...state, uploadedImageUri: action.payload };
    case 'SET_CALL_STATUS':
      return { ...state, callStatus: action.payload };
    case 'ADD_TRANSCRIPT':
      return { ...state, transcripts: [...state.transcripts, action.payload] };
    case 'CLEAR_TRANSCRIPTS':
      return { ...state, transcripts: [], callLanguage: 'en', callStatus: { status: 'idle', message: 'Ready' } };
    case 'SET_CALL_LANGUAGE':
      return { ...state, callLanguage: action.payload };
    case 'SET_SOCKET_CONNECTED':
      return { ...state, isSocketConnected: action.payload };
    case 'SET_BACKEND_URL':
      return { ...state, backendUrl: action.payload };
    default:
      return state;
  }
}

// ─── Demo Diagnosis ───────────────────────────────────────────────────────────

const DEMO_DIAGNOSIS: DiagnosisData = {
  status: 'BAD_QUALITY',
  produceType: 'Romaine Lettuce',
  issues: [
    'Severe wilting detected',
    'Dark necrotic spots on leaves',
    'Temperature damage (cold chain failure)',
    'Packaging integrity compromised',
  ],
  severity: 'HIGH',
  severityScore: 8,
  summary:
    'This lettuce shipment shows significant quality issues caused by cold chain failure. The produce is not suitable for distribution.',
  recommendations: [
    'Reject entire Lot #6 shipment immediately',
    'Contact supplier to initiate replacement',
    'Document refrigerator temperature logs',
    'File quality incident report',
  ],
  workerScript:
    'Bob, we have a serious problem with Lot 6. The lettuce has gone bad due to refrigerator failure. We need to reject the whole shipment right away.',
  lotNumber: 'Lot #6',
};

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  analyzeImage: (uri: string) => Promise<void>;
  callBob: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const socketRef = useRef<Socket | null>(null);
  const demoTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Connect socket
  useEffect(() => {
    try {
      const sock = getSocket(state.backendUrl);
      socketRef.current = sock;

      sock.on('connect', () => {
        dispatch({ type: 'SET_SOCKET_CONNECTED', payload: true });
      });
      sock.on('disconnect', () => {
        dispatch({ type: 'SET_SOCKET_CONNECTED', payload: false });
      });
      sock.on('analysis:complete', (data: DiagnosisData) => {
        dispatch({ type: 'SET_DIAGNOSIS', payload: data });
      });
      sock.on('call:status', (data: CallStatus) => {
        dispatch({ type: 'SET_CALL_STATUS', payload: data });
      });
      sock.on('call:language', (lang: string) => {
        dispatch({ type: 'SET_CALL_LANGUAGE', payload: lang });
      });
      sock.on('transcript', (transcript: Transcript) => {
        dispatch({ type: 'ADD_TRANSCRIPT', payload: transcript });
      });
      sock.on('transcripts:cleared', () => {
        dispatch({ type: 'CLEAR_TRANSCRIPTS' });
      });
    } catch (_err) {
      // Socket connection failed — running in demo/offline mode
    }

    return () => {
      disconnectSocket();
    };
  }, [state.backendUrl]);

  // ─── analyzeImage ────────────────────────────────────────────────────────

  const analyzeImage = useCallback(
    async (uri: string) => {
      dispatch({ type: 'SET_IMAGE_URI', payload: uri });
      dispatch({ type: 'SET_ANALYZING', payload: true });

      if (state.demoMode) {
        await new Promise<void>((resolve) => setTimeout(resolve, 2000));
        dispatch({ type: 'SET_DIAGNOSIS', payload: { ...DEMO_DIAGNOSIS, imageUrl: uri } });
      } else {
        try {
          const result = await api.analyzeImage(uri, state.backendUrl);
          dispatch({ type: 'SET_DIAGNOSIS', payload: result });
        } catch (err) {
          dispatch({ type: 'SET_ANALYZING', payload: false });
          throw err;
        }
      }
    },
    [state.demoMode, state.backendUrl],
  );

  // ─── callBob ─────────────────────────────────────────────────────────────

  const callBob = useCallback(async () => {
    // Clear any existing demo timers
    demoTimersRef.current.forEach(clearTimeout);
    demoTimersRef.current = [];

    if (state.demoMode) {
      // Demo simulation with scripted conversation
      const addTimer = (ms: number, fn: () => void) => {
        const t = setTimeout(fn, ms);
        demoTimersRef.current.push(t);
      };

      const makeTranscript = (
        speaker: 'AI' | 'Bob',
        text: string,
        lang: string,
        translation: string | null,
      ): Transcript => ({
        id: `demo-${Date.now()}-${Math.random()}`,
        speaker,
        text,
        lang,
        translation,
        timestamp: Date.now(),
      });

      addTimer(1000, () => {
        dispatch({ type: 'SET_CALL_STATUS', payload: { status: 'dialing', message: 'Calling Bob...' } });
      });

      addTimer(2500, () => {
        dispatch({ type: 'SET_CALL_STATUS', payload: { status: 'ringing', message: 'Ringing...' } });
      });

      addTimer(4000, () => {
        dispatch({ type: 'SET_CALL_STATUS', payload: { status: 'connected', message: 'Bob answered' } });
      });

      addTimer(5000, () => {
        dispatch({
          type: 'ADD_TRANSCRIPT',
          payload: makeTranscript(
            'AI',
            'Hello Bob. This is AgriLens AI. What is your preferred language?',
            'en',
            null,
          ),
        });
      });

      addTimer(9000, () => {
        dispatch({
          type: 'ADD_TRANSCRIPT',
          payload: makeTranscript('Bob', 'Español, por favor.', 'es', 'Spanish, please.'),
        });
      });

      addTimer(10000, () => {
        dispatch({ type: 'SET_CALL_LANGUAGE', payload: 'es' });
      });

      addTimer(12000, () => {
        dispatch({
          type: 'ADD_TRANSCRIPT',
          payload: makeTranscript(
            'AI',
            'Hola Bob. Hemos inspeccionado el Lote número seis y encontramos problemas graves. Las lechugas muestran deterioro severo: marchitez, manchas oscuras y temperatura inadecuada. Severidad: ALTA.',
            'es',
            'Hello Bob. We inspected Lot number six and found serious problems. The lettuces show severe deterioration: wilting, dark spots, and inadequate temperature. Severity: HIGH.',
          ),
        });
      });

      addTimer(20000, () => {
        dispatch({
          type: 'ADD_TRANSCRIPT',
          payload: makeTranscript(
            'Bob',
            'Sí, el refrigerador falló anoche. La temperatura subió a quince grados por cuatro horas.',
            'es',
            'Yes, the refrigerator failed last night. The temperature rose to fifteen degrees for four hours.',
          ),
        });
      });

      addTimer(25000, () => {
        dispatch({
          type: 'ADD_TRANSCRIPT',
          payload: makeTranscript(
            'AI',
            'Entendido. Debemos rechazar el lote completo. ¿Puede documentar el estado del refrigerador con fotos?',
            'es',
            'Understood. We must reject the entire lot. Can you document the refrigerator condition with photos?',
          ),
        });
      });

      addTimer(31000, () => {
        dispatch({
          type: 'ADD_TRANSCRIPT',
          payload: makeTranscript(
            'Bob',
            'Sí, tomaré fotos ahora y avisaré al supervisor.',
            'es',
            'Yes, I will take photos now and notify the supervisor.',
          ),
        });
      });

      addTimer(35000, () => {
        dispatch({
          type: 'ADD_TRANSCRIPT',
          payload: makeTranscript(
            'AI',
            'Perfecto. El informe será generado automáticamente. ¡Gracias Bob!',
            'es',
            'Perfect. The report will be generated automatically. Thank you Bob!',
          ),
        });
      });

      addTimer(38000, () => {
        dispatch({
          type: 'SET_CALL_STATUS',
          payload: { status: 'ended', message: 'Call completed · 38s' },
        });
      });
    } else {
      try {
        await api.callBob(false, state.diagnosis, state.backendUrl);
      } catch (err) {
        throw err;
      }
    }
  }, [state.demoMode, state.diagnosis, state.backendUrl]);

  return (
    <AppContext.Provider value={{ state, dispatch, analyzeImage, callBob }}>
      {children}
    </AppContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within AppProvider');
  }
  return ctx;
}
