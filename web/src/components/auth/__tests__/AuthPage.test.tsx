import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AuthPage from '../AuthPage';

vi.mock('lucide-react', () => ({
  LogIn:    () => <span data-testid="icon-login" />,
  UserPlus: () => <span data-testid="icon-userplus" />,
  Github:   () => <span data-testid="icon-github" />,
}));

const BASE_PROPS = {
  onSignIn: vi.fn().mockResolvedValue({}),
  onSignUp: vi.fn().mockResolvedValue({}),
  onOAuth:  vi.fn().mockResolvedValue(undefined),
  onSkip:   vi.fn(),
};

beforeEach(() => {
  BASE_PROPS.onSignIn.mockClear().mockResolvedValue({});
  BASE_PROPS.onSignUp.mockClear().mockResolvedValue({});
  BASE_PROPS.onOAuth.mockClear().mockResolvedValue(undefined);
  BASE_PROPS.onSkip.mockClear();
});

describe('AuthPage', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      expect(() => render(<AuthPage {...BASE_PROPS} />)).not.toThrow();
    });

    it('shows app title', () => {
      render(<AuthPage {...BASE_PROPS} />);
      expect(screen.getByText('Senior Interview Mentor')).toBeDefined();
    });

    it('shows subtitle', () => {
      render(<AuthPage {...BASE_PROPS} />);
      expect(screen.getByText('AI-powered coding interview coaching')).toBeDefined();
    });

    it('shows Log In tab', () => {
      render(<AuthPage {...BASE_PROPS} />);
      expect(screen.getByText('Log In')).toBeDefined();
    });

    it('shows Sign Up tab', () => {
      render(<AuthPage {...BASE_PROPS} />);
      expect(screen.getByText('Sign Up')).toBeDefined();
    });

    it('defaults to Log In tab active', () => {
      render(<AuthPage {...BASE_PROPS} />);
      const loginTab = screen.getByText('Log In').closest('button')!;
      expect(loginTab.classList.contains('auth-tab--active')).toBe(true);
    });

    it('shows email input', () => {
      render(<AuthPage {...BASE_PROPS} />);
      expect(screen.getByPlaceholderText('you@example.com')).toBeDefined();
    });

    it('shows password input with login placeholder by default', () => {
      render(<AuthPage {...BASE_PROPS} />);
      expect(screen.getByPlaceholderText('Your password')).toBeDefined();
    });

    it('shows Sign In submit button by default', () => {
      render(<AuthPage {...BASE_PROPS} />);
      expect(screen.getByRole('button', { name: 'Sign In' })).toBeDefined();
    });

    it('shows Continue with GitHub button', () => {
      render(<AuthPage {...BASE_PROPS} />);
      expect(screen.getByText('Continue with GitHub')).toBeDefined();
    });

    it('shows Continue with Google button', () => {
      render(<AuthPage {...BASE_PROPS} />);
      expect(screen.getByText('Continue with Google')).toBeDefined();
    });

    it('shows Continue without account button', () => {
      render(<AuthPage {...BASE_PROPS} />);
      expect(screen.getByText('Continue without account')).toBeDefined();
    });
  });

  describe('tab switching', () => {
    it('clicking Sign Up tab activates it', () => {
      render(<AuthPage {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('Sign Up').closest('button')!);
      expect(screen.getByText('Sign Up').closest('button')!.classList.contains('auth-tab--active')).toBe(true);
    });

    it('clicking Sign Up tab deactivates Log In', () => {
      render(<AuthPage {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('Sign Up').closest('button')!);
      expect(screen.getByText('Log In').closest('button')!.classList.contains('auth-tab--active')).toBe(false);
    });

    it('Sign Up tab shows "Min 6 characters" password placeholder', () => {
      render(<AuthPage {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('Sign Up').closest('button')!);
      expect(screen.getByPlaceholderText('Min 6 characters')).toBeDefined();
    });

    it('Sign Up tab shows Create Account submit button', () => {
      render(<AuthPage {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('Sign Up').closest('button')!);
      expect(screen.getByRole('button', { name: 'Create Account' })).toBeDefined();
    });

    it('switching tabs clears error', async () => {
      BASE_PROPS.onSignIn.mockResolvedValueOnce({ error: 'Invalid credentials' });
      render(<AuthPage {...BASE_PROPS} />);
      fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'a@b.com' } });
      fireEvent.change(screen.getByPlaceholderText('Your password'), { target: { value: 'wrong' } });
      fireEvent.submit(screen.getByRole('button', { name: 'Sign In' }).closest('form')!);
      await waitFor(() => expect(screen.getByText('Invalid credentials')).toBeDefined());
      fireEvent.click(screen.getByText('Sign Up').closest('button')!);
      expect(screen.queryByText('Invalid credentials')).toBeNull();
    });
  });

  describe('form submission — sign in', () => {
    it('submitting sign in calls onSignIn with email and password', async () => {
      render(<AuthPage {...BASE_PROPS} />);
      fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'user@test.com' } });
      fireEvent.change(screen.getByPlaceholderText('Your password'), { target: { value: 'pass123' } });
      fireEvent.submit(screen.getByRole('button', { name: 'Sign In' }).closest('form')!);
      await waitFor(() => expect(BASE_PROPS.onSignIn).toHaveBeenCalledWith('user@test.com', 'pass123'));
    });

    it('shows Signing in... while submitting', async () => {
      BASE_PROPS.onSignIn.mockReturnValue(new Promise(() => {})); // never resolves
      render(<AuthPage {...BASE_PROPS} />);
      fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'a@b.com' } });
      fireEvent.change(screen.getByPlaceholderText('Your password'), { target: { value: 'pass123' } });
      fireEvent.submit(screen.getByRole('button', { name: 'Sign In' }).closest('form')!);
      await waitFor(() => expect(screen.getByText('Signing in...')).toBeDefined());
    });

    it('submit button is disabled while submitting', async () => {
      BASE_PROPS.onSignIn.mockReturnValue(new Promise(() => {}));
      render(<AuthPage {...BASE_PROPS} />);
      fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'a@b.com' } });
      fireEvent.change(screen.getByPlaceholderText('Your password'), { target: { value: 'pass123' } });
      fireEvent.submit(screen.getByRole('button', { name: 'Sign In' }).closest('form')!);
      await waitFor(() => expect(screen.getByText('Signing in...')).toBeDefined());
      expect((screen.getByText('Signing in...') as HTMLButtonElement).disabled).toBe(true);
    });

    it('shows error message when onSignIn returns error', async () => {
      BASE_PROPS.onSignIn.mockResolvedValueOnce({ error: 'Invalid credentials' });
      render(<AuthPage {...BASE_PROPS} />);
      fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'a@b.com' } });
      fireEvent.change(screen.getByPlaceholderText('Your password'), { target: { value: 'wrongpass' } });
      fireEvent.submit(screen.getByRole('button', { name: 'Sign In' }).closest('form')!);
      await waitFor(() => expect(screen.getByText('Invalid credentials')).toBeDefined());
    });

    it('does not call onSignUp when on login tab', async () => {
      render(<AuthPage {...BASE_PROPS} />);
      fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'a@b.com' } });
      fireEvent.change(screen.getByPlaceholderText('Your password'), { target: { value: 'pass123' } });
      fireEvent.submit(screen.getByRole('button', { name: 'Sign In' }).closest('form')!);
      await waitFor(() => expect(BASE_PROPS.onSignIn).toHaveBeenCalledOnce());
      expect(BASE_PROPS.onSignUp).not.toHaveBeenCalled();
    });
  });

  describe('form submission — sign up', () => {
    it('submitting sign up calls onSignUp with email and password', async () => {
      render(<AuthPage {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('Sign Up').closest('button')!);
      fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'new@test.com' } });
      fireEvent.change(screen.getByPlaceholderText('Min 6 characters'), { target: { value: 'mypassword' } });
      fireEvent.submit(screen.getByRole('button', { name: 'Create Account' }).closest('form')!);
      await waitFor(() => expect(BASE_PROPS.onSignUp).toHaveBeenCalledWith('new@test.com', 'mypassword'));
    });

    it('shows Creating account... while submitting sign up', async () => {
      BASE_PROPS.onSignUp.mockReturnValue(new Promise(() => {}));
      render(<AuthPage {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('Sign Up').closest('button')!);
      fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'new@test.com' } });
      fireEvent.change(screen.getByPlaceholderText('Min 6 characters'), { target: { value: 'mypassword' } });
      fireEvent.submit(screen.getByRole('button', { name: 'Create Account' }).closest('form')!);
      await waitFor(() => expect(screen.getByText('Creating account...')).toBeDefined());
    });

    it('does not call onSignIn when on sign up tab', async () => {
      render(<AuthPage {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('Sign Up').closest('button')!);
      fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'new@test.com' } });
      fireEvent.change(screen.getByPlaceholderText('Min 6 characters'), { target: { value: 'mypassword' } });
      fireEvent.submit(screen.getByRole('button', { name: 'Create Account' }).closest('form')!);
      await waitFor(() => expect(BASE_PROPS.onSignUp).toHaveBeenCalledOnce());
      expect(BASE_PROPS.onSignIn).not.toHaveBeenCalled();
    });
  });

  describe('OAuth buttons', () => {
    it('clicking GitHub button calls onOAuth with "github"', () => {
      render(<AuthPage {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('Continue with GitHub').closest('button')!);
      expect(BASE_PROPS.onOAuth).toHaveBeenCalledWith('github');
    });

    it('clicking Google button calls onOAuth with "google"', () => {
      render(<AuthPage {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('Continue with Google').closest('button')!);
      expect(BASE_PROPS.onOAuth).toHaveBeenCalledWith('google');
    });
  });

  describe('skip', () => {
    it('clicking Continue without account calls onSkip', () => {
      render(<AuthPage {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('Continue without account'));
      expect(BASE_PROPS.onSkip).toHaveBeenCalledOnce();
    });
  });
});
