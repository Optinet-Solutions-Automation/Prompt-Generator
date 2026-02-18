import { useState, useEffect } from 'react';
import type { ReferenceOption } from '@/types/prompt';

// Shape of each prompt returned by the n8n list endpoint
export interface AirtablePrompt {
  id: string;          // Airtable record ID, e.g. "rec111aaa"
  prompt_name: string; // Human-readable name, e.g. "Stormcraft Arrival"
  brand_name: string;  // e.g. "SpinJo"
}

export function usePromptList() {
  const [allPrompts, setAllPrompts] = useState<AirtablePrompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all prompts once when this hook is first used
  useEffect(() => {
    fetch('/api/list-prompts')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load prompt list');
        return res.json();
      })
      .then((data: AirtablePrompt[]) => {
        setAllPrompts(data);
      })
      .catch(err => {
        console.error('usePromptList error:', err);
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Returns all prompts for a given brand, formatted for the ReferenceSelect dropdown.
  // We use prompt_name as the option "id" so that formData.reference stores
  // the human-readable name (which is what the generate-prompt n8n workflow expects).
  const getReferencesForBrand = (brand: string): ReferenceOption[] => {
    return allPrompts
      .filter(p => p.brand_name === brand)
      .map(p => ({
        id: p.prompt_name,         // value stored in formData.reference
        label: p.prompt_name,      // text shown in dropdown
        description: '',
        category: 'Casino - Promotions', // keeps the existing group header style
      }));
  };

  // Given a prompt_name and brand, returns the Airtable record ID.
  // This is needed to call /api/get-prompt-by-id when the user selects a reference.
  const getRecordId = (promptName: string, brand: string): string => {
    const found = allPrompts.find(
      p => p.prompt_name === promptName && p.brand_name === brand
    );
    return found?.id || '';
  };

  return { allPrompts, isLoading, error, getReferencesForBrand, getRecordId };
}
