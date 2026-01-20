import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FormField } from './FormField';
import { ReferenceSelect } from './ReferenceSelect';
import { Sparkles, Trash2 } from 'lucide-react';
import {
  FormData,
  BRANDS,
  BRAND_REFERENCES,
  SUBJECT_POSITIONS,
} from '@/types/prompt';

interface PromptFormProps {
  formData: FormData;
  errors: Partial<Record<keyof FormData, string>>;
  onFieldChange: (field: keyof FormData, value: string) => void;
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

        <ReferenceSelect
          label="Reference"
          required
          value={formData.reference}
          onChange={(value) => onFieldChange('reference', value)}
          placeholder={formData.brand ? "Select a reference" : "Select a brand first"}
          error={errors.reference}
          disabled={!formData.brand || availableReferences.length === 0}
          references={availableReferences}
        />
      </div>

      <FormField
        type="select"
        label="Subject Position"
        options={[...SUBJECT_POSITIONS]}
        value={formData.subjectPosition}
        onChange={(value) => onFieldChange('subjectPosition', value)}
        placeholder="Default"
      />

      <FormField
        type="text"
        label="Theme"
        value={formData.theme}
        onChange={(value) => onFieldChange('theme', value)}
        placeholder="e.g., Dark Luxury Noir Valentine's"
        maxLength={100}
        error={errors.theme}
      />

      <FormField
        type="textarea"
        label="Description"
        value={formData.description}
        onChange={(value) => onFieldChange('description', value)}
        placeholder="Describe your image in detail..."
        maxLength={500}
        rows={4}
        error={errors.description}
      />

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