import { useEffect } from 'react';

const BASE_TITLE = 'Senior Mentor — AI Coding Interview Coach';

export function useDocumentTitle(title: string | null) {
  useEffect(() => {
    document.title = title ? `${title} | Senior Mentor` : BASE_TITLE;
  }, [title]);
}
