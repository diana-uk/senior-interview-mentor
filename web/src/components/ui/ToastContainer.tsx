import { useState, useEffect, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { subscribe } from '../../utils/toast.js';
import type { ToastEvent, ToastType } from '../../utils/toast.js';

const TYPE_CONFIG: Record<ToastType, { icon: typeof CheckCircle; color: string; role: 'status' | 'alert' }> = {
  success: { icon: CheckCircle,    color: 'var(--neon-lime)',  role: 'status' },
  info:    { icon: Info,           color: 'var(--neon-cyan)',  role: 'status' },
  warning: { icon: AlertTriangle,  color: 'var(--neon-amber)', role: 'status' },
  error:   { icon: AlertCircle,    color: 'var(--neon-red)',   role: 'alert'  },
};

interface ActiveToast extends ToastEvent {
  exiting: boolean;
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ActiveToast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.map((t) => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 300);
  }, []);

  useEffect(() => {
    return subscribe((event) => {
      const toast: ActiveToast = { ...event, exiting: false };
      setToasts((prev) => [...prev, toast]);
      if (event.duration > 0) {
        setTimeout(() => dismiss(event.id), event.duration);
      }
    });
  }, [dismiss]);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => {
        const { icon: Icon, color, role } = TYPE_CONFIG[toast.type];
        return (
          <div
            key={toast.id}
            role={role}
            className={`toast toast-${toast.type}${toast.exiting ? ' toast-exit' : ''}`}
          >
            <Icon size={14} color={color} aria-hidden="true" style={{ flexShrink: 0 }} />
            <span className="toast-message">{toast.message}</span>
            <button
              type="button"
              className="toast-close"
              aria-label="Dismiss notification"
              onClick={() => dismiss(toast.id)}
            >
              <X size={12} aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
