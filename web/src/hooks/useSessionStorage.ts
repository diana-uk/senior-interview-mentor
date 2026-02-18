import { safeGetItem, safeSetItem, safeRemoveItem } from '../utils/storage.js';

const STORAGE_KEY = 'sim-session';
const STORAGE_VERSION = 1;

interface StorageEnvelope<T> {
  version: number;
  savedAt: number;
  data: T;
}

export function writeSession<T>(data: T): void {
  const envelope: StorageEnvelope<T> = {
    version: STORAGE_VERSION,
    savedAt: Date.now(),
    data,
  };
  safeSetItem(STORAGE_KEY, JSON.stringify(envelope));
}

export function readSession<T>(maxAgeMs: number): T | null {
  try {
    const raw = safeGetItem(STORAGE_KEY);
    if (!raw) return null;
    const envelope: StorageEnvelope<T> = JSON.parse(raw);
    if (envelope.version !== STORAGE_VERSION) {
      safeRemoveItem(STORAGE_KEY);
      return null;
    }
    if (Date.now() - envelope.savedAt > maxAgeMs) {
      safeRemoveItem(STORAGE_KEY);
      return null;
    }
    return envelope.data;
  } catch {
    safeRemoveItem(STORAGE_KEY);
    return null;
  }
}

export function clearSession(): void {
  safeRemoveItem(STORAGE_KEY);
}

export function createDebouncedSave<T>(delayMs: number): (data: T) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (data: T) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      writeSession(data);
      timer = null;
    }, delayMs);
  };
}
