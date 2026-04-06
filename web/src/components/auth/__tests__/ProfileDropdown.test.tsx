import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProfileDropdown from '../ProfileDropdown';
import type { User } from '@supabase/supabase-js';

vi.mock('lucide-react', () => ({
  LogOut:    () => <span data-testid="icon-logout" />,
  RefreshCw: () => <span data-testid="icon-refresh" />,
  CreditCard:() => <span data-testid="icon-credit-card" />,
}));

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'u1',
    email: 'alice@example.com',
    user_metadata: {},
    app_metadata: {},
    aud: 'authenticated',
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  } as User;
}

const BASE_PROPS = {
  user: makeUser(),
  onSignOut: vi.fn().mockResolvedValue(undefined),
  onSync: vi.fn(),
  syncing: false,
};

beforeEach(() => {
  BASE_PROPS.onSignOut.mockClear();
  BASE_PROPS.onSync.mockClear();
});

/** Open the dropdown by clicking the avatar button */
function openDropdown() {
  fireEvent.click(screen.getByRole('button', { name: /Profile menu for/i }));
}

describe('ProfileDropdown', () => {
  describe('avatar button', () => {
    it('renders without crashing', () => {
      expect(() => render(<ProfileDropdown {...BASE_PROPS} />)).not.toThrow();
    });

    it('shows initials from email (first character uppercased)', () => {
      render(<ProfileDropdown {...BASE_PROPS} user={makeUser({ email: 'alice@example.com', user_metadata: {} })} />);
      // email has @, so initials = first char = 'A'
      expect(screen.getByRole('button', { name: /Profile menu for/i }).textContent).toBe('A');
    });

    it('shows two initials from full_name in metadata', () => {
      const user = makeUser({ user_metadata: { full_name: 'John Doe' } });
      render(<ProfileDropdown {...BASE_PROPS} user={user} />);
      expect(screen.getByRole('button', { name: /Profile menu for/i }).textContent).toBe('JD');
    });

    it('avatar button has aria-label with user email', () => {
      render(<ProfileDropdown {...BASE_PROPS} />);
      const btn = screen.getByRole('button', { name: 'Profile menu for alice@example.com' });
      expect(btn).toBeDefined();
    });

    it('dropdown is hidden initially', () => {
      render(<ProfileDropdown {...BASE_PROPS} />);
      expect(screen.queryByText('Sync Data')).toBeNull();
    });

    it('clicking avatar opens dropdown', () => {
      render(<ProfileDropdown {...BASE_PROPS} />);
      openDropdown();
      expect(screen.getByText('Sync Data')).toBeDefined();
    });

    it('clicking avatar again closes dropdown', () => {
      render(<ProfileDropdown {...BASE_PROPS} />);
      openDropdown();
      openDropdown();
      expect(screen.queryByText('Sync Data')).toBeNull();
    });
  });

  describe('dropdown contents', () => {
    it('shows user email in menu', () => {
      render(<ProfileDropdown {...BASE_PROPS} />);
      openDropdown();
      expect(screen.getByText('alice@example.com')).toBeDefined();
    });

    it('shows Sync Data button', () => {
      render(<ProfileDropdown {...BASE_PROPS} />);
      openDropdown();
      expect(screen.getByRole('button', { name: /Sync Data/i })).toBeDefined();
    });

    it('shows Sign Out button', () => {
      render(<ProfileDropdown {...BASE_PROPS} />);
      openDropdown();
      expect(screen.getByRole('button', { name: /Sign Out/i })).toBeDefined();
    });
  });

  describe('Sync Data', () => {
    it('clicking Sync Data calls onSync', () => {
      render(<ProfileDropdown {...BASE_PROPS} />);
      openDropdown();
      fireEvent.click(screen.getByRole('button', { name: /Sync Data/i }));
      expect(BASE_PROPS.onSync).toHaveBeenCalledOnce();
    });

    it('clicking Sync Data closes dropdown', () => {
      render(<ProfileDropdown {...BASE_PROPS} />);
      openDropdown();
      fireEvent.click(screen.getByRole('button', { name: /Sync Data/i }));
      expect(screen.queryByText('Sign Out')).toBeNull();
    });

    it('shows "Syncing..." when syncing=true', () => {
      render(<ProfileDropdown {...BASE_PROPS} syncing={true} />);
      openDropdown();
      expect(screen.getByText('Syncing...')).toBeDefined();
    });

    it('Sync button is disabled when syncing=true', () => {
      render(<ProfileDropdown {...BASE_PROPS} syncing={true} />);
      openDropdown();
      expect(screen.getByRole('button', { name: /Syncing/i }).hasAttribute('disabled')).toBe(true);
    });
  });

  describe('Sign Out', () => {
    it('clicking Sign Out calls onSignOut', () => {
      render(<ProfileDropdown {...BASE_PROPS} />);
      openDropdown();
      fireEvent.click(screen.getByRole('button', { name: /Sign Out/i }));
      expect(BASE_PROPS.onSignOut).toHaveBeenCalledOnce();
    });

    it('clicking Sign Out closes dropdown', () => {
      render(<ProfileDropdown {...BASE_PROPS} />);
      openDropdown();
      fireEvent.click(screen.getByRole('button', { name: /Sign Out/i }));
      expect(screen.queryByText('Sync Data')).toBeNull();
    });
  });

  describe('Manage Subscription', () => {
    it('does not show Manage Subscription when plan is free', () => {
      const onManageSubscription = vi.fn();
      render(<ProfileDropdown {...BASE_PROPS} plan="free" onManageSubscription={onManageSubscription} />);
      openDropdown();
      expect(screen.queryByText('Manage Subscription')).toBeNull();
    });

    it('does not show Manage Subscription when onManageSubscription not provided', () => {
      render(<ProfileDropdown {...BASE_PROPS} plan="premium" />);
      openDropdown();
      expect(screen.queryByText('Manage Subscription')).toBeNull();
    });

    it('shows Manage Subscription when plan=premium and callback provided', () => {
      const onManageSubscription = vi.fn();
      render(<ProfileDropdown {...BASE_PROPS} plan="premium" onManageSubscription={onManageSubscription} />);
      openDropdown();
      expect(screen.getByText('Manage Subscription')).toBeDefined();
    });

    it('shows Manage Subscription when plan=pro and callback provided', () => {
      const onManageSubscription = vi.fn();
      render(<ProfileDropdown {...BASE_PROPS} plan="pro" onManageSubscription={onManageSubscription} />);
      openDropdown();
      expect(screen.getByText('Manage Subscription')).toBeDefined();
    });

    it('clicking Manage Subscription calls onManageSubscription', () => {
      const onManageSubscription = vi.fn();
      render(<ProfileDropdown {...BASE_PROPS} plan="premium" onManageSubscription={onManageSubscription} />);
      openDropdown();
      fireEvent.click(screen.getByText('Manage Subscription'));
      expect(onManageSubscription).toHaveBeenCalledOnce();
    });

    it('clicking Manage Subscription closes dropdown', () => {
      const onManageSubscription = vi.fn();
      render(<ProfileDropdown {...BASE_PROPS} plan="premium" onManageSubscription={onManageSubscription} />);
      openDropdown();
      fireEvent.click(screen.getByText('Manage Subscription'));
      expect(screen.queryByText('Sync Data')).toBeNull();
    });
  });

  describe('click outside to close', () => {
    it('clicking outside the dropdown closes it', () => {
      render(
        <div>
          <ProfileDropdown {...BASE_PROPS} />
          <div data-testid="outside">Outside</div>
        </div>,
      );
      openDropdown();
      expect(screen.getByText('Sync Data')).toBeDefined();
      fireEvent.mouseDown(screen.getByTestId('outside'));
      expect(screen.queryByText('Sync Data')).toBeNull();
    });
  });
});
