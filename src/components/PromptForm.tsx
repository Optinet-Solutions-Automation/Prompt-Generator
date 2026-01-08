import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FormField } from './FormField';
import { Sparkles, Trash2 } from 'lucide-react';
import {
  FormData,
  BRANDS,
  IMAGE_TYPES,
  LLM_TOOLS,
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
          options={BRANDS}
          value={formData.brand}
          onChange={(value) => onFieldChange('brand', value)}
          placeholder="Select a brand"
          error={errors.brand}
        />

        <FormField
          type="select"
          label="Image Type"
          required
          options={IMAGE_TYPES}
          value={formData.image_type}
          onChange={(value) => onFieldChange('image_type', value)}
          placeholder="Select image type"
          error={errors.image_type}
        />
      </div>

      <FormField
        type="text"
        label="Theme"
        required
        value={formData.theme}
        onChange={(value) => onFieldChange('theme', value)}
        placeholder="e.g., Christmas Sale, Summer Vibes"
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

      <FormField
        type="select"
        label="LLM Tool"
        required
        options={LLM_TOOLS}
        value={formData.llm_tool}
        onChange={(value) => onFieldChange('llm_tool', value)}
        placeholder="Select LLM tool"
        error={errors.llm_tool}
      />

      <FormField
        type="textarea"
        label="Additional Instructions"
        value={formData.additional_instructions}
        onChange={(value) => onFieldChange('additional_instructions', value)}
        placeholder="Any additional requirements or constraints..."
        maxLength={300}
        rows={3}
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
