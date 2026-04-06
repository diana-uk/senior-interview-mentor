import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import KeyboardShortcutsModal from '../KeyboardShortcutsModal';

vi.mock('lucide-react', () => ({
  X: ({ size, 'aria-hidden': ariaHidden }: { size?: number; 'aria-hidden'?: string }) => (
    <svg data-testid="x-icon" data-size={size} aria-hidden={ariaHidden} />
  ),
}));

function renderModal(onClose = vi.fn()) {
  return { onClose, ...render(<KeyboardShortcutsModal onClose={onClose} />) };
}

describe('KeyboardShortcutsModal', () => {
  describe('accessibility attributes', () => {
    it('backdrop has role="dialog"', () => {
      renderModal();
      expect(screen.getByRole('dialog')).toBeDefined();
    });

    it('backdrop has aria-modal="true"', () => {
      renderModal();
      const dialog = screen.getByRole('dialog');
      expect(dialog.getAttribute('aria-modal')).toBe('true');
    });

    it('backdrop has aria-label="Keyboard shortcuts"', () => {
      renderModal();
      const dialog = screen.getByRole('dialog');
      expect(dialog.getAttribute('aria-label')).toBe('Keyboard shortcuts');
    });

    it('close button has aria-label="Close keyboard shortcuts"', () => {
      renderModal();
      const btn = screen.getByRole('button', { name: 'Close keyboard shortcuts' });
      expect(btn).toBeDefined();
    });

    it('close button has type="button"', () => {
      renderModal();
      const btn = screen.getByRole('button', { name: 'Close keyboard shortcuts' });
      expect(btn.getAttribute('type')).toBe('button');
    });

    it('X icon has aria-hidden="true"', () => {
      renderModal();
      const icon = screen.getByTestId('x-icon');
      expect(icon.getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('CSS classes', () => {
    it('backdrop has modal-backdrop class', () => {
      renderModal();
      const dialog = screen.getByRole('dialog');
      expect(dialog.classList.contains('modal-backdrop')).toBe(true);
    });

    it('inner div has modal class', () => {
      renderModal();
      const dialog = screen.getByRole('dialog');
      const inner = dialog.firstElementChild as HTMLElement;
      expect(inner.classList.contains('modal')).toBe(true);
    });

    it('inner div has kbd-shortcuts-modal class', () => {
      renderModal();
      const dialog = screen.getByRole('dialog');
      const inner = dialog.firstElementChild as HTMLElement;
      expect(inner.classList.contains('kbd-shortcuts-modal')).toBe(true);
    });
  });

  describe('header', () => {
    it('renders "Keyboard Shortcuts" title', () => {
      renderModal();
      expect(screen.getByText('Keyboard Shortcuts')).toBeDefined();
    });

    it('renders X icon in close button', () => {
      renderModal();
      expect(screen.getByTestId('x-icon')).toBeDefined();
    });
  });

  describe('shortcut groups', () => {
    it('renders all 3 group titles', () => {
      renderModal();
      expect(screen.getByText('Workspace')).toBeDefined();
      expect(screen.getByText('Navigation')).toBeDefined();
      expect(screen.getByText('System Design Editor')).toBeDefined();
    });

    it('renders Workspace shortcuts (5 items)', () => {
      renderModal();
      expect(screen.getByText('Toggle chat panel')).toBeDefined();
      expect(screen.getByText('Toggle editor panel')).toBeDefined();
      expect(screen.getByText('Resize splitter (when focused)')).toBeDefined();
      expect(screen.getByText('Reset splitter to default')).toBeDefined();
      expect(screen.getByText('Open this shortcuts panel')).toBeDefined();
    });

    it('renders Navigation shortcuts (2 items)', () => {
      renderModal();
      expect(screen.getByText('Close modal / panel')).toBeDefined();
      expect(screen.getByText('Open slash command palette in chat')).toBeDefined();
    });

    it('renders System Design Editor shortcuts (4 items)', () => {
      renderModal();
      expect(screen.getByText('Straight edge')).toBeDefined();
      expect(screen.getByText('Bezier edge')).toBeDefined();
      expect(screen.getByText('Step edge')).toBeDefined();
      expect(screen.getByText('Toggle edge label')).toBeDefined();
    });
  });

  describe('kbd key display', () => {
    it('renders kbd elements for keys', () => {
      const { container } = renderModal();
      const kbds = container.querySelectorAll('kbd.kbd');
      expect(kbds.length).toBeGreaterThan(0);
    });

    it('renders "Ctrl" key for multi-key shortcuts', () => {
      const { container } = renderModal();
      const kbds = Array.from(container.querySelectorAll('kbd.kbd'));
      const ctrlKbds = kbds.filter((k) => k.textContent === 'Ctrl');
      expect(ctrlKbds.length).toBe(2); // Ctrl+[ and Ctrl+]
    });

    it('renders "+" separator between keys in multi-key shortcuts', () => {
      const { container } = renderModal();
      const plusSeps = container.querySelectorAll('.kbd-plus');
      expect(plusSeps.length).toBeGreaterThan(0);
    });

    it('does NOT render "+" after single-key shortcuts', () => {
      renderModal();
      // "Home" is a single key — no + separator in its row
      const homeKbd = screen.getByText('Home');
      // Its parent span should not contain a .kbd-plus sibling
      const row = homeKbd.closest('.kbd-shortcut-row');
      expect(row).toBeDefined();
      expect(row!.querySelectorAll('.kbd-plus').length).toBe(0);
    });

    it('Ctrl+[ shortcut has exactly one + separator', () => {
      const { container } = renderModal();
      // Find the row for "Toggle chat panel"
      const desc = screen.getByText('Toggle chat panel');
      const row = desc.closest('.kbd-shortcut-row');
      expect(row!.querySelectorAll('.kbd-plus').length).toBe(1);
    });
  });

  describe('footer', () => {
    it('renders footer with ? key hint', () => {
      renderModal();
      // Footer contains text about toggling the panel
      expect(screen.getByText(/toggle this panel/i)).toBeDefined();
    });

    it('footer contains a kbd element for "?"', () => {
      const { container } = renderModal();
      const footer = container.querySelector('.kbd-shortcuts-footer');
      expect(footer).toBeDefined();
      const kbds = footer!.querySelectorAll('kbd');
      expect(kbds.length).toBeGreaterThan(0);
      expect(kbds[0].textContent).toBe('?');
    });
  });

  describe('close interactions', () => {
    it('clicking close button calls onClose', () => {
      const { onClose } = renderModal();
      fireEvent.click(screen.getByRole('button', { name: 'Close keyboard shortcuts' }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('clicking backdrop calls onClose', () => {
      const { onClose } = renderModal();
      fireEvent.click(screen.getByRole('dialog'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('clicking modal body does NOT call onClose (stopPropagation)', () => {
      const { onClose } = renderModal();
      const dialog = screen.getByRole('dialog');
      const inner = dialog.firstElementChild as HTMLElement;
      fireEvent.click(inner);
      expect(onClose).not.toHaveBeenCalled();
    });

    it('onClose is called once per backdrop click, not twice', () => {
      const { onClose } = renderModal();
      fireEvent.click(screen.getByRole('dialog'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
