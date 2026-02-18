import { useState, useCallback } from 'react';
import type { ReferencePromptData } from '@/types/prompt';

export function useReferencePromptData() {
  const [referencePromptData, setReferencePromptData] = useState<ReferencePromptData | null>(null);
  const [isLoadingReferenceData, setIsLoadingReferenceData] = useState(false);

  // recordId = the Airtable record ID (e.g. "rec111aaa").
  // We call /api/get-prompt-by-id which asks n8n to fetch that exact record.
  const fetchReferencePromptData = useCallback(async (brand: string, recordId: string) => {
    if (!recordId) {
      setReferencePromptData(null);
      return;
    }

    setIsLoadingReferenceData(true);

    try {
      const response = await fetch('/api/get-prompt-by-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordId }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reference data');
      }

      const data = await response.json();
      setReferencePromptData(data);
    } catch (error) {
      console.error('Error fetching reference prompt data:', error);
      setReferencePromptData(null);
    } finally {
      setIsLoadingReferenceData(false);
    }
  }, []);

  const clearReferencePromptData = useCallback(() => {
    setReferencePromptData(null);
  }, []);

  return {
    referencePromptData,
    isLoadingReferenceData,
    fetchReferencePromptData,
    clearReferencePromptData,
  };
}
