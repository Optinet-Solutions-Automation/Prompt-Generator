import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FormField } from './FormField';
import { ReferenceSelect } from './ReferenceSelect';
import { PositionAndRatioSelector } from './PositionAndRatioSelector';
import { ReferencePromptDataDisplay } from './ReferencePromptDataDisplay';
import { Sparkles, Trash2 } from 'lucide-react';
import {
  FormData,
  BRANDS,
  BRAND_REFERENCES,
  ReferencePromptData,
} from '@/types/prompt';

interface PromptFormProps {
  formData: FormData;
  errors: Partial<Record<keyof FormData, string>>;
  referencePromptData: ReferencePromptData | null;
  isLoadingReferenceData: boolean;
  onFieldChange: (field: keyof FormData, value: string) => void;
  onReferenceChange: (brand: string, referenceId: string) => void;
  onSubmit: () => void;
  onClear: () => void;
}

export function PromptForm({
  formData,
  errors,
  referencePromptData,
  isLoadingReferenceData,
  onFieldChange,
  onReferenceChange,
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

  const handleReferenceChange = (value: string) => {
    onFieldChange('reference', value);
    onReferenceChange(formData.brand, value);
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
          onChange={handleReferenceChange}
          placeholder={formData.brand ? "Select a reference" : "Select a brand first"}
          error={errors.reference}
          disabled={!formData.brand || availableReferences.length === 0}
          references={availableReferences}
        />
      </div>

      <PositionAndRatioSelector
        subjectPosition={formData.subjectPosition}
        aspectRatio={formData.aspectRatio}
        onSubjectPositionChange={(value) => onFieldChange('subjectPosition', value)}
        onAspectRatioChange={(value) => onFieldChange('aspectRatio', value)}
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

      <ReferencePromptDataDisplay
        data={referencePromptData}
        isLoading={isLoadingReferenceData}
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