import { useState, useEffect, useCallback } from 'react';
import { X, Loader2, Copy, Check, FileText, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

// Configuration for accessing the Saved Prompts table
const airtableConfig = {
  pat: import.meta.env.VITE_AIRTABLE_PAT as string,
  baseId: import.meta.env.VITE_AIRTABLE_BASE_ID as string,
  tableName: 'Saved Prompts', // Hardcoded as per your request
};

interface SavedPromptRecord {
  id: string;
  fields: {
    title?: string;
    saved_prompt?: string;
    brand_name?: string;
    brand_reference?: string;
  };
}

interface SavedPromptsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  brand: string;
}

export function SavedPromptsPanel({ isOpen, onClose, brand }: SavedPromptsPanelProps) {
  const [records, setRecords] = useState<SavedPromptRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const hasBrand = !!brand && brand !== 'Select a brand';

  const fetchSavedPrompts = useCallback(async () => {
    if (!hasBrand) return;

    setLoading(true);
    setError(null);

    try {
      if (!airtableConfig.pat || !airtableConfig.baseId) {
        throw new Error('Missing Airtable configuration.');
      }

      // Filter by brand_name to show relevant prompts
      const filterFormula = encodeURIComponent(`{brand_name}="${brand}"`);
      const url = `https://api.airtable.com/v0/${airtableConfig.baseId}/${encodeURIComponent(airtableConfig.tableName)}?filterByFormula=${filterFormula}&sort%5B0%5D%5Bfield%5D=created_time&sort%5B0%5D%5Bdirection%5D=desc`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${airtableConfig.pat}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Fallback for empty table or not found
        if (response.status === 404) {
             setRecords([]);
             return;
        }
        throw new Error('Failed to fetch saved prompts');
      }

      const data = await response.json();
      setRecords(data.records || []);
    } catch (err) {
      console.error('Error fetching prompts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load prompts');
    } finally {
      setLoading(false);
    }
  }, [brand, hasBrand]);

  useEffect(() => {
    if (isOpen && hasBrand) fetchSavedPrompts();
  }, [isOpen, hasBrand, fetchSavedPrompts]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 animate-fade-in" style={{ zIndex: 998 }} onClick={onClose} />
      <div
        className="fixed right-5 flex flex-col bg-card rounded-xl border border-border animate-slide-in-right
          max-sm:inset-0 max-sm:right-0 max-sm:rounded-none max-sm:w-full max-sm:h-full
          sm:w-[500px] md:w-[600px]"
        style={{ zIndex: 999, top: 'max(5vh, 20px)', height: 'min(88vh, calc(100vh - 40px))', boxShadow: '0 10px 40px rgba(0,0,0,0.25)' }}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-card rounded-t-xl sticky top-0 z-10">
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
            Saved Prompts - {hasBrand ? brand.toUpperCase() : 'SELECT BRAND'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <ScrollArea className="flex-1 p-6">
          {!hasBrand && (
            <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
              <p>Please select a brand to view saved prompts.</p>
            </div>
          )}

          {loading && (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-destructive">
              <AlertTriangle className="w-8 h-8" />
              <p>Could not load prompts. Check API key/Table name.</p>
            </div>
          )}

          {!loading && !error && hasBrand && records.length === 0 && (
             <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
               <FileText className="w-12 h-12 mb-2 opacity-20" />
               <p>No saved prompts found for {brand}.</p>
             </div>
          )}

          <div className="space-y-4">
            {records.map((record) => (
              <div key={record.id} className="bg-muted/30 border border-border rounded-lg p-4 space-y-3 hover:border-primary/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{record.fields.title || 'Untitled Prompt'}</h3>
                    {record.fields.brand_reference && (
                      <Badge variant="outline" className="mt-1.5 text-[10px] h-5 text-muted-foreground bg-background">
                        {record.fields.brand_reference}
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopy(record.fields.saved_prompt || '', record.id)}
                    className="h-8 w-8 shrink-0 hover:bg-background"
                  >
                    {copiedId === record.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="bg-background/50 rounded border border-border p-3 text-xs font-mono text-muted-foreground whitespace-pre-wrap max-h-[150px] overflow-y-auto">
                  {record.fields.saved_prompt}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
