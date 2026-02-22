import { useEffect } from 'react';

const DEFAULT_DESCRIPTION =
  'AI-powered coding interview coach. Practice LeetCode problems, system design, and behavioral interviews with real-time Socratic teaching.';

export function useMetaTags(description: string | null) {
  useEffect(() => {
    const content = description || DEFAULT_DESCRIPTION;
    const el = document.querySelector('meta[name="description"]');
    if (el) {
      el.setAttribute('content', content);
    }
    // Also update og:description
    const og = document.querySelector('meta[property="og:description"]');
    if (og) {
      og.setAttribute('content', content);
    }
  }, [description]);
}
