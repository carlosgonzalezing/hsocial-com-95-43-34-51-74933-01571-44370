import { useEffect, useCallback } from 'react';
import { useDebounce } from '@/hooks/use-debounce';

const DRAFT_KEY = 'post-draft';
const DRAFT_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

interface DraftData {
  content: string;
  timestamp: number;
}

export function useDraft(content: string, setContent: (content: string) => void) {
  const debouncedContent = useDebounce(content, 1000);

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const draftData: DraftData = JSON.parse(savedDraft);
        const isExpired = Date.now() - draftData.timestamp > DRAFT_EXPIRY;
        
        if (!isExpired && draftData.content.trim() && !content.trim()) {
          setContent(draftData.content);
        }
        
        if (isExpired) {
          localStorage.removeItem(DRAFT_KEY);
        }
      } catch (error) {
        localStorage.removeItem(DRAFT_KEY);
      }
    }
  }, []);

  // Save draft when content changes
  useEffect(() => {
    if (debouncedContent.trim()) {
      const draftData: DraftData = {
        content: debouncedContent,
        timestamp: Date.now()
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
    }
  }, [debouncedContent]);

  // Clear draft
  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY);
  }, []);

  return { clearDraft };
}