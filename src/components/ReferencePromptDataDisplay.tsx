import { useEffect, useMemo, useState } from 'react';
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
  category?: string;
  onChange?: (field: keyof ReferencePromptData, value: string) => void;
  onSaved?: () => void;
}

// Fields that have a regenerate icon next to their label
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

export function ReferencePromptDataDisplay({ data, isLoading, disabled, brand, onChange, onSaved }: ReferencePromptDataDisplayProps) {
  const [open, setOpen] = useState(false);
  const [regeneratingField, setRegeneratingField] = useState<RegenerableField | null>(null);
  const [isRegeneratingAll, setIsRegeneratingAll] = useState(false);

  // Regenerate a single field (called by the icon button next to the label)
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

  // Regenerate all fields — fires two parallel calls to the same webhook.
  // n8n workflow does NOT need to change: each call has a different "field" value
  // so the existing IF node routes them correctly (subject → Subject node, background → Background node).
  const handleRegenerateAll = async () => {
    if (!data || !onChange) return;

    setIsRegeneratingAll(true);

    try {
      const makeCall = (field: RegenerableField) =>
        fetch('/api/regenerate-reference', {
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
        }).then(r => r.ok ? r.json() : null);

      const [subjectResult, backgroundResult] = await Promise.all([
        makeCall('subject'),
        makeCall('background'),
      ]);

      if (subjectResult?.value)    onChange('subject',    subjectResult.value);
      if (backgroundResult?.value) onChange('background', backgroundResult.value);
    } catch (error) {
      console.error('Error regenerating all:', error);
    } finally {
      setIsRegeneratingAll(false);
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

  const anyBusy = !!regeneratingField || isRegeneratingAll || !!disabled;

  const shouldRender = isLoading || !!data;
  if (!shouldRender) return null;

  return (
    <div className="space-y-4 mt-6 pt-6 border-t border-border">
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
              {/* Top action bar */}
              {onChange && (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={anyBusy}
                    onClick={handleRegenerateAll}
                    className="h-7 px-3 text-xs gap-1.5"
                  >
                    {isRegeneratingAll
                      ? <Loader2 className="h-3 w-3 animate-spin" />
                      : <RefreshCw className="h-3 w-3" />
                    }
                    Regenerate All
                  </Button>
                </div>
              )}

              {fieldKeys.map((key) => {
                const value = data[key] ?? '';
                const isRegenerableField = (REGENERABLE_FIELDS as readonly string[]).includes(key);
                const isThisFieldRegenerating = regeneratingField === key;
                return (
                  <div key={key} className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">
                        {FIELD_LABELS[key] || key}
                      </Label>
                      {/* Small icon button — only on Subject and Background */}
                      {isRegenerableField && onChange && (
                        <button
                          type="button"
                          disabled={anyBusy}
                          onClick={() => handleRegenerate(key as RegenerableField)}
                          className="text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                          title={`Regenerate ${FIELD_LABELS[key]}`}
                        >
                          {isThisFieldRegenerating
                            ? <Loader2 className="h-3 w-3 animate-spin" />
                            : <RefreshCw className="h-3 w-3" />
                          }
                        </button>
                      )}
                    </div>
                    <Textarea
                      value={value}
                      onChange={(e) => onChange?.(key, e.target.value)}
                      readOnly={!onChange || !!disabled}
                      disabled={!!disabled || isThisFieldRegenerating || isRegeneratingAll}
                      className="text-sm bg-muted/30 border-border/50 min-h-[60px]"
                    />
                  </div>
                );
              })}
            </div>
          ) : null}
        </CollapsibleContent>
      </Collapsible>

    </div>
  );
}
