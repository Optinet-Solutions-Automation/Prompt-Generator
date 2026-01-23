import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import type { ReferencePromptData } from '@/types/prompt';
import { motion } from 'framer-motion';

interface ReferencePromptDataDisplayProps {
  data: ReferencePromptData | null;
  isLoading: boolean;
  disabled?: boolean;
}

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

export function ReferencePromptDataDisplay({ data, isLoading, disabled }: ReferencePromptDataDisplayProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        <span>Loading reference data...</span>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const fields = Object.entries(data).filter(([, value]) => value && value.trim() !== '');

  if (fields.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 mt-6 pt-6 border-t border-border"
    >
      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Reference Prompt Data</h4>
      <div className="grid gap-4">
        {fields.map(([key, value]) => (
          <div key={key} className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              {FIELD_LABELS[key as keyof ReferencePromptData] || key}
            </Label>
            <Textarea
              value={value}
              disabled={disabled}
              className="text-sm bg-muted/30 border-border/50 min-h-[60px]"
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
}
