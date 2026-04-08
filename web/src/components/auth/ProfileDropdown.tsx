import { useState, useRef, useEffect, useCallback } from 'react';
import { LogOut, RefreshCw, CreditCard } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import type { PlanId } from '../../config/tiers';
import { getInitials } from '../../utils/displayUtils.js';

interface ProfileDropdownProps {
  user: User;
  onSignOut: () => Promise<void>;
  onSync: () => void;
  syncing: boolean;
  plan?: PlanId;
  onManageSubscription?: () => void;
}


export default function ProfileDropdown({ user, onSignOut, onSync, syncing, plan, onManageSubscription }: ProfileDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open, handleClickOutside]);

  return (
    <div className="profile-dropdown" ref={ref}>
      <button
        type="button"
        className="profile-avatar"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={`Profile menu for ${user.email ?? 'user'}`}
        title={user.email ?? 'Profile'}
      >
        {getInitials(user)}
      </button>

      {open && (
        <div className="profile-menu">
          <div className="profile-menu__email">
            {user.email}
          </div>

          <button
            type="button"
            className="profile-menu__item"
            onClick={() => { onSync(); setOpen(false); }}
            disabled={syncing}
          >
            <RefreshCw size={14} className={syncing ? 'spin' : ''} aria-hidden="true" />
            {syncing ? 'Syncing...' : 'Sync Data'}
          </button>

          {onManageSubscription && plan && plan !== 'free' && (
            <button
              type="button"
              className="profile-menu__item"
              onClick={() => { onManageSubscription(); setOpen(false); }}
            >
              <CreditCard size={14} aria-hidden="true" />
              Manage Subscription
            </button>
          )}

          <div className="profile-menu__divider" />

          <button
            type="button"
            className="profile-menu__item profile-menu__item--danger"
            onClick={() => { void onSignOut(); setOpen(false); }}
          >
            <LogOut size={14} aria-hidden="true" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
