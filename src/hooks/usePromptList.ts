import { useState, useEffect } from 'react';
import type { ReferenceOption } from '@/types/prompt';

// Shape of each prompt returned by the n8n list endpoint.
// The category field can come back under different names depending on
// how the n8n workflow is set up — we handle all common variants below.
export interface AirtablePrompt {
  id: string;               // Airtable record ID, e.g. "rec111aaa"
  prompt_name: string;      // Human-readable name, e.g. "Stormcraft Arrival"
  brand_name: string;       // e.g. "SpinJo"
  prompt_category?: string; // preferred field name
  category?: string;        // alternative field name some n8n setups use
  prompt_type?: string;     // another possible alternative
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

  // Returns the category value as-is from Airtable (just trimmed).
  // Whatever you type in Airtable becomes the group header in the dropdown,
  // so adding a new category in Airtable automatically creates a new group.
  const normalizeCategory = (raw: string | undefined): string => {
    if (!raw) return 'Casino - Promotions';
    return raw.trim();
  };

  // Returns all prompts for a given brand, formatted for the ReferenceSelect dropdown.
  // We use prompt_name as the option "id" so that formData.reference stores
  // the human-readable name (which is what the generate-prompt n8n workflow expects).
  const getReferencesForBrand = (brand: string): ReferenceOption[] => {
    return allPrompts
      .filter(p => p.brand_name === brand && p.prompt_name) // skip records with no name (prevents crash)
      .map(p => {
        // Guard against null/undefined prompt_name — if Airtable has an empty record
        // for this brand, we don't want the whole app to crash.
        const fullName = (p.prompt_name || '').trim();

        // prompt_name may include a description after " — " e.g. "Sunset Sippers — Three colorful..."
        const parts = fullName.split(' — ');
        const shortName = parts[0].trim();
        const description = parts.length > 1 ? parts.slice(1).join(' — ').trim() : '';

        // Read category from whichever field name n8n returns, then normalize
        const rawCategory = p.prompt_category || p.category || p.prompt_type;
        const category = normalizeCategory(rawCategory);

        return {
          id: fullName,     // full string stored as value (n8n expects this)
          label: shortName, // short name shown as main text in dropdown
          description,      // description shown as secondary text below
          category,
        };
      });
  };

  // Given a prompt_name and brand, returns the Airtable record ID.
  // This is needed to call /api/get-prompt-by-id when the user selects a reference.
  const getRecordId = (promptName: string, brand: string): string => {
    const found = allPrompts.find(
      // trim both sides to avoid whitespace mismatches
      p => (p.prompt_name || '').trim() === promptName.trim() && p.brand_name === brand
    );
    return found?.id || '';
  };

  return { allPrompts, isLoading, error, getReferencesForBrand, getRecordId };
}
