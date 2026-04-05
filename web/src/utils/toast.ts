export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastEvent {
  id: string;
  message: string;
  type: ToastType;
  duration: number; // ms; 0 = persist until manually closed
}

type Listener = (event: ToastEvent) => void;

const listeners: Listener[] = [];

export function subscribe(listener: Listener): () => void {
  listeners.push(listener);
  return () => {
    const i = listeners.indexOf(listener);
    if (i > -1) listeners.splice(i, 1);
  };
}

export function showToast(message: string, type: ToastType = 'info', duration = 3000): void {
  const event: ToastEvent = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    message,
    type,
    duration,
  };
  listeners.forEach((l) => l(event));
}
