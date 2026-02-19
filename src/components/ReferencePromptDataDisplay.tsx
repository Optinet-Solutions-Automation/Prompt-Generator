import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Loader2, RefreshCw } from 'lucide-react';

import type { ReferencePromptData } from '@/types/prompt';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ReferencePromptDataDisplayProps {
  data: ReferencePromptData | null;
  isLoading: boolean;
  disabled?: boolean;
  brand?: string;
  onChange?: (field: keyof ReferencePromptData, value: string) => void;
}

// Fields that have a regenerate button
const REGENERABLE_FIELDS = ['subject', 'background'] as const;
type RegenerableField = typeof REGENERABLE_FIELDS[number];

const FIELD_LABELS: Record<keyof ReferencePromptData, string> = {
  format_layout: 'Format Layout',
  primary_object: 'Primary Object',
  subject: 'Subject',
  lighting: 'Lighting',
  mood: 'Mood',
  background: 'Background',
  positive_prompt: 'Positive Prompt',
  negative_prompt: 'Negative Prompt',
};

export function ReferencePromptDataDisplay({ data, isLoading, disabled, brand, onChange }: ReferencePromptDataDisplayProps) {
  const [open, setOpen] = useState(false);
  const [regeneratingField, setRegeneratingField] = useState<RegenerableField | null>(null);

  const handleRegenerate = async (field: RegenerableField) => {
    if (!data || !onChange) return;

    setRegeneratingField(field);

    try {
      const response = await fetch('/api/regenerate-reference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          field,
          brand,
          format_layout:   data.format_layout,
          primary_object:  data.primary_object,
          subject:         data.subject,
          lighting:        data.lighting,
          mood:            data.mood,
          background:      data.background,
          positive_prompt: data.positive_prompt,
        }),
      });

      if (!response.ok) throw new Error('Failed to regenerate field');

      const result = await response.json();
      if (result.value) {
        onChange(field, result.value);
      }
    } catch (error) {
      console.error('Error regenerating field:', error);
    } finally {
      setRegeneratingField(null);
    }
  };

  useEffect(() => {
    // While loading a new reference, keep the section closed so stale data doesn't flash.
    if (isLoading) setOpen(false);
  }, [isLoading]);

  const fieldKeys = useMemo(
    () => Object.keys(FIELD_LABELS) as Array<keyof ReferencePromptData>,
    [],
  );

  const shouldRender = isLoading || !!data;
  if (!shouldRender) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 mt-6 pt-6 border-t border-border"
    >
      <Collapsible open={open} onOpenChange={setOpen} className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Reference Prompt Data
          </h4>

          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading…
                </>
              ) : (
                <>
                  <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
                  {open ? 'Hide' : 'Show'}
                </>
              )}
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          {data ? (
            <div className="grid gap-4">
              {fieldKeys.map((key) => {
                const value = data[key] ?? '';
                const isRegenenable = (REGENERABLE_FIELDS as readonly string[]).includes(key);
                const isRegenerating = regeneratingField === key;
                return (
                  <div key={key} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium text-muted-foreground">
                        {FIELD_LABELS[key] || key}
                      </Label>
                      {isRegenenable && onChange && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={!!regeneratingField || !!disabled}
                          onClick={() => handleRegenerate(key as RegenerableField)}
                          className="h-6 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
                        >
                          {isRegenerating
                            ? <Loader2 className="h-3 w-3 animate-spin" />
                            : <RefreshCw className="h-3 w-3" />
                          }
                          Regenerate
                        </Button>
                      )}
                    </div>
                    <Textarea
                      value={value}
                      onChange={(e) => onChange?.(key, e.target.value)}
                      readOnly={!onChange || !!disabled}
                      disabled={disabled || isRegenerating}
                      className="text-sm bg-muted/30 border-border/50 min-h-[60px]"
                    />
                  </div>
                );
              })}
            </div>
          ) : null}
        </CollapsibleContent>
      </Collapsible>
    </motion.div>
  );
}
