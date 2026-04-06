import { WifiOff } from 'lucide-react';

/**
 * Amber banner shown in ChatPanel when the browser reports no network connectivity.
 */
export default function OfflineBanner() {
  return (
    <div
      className="offline-banner"
      role="status"
      aria-live="polite"
      aria-label="Offline notification"
    >
      <WifiOff size={14} aria-hidden="true" />
      <span>You're offline — chat is unavailable. Your progress is saved locally.</span>
    </div>
  );
}
