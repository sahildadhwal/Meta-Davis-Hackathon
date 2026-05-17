import AsyncStorage from '@react-native-async-storage/async-storage';
import type { InspectionSession } from '../../types/index';

const STORAGE_KEY = 'produce-inspection-session-v1';

function isValidSession(obj: unknown): obj is InspectionSession {
  if (!obj || typeof obj !== 'object') return false;
  const s = obj as Record<string, unknown>;
  return (
    typeof s.sessionId === 'string' &&
    typeof s.createdAt === 'string' &&
    typeof s.updatedAt === 'string' &&
    Array.isArray(s.timeline)
  );
}

export async function loadInspectionSession(): Promise<InspectionSession | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isValidSession(parsed)) {
      await AsyncStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    await AsyncStorage.removeItem(STORAGE_KEY).catch(() => null);
    return null;
  }
}

export async function saveInspectionSession(session: InspectionSession): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export async function clearInspectionSession(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

export async function hasInspectionSession(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw !== null;
  } catch {
    return false;
  }
}
