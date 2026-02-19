import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Loader2, RefreshCw, Save } from 'lucide-react';

import type { ReferencePromptData } from '@/types/prompt';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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

export function ReferencePromptDataDisplay({ data, isLoading, disabled, brand, category, onChange, onSaved }: ReferencePromptDataDisplayProps) {
  const [open, setOpen] = useState(false);
  const [regeneratingField, setRegeneratingField] = useState<RegenerableField | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const handleSaveAsReference = async () => {
    if (!titleInput.trim()) {
      setSaveError('Please enter a title.');
      return;
    }
    if (!data) return;

    setIsSaving(true);
    setSaveError('');

    try {
      const response = await fetch('/api/save-as-reference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:           titleInput.trim(),
          brand_name:      brand,
          prompt_category: category,
          format_layout:   data.format_layout,
          primary_object:  data.primary_object,
          subject:         data.subject,
          lighting:        data.lighting,
          mood:            data.mood,
          background:      data.background,
          positive_prompt: data.positive_prompt,
          negative_prompt: data.negative_prompt,
        }),
      });

      if (!response.ok) throw new Error('Failed to save reference');

      setSaveDialogOpen(false);
      setTitleInput('');
      onSaved?.(); // refresh the dropdown
    } catch (error) {
      console.error('Error saving reference:', error);
      setSaveError('Something went wrong. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

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
              {/* Action buttons — shown at the top of the expanded section */}
              {onChange && (
                <div className="flex flex-wrap gap-2">
                  {REGENERABLE_FIELDS.map((field) => (
                    <Button
                      key={field}
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={!!regeneratingField || !!disabled}
                      onClick={() => handleRegenerate(field)}
                      className="h-7 px-3 text-xs gap-1.5"
                    >
                      {regeneratingField === field
                        ? <Loader2 className="h-3 w-3 animate-spin" />
                        : <RefreshCw className="h-3 w-3" />
                      }
                      Regenerate {FIELD_LABELS[field]}
                    </Button>
                  ))}
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    disabled={!!regeneratingField || !!disabled}
                    onClick={() => { setTitleInput(''); setSaveError(''); setSaveDialogOpen(true); }}
                    className="h-7 px-3 text-xs gap-1.5 ml-auto"
                  >
                    <Save className="h-3 w-3" />
                    Save as New Reference
                  </Button>
                </div>
              )}

              {fieldKeys.map((key) => {
                const value = data[key] ?? '';
                const isRegenerating = regeneratingField === key;
                return (
                  <div key={key} className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">
                      {FIELD_LABELS[key] || key}
                    </Label>
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

      {/* Save as New Reference dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save as New Reference</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="reference-title">Title</Label>
            <Input
              id="reference-title"
              placeholder="e.g. Neon Warrior"
              value={titleInput}
              onChange={(e) => { setTitleInput(e.target.value); setSaveError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveAsReference()}
              disabled={isSaving}
              autoFocus
            />
            {saveError && (
              <p className="text-sm text-destructive">{saveError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSaveAsReference} disabled={isSaving}>
              {isSaving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving…</> : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
