import { useState, useCallback, useRef } from 'react';
import { safeGetItem, safeSetItem } from '../utils/storage.js';

export interface LayoutState {
  chatWidthPercent: number;
  isSwapped: boolean;
  isChatCollapsed: boolean;
  isEditorCollapsed: boolean;
}

const STORAGE_KEY = 'sim-workspace-layout';
const MIN_PERCENT = 20;
const MAX_PERCENT = 80;
const DEFAULT_WIDTH = 40;

function loadState(): LayoutState {
  try {
    const raw = safeGetItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        chatWidthPercent: parsed.chatWidthPercent ?? DEFAULT_WIDTH,
        isSwapped: parsed.isSwapped ?? false,
        isChatCollapsed: parsed.isChatCollapsed ?? false,
        isEditorCollapsed: parsed.isEditorCollapsed ?? false,
      };
    }
  } catch { /* ignore */ }
  return { chatWidthPercent: DEFAULT_WIDTH, isSwapped: false, isChatCollapsed: false, isEditorCollapsed: false };
}

export function useWorkspaceLayout() {
  const [state, setState] = useState<LayoutState>(loadState);
  const previousWidth = useRef(state.chatWidthPercent);

  const persist = useCallback((next: LayoutState) => {
    safeSetItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const setChatWidth = useCallback((percent: number) => {
    const clamped = Math.max(MIN_PERCENT, Math.min(MAX_PERCENT, percent));
    setState(prev => {
      const next = { ...prev, chatWidthPercent: clamped, isChatCollapsed: false, isEditorCollapsed: false };
      previousWidth.current = clamped;
      persist(next);
      return next;
    });
  }, [persist]);

  const collapseChat = useCallback(() => {
    setState(prev => {
      if (!prev.isChatCollapsed) previousWidth.current = prev.chatWidthPercent;
      const next = { ...prev, isChatCollapsed: true, isEditorCollapsed: false };
      persist(next);
      return next;
    });
  }, [persist]);

  const collapseEditor = useCallback(() => {
    setState(prev => {
      const next = { ...prev, isEditorCollapsed: true, isChatCollapsed: false };
      persist(next);
      return next;
    });
  }, [persist]);

  const expandChat = useCallback(() => {
    setState(prev => {
      const next = { ...prev, isChatCollapsed: false, chatWidthPercent: previousWidth.current || DEFAULT_WIDTH };
      persist(next);
      return next;
    });
  }, [persist]);

  const expandEditor = useCallback(() => {
    setState(prev => {
      const next = { ...prev, isEditorCollapsed: false };
      persist(next);
      return next;
    });
  }, [persist]);

  const toggleSwap = useCallback(() => {
    setState(prev => {
      const next = { ...prev, isSwapped: !prev.isSwapped };
      persist(next);
      return next;
    });
  }, [persist]);

  const resetLayout = useCallback(() => {
    const next: LayoutState = { chatWidthPercent: DEFAULT_WIDTH, isSwapped: false, isChatCollapsed: false, isEditorCollapsed: false };
    previousWidth.current = DEFAULT_WIDTH;
    setState(next);
    persist(next);
  }, [persist]);

  return {
    ...state,
    setChatWidth,
    collapseChat,
    collapseEditor,
    expandChat,
    expandEditor,
    toggleSwap,
    resetLayout,
    MIN_PERCENT,
    MAX_PERCENT,
  };
}
