import { useState, useCallback } from 'react';
import type { ReferencePromptData } from '@/types/prompt';
import { BRAND_REFERENCES } from '@/types/prompt';

// Helper to get reference prompt_name from ID (format: "Label — Description")
function getReferencePromptName(brand: string, referenceId: string): string {
  const references = BRAND_REFERENCES[brand] || [];
  const ref = references.find(r => r.id === referenceId);
  return ref ? `${ref.label} — ${ref.description}` : referenceId;
}

export function useReferencePromptData() {
  const [referencePromptData, setReferencePromptData] = useState<ReferencePromptData | null>(null);
  const [isLoadingReferenceData, setIsLoadingReferenceData] = useState(false);

  const fetchReferencePromptData = useCallback(async (brand: string, referenceId: string) => {
    if (!referenceId) {
      setReferencePromptData(null);
      return;
    }

    setIsLoadingReferenceData(true);
    
    try {
      const referencePromptName = getReferencePromptName(brand, referenceId);
      
      const response = await fetch('/api/show-prompt-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reference: referencePromptName }),
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
