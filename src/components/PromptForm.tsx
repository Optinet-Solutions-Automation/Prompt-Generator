import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FormField } from './FormField';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Sparkles, Trash2 } from 'lucide-react';
import {
  FormData,
  BRANDS,
  BRAND_REFERENCES,
} from '@/types/prompt';

interface PromptFormProps {
  formData: FormData;
  errors: Partial<Record<keyof FormData, string>>;
  onFieldChange: (field: keyof FormData, value: string | boolean) => void;
  onSubmit: () => void;
  onClear: () => void;
}

export function PromptForm({
  formData,
  errors,
  onFieldChange,
  onSubmit,
  onClear,
}: PromptFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  // Get references for selected brand
  const availableReferences = formData.brand ? BRAND_REFERENCES[formData.brand] || [] : [];
  
  // Group references by category
  const groupedReferences = availableReferences.reduce((acc, ref) => {
    if (!acc[ref.category]) {
      acc[ref.category] = [];
    }
    acc[ref.category].push(ref);
    return acc;
  }, {} as Record<string, typeof availableReferences>);

  // Format reference options for display with category prefix
  const referenceOptions = availableReferences.map(ref => `${ref.label} — ${ref.description}`);

  // Handler to extract the reference ID from the selected option
  const handleReferenceChange = (value: string) => {
    const label = value.split(' — ')[0];
    const ref = availableReferences.find(r => r.label === label);
    if (ref) {
      onFieldChange('reference', ref.id);
    }
  };

  // Get the full display value for the reference select
  const getReferenceDisplayValue = () => {
    if (!formData.reference) return '';
    const ref = availableReferences.find(r => r.id === formData.reference);
    if (!ref) return '';
    return `${ref.label} — ${ref.description}`;
  };

  // Reset reference when brand changes
  const handleBrandChange = (value: string) => {
    onFieldChange('brand', value);
    if (formData.reference) {
      onFieldChange('reference', '');
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          type="select"
          label="Brand"
          required
          options={[...BRANDS]}
          value={formData.brand}
          onChange={handleBrandChange}
          placeholder="Select a brand"
          error={errors.brand}
        />

        <FormField
          type="select"
          label="Reference"
          required
          options={referenceOptions}
          value={getReferenceDisplayValue()}
          onChange={handleReferenceChange}
          placeholder={formData.brand ? "Select a reference" : "Select a brand first"}
          error={errors.reference}
          disabled={!formData.brand || availableReferences.length === 0}
        />
      </div>

      <FormField
        type="text"
        label="Theme"
        required
        value={formData.theme}
        onChange={(value) => onFieldChange('theme', value)}
        placeholder="e.g., Dark Luxury Noir Valentine's"
        maxLength={100}
        error={errors.theme}
      />

      <FormField
        type="textarea"
        label="Description"
        required
        value={formData.description}
        onChange={(value) => onFieldChange('description', value)}
        placeholder="Describe your image in detail..."
        maxLength={500}
        rows={4}
        error={errors.description}
      />

      <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border">
        <div className="space-y-0.5">
          <Label htmlFor="no-text" className="text-base font-medium">No Text</Label>
          <p className="text-sm text-muted-foreground">
            Generate image without any text overlays
          </p>
        </div>
        <Switch
          id="no-text"
          checked={formData.no_text}
          onCheckedChange={(checked) => onFieldChange('no_text', checked)}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          type="submit"
          className="flex-1 sm:flex-none gradient-primary gap-2 h-12 text-base font-medium shadow-glow"
        >
          <Sparkles className="w-5 h-5" />
          Generate Prompt
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onClear}
          className="gap-2 h-12"
        >
          <Trash2 className="w-4 h-4" />
          Clear Form
        </Button>
      </div>
    </motion.form>
  );
}