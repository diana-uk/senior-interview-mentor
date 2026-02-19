import { useCallback, useRef } from 'react';

interface WorkspaceSplitterProps {
  /** Current chat width % */
  chatWidthPercent: number;
  /** Is the workspace swapped (editor on left)? */
  isSwapped: boolean;
  /** Callback with new chat width percent during drag */
  onResize: (percent: number) => void;
  /** Called when drag past edge — collapse chat */
  onCollapseChat: () => void;
  /** Called when drag past edge — collapse editor */
  onCollapseEditor: () => void;
  /** Called on double-click — reset to default */
  onReset: () => void;
  /** Min/max percent bounds */
  minPercent: number;
  maxPercent: number;
}

const SNAP_THRESHOLD = 5; // % from edge to snap-collapse

export default function WorkspaceSplitter({
  chatWidthPercent,
  isSwapped,
  onResize,
  onCollapseChat,
  onCollapseEditor,
  onReset,
  minPercent,
  maxPercent,
}: WorkspaceSplitterProps) {
  const splitterRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const startDrag = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    splitterRef.current?.focus();
    dragging.current = true;

    const workspace = splitterRef.current?.parentElement;
    if (!workspace) return;

    workspace.classList.add('workspace-resizing');
    splitterRef.current?.classList.add('splitter-active');

    const onMove = (ev: MouseEvent | TouchEvent) => {
      if (!dragging.current || !workspace) return;
      const clientX = 'touches' in ev ? ev.touches[0].clientX : ev.clientX;
      const rect = workspace.getBoundingClientRect();
      let pct = ((clientX - rect.left) / rect.width) * 100;

      if (isSwapped) pct = 100 - pct;

      // Snap-collapse at edges
      if (pct < SNAP_THRESHOLD) {
        endDrag();
        onCollapseChat();
        return;
      }
      if (pct > 100 - SNAP_THRESHOLD) {
        endDrag();
        onCollapseEditor();
        return;
      }

      pct = Math.max(minPercent, Math.min(maxPercent, pct));
      onResize(pct);
    };

    const endDrag = () => {
      dragging.current = false;
      workspace.classList.remove('workspace-resizing');
      splitterRef.current?.classList.remove('splitter-active');
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', endDrag);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', endDrag);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', endDrag);
  }, [isSwapped, onResize, onCollapseChat, onCollapseEditor, minPercent, maxPercent]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const step = 2;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const dir = e.key === 'ArrowLeft' ? -step : step;
      const adjusted = isSwapped ? -dir : dir;
      onResize(Math.max(minPercent, Math.min(maxPercent, chatWidthPercent + adjusted)));
    } else if (e.key === 'Home') {
      e.preventDefault();
      onReset();
    }
  }, [chatWidthPercent, isSwapped, onResize, onReset, minPercent, maxPercent]);

  return (
    <div
      ref={splitterRef}
      className="splitter-h"
      role="separator"
      aria-orientation="vertical"
      aria-valuenow={Math.round(chatWidthPercent)}
      aria-valuemin={minPercent}
      aria-valuemax={maxPercent}
      aria-label="Resize chat and editor panels"
      tabIndex={0}
      onMouseDown={startDrag}
      onTouchStart={startDrag}
      onDoubleClick={onReset}
      onKeyDown={handleKeyDown}
    >
      <div className="splitter-h-line" />
      <div className="splitter-h-grip">
        <span className="splitter-h-dot" />
        <span className="splitter-h-dot" />
        <span className="splitter-h-dot" />
        <span className="splitter-h-dot" />
        <span className="splitter-h-dot" />
      </div>
    </div>
  );
}
