const STORAGE_KEY = 'sim-session';
const STORAGE_VERSION = 1;

interface StorageEnvelope<T> {
  version: number;
  savedAt: number;
  data: T;
}

export function writeSession<T>(data: T): void {
  try {
    const envelope: StorageEnvelope<T> = {
      version: STORAGE_VERSION,
      savedAt: Date.now(),
      data,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
  } catch {
    // QuotaExceededError or other — silently ignore
  }
}

export function readSession<T>(maxAgeMs: number): T | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const envelope: StorageEnvelope<T> = JSON.parse(raw);
    if (envelope.version !== STORAGE_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    if (Date.now() - envelope.savedAt > maxAgeMs) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return envelope.data;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY);
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
