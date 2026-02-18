import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FormField } from "./FormField";
import { ReferenceSelect } from "./ReferenceSelect";
import { PositionAndRatioSelector } from "./PositionAndRatioSelector";
import { ReferencePromptDataDisplay } from "./ReferencePromptDataDisplay";
import { Heart, Sparkles, Trash2 } from "lucide-react";
import { FormData, BRANDS, ReferencePromptData } from "@/types/prompt";
import { usePromptList } from "@/hooks/usePromptList";

interface PromptFormProps {
  formData: FormData;
  errors: Partial<Record<keyof FormData, string>>;
  referencePromptData: ReferencePromptData | null;
  isLoadingReferenceData: boolean;
  onFieldChange: (field: keyof FormData, value: string) => void;
  onReferenceChange: (brand: string, referenceId: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  onOpenFavorites: () => void;
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
  onOpenFavorites,
}: PromptFormProps) {
  // Load all prompts from Airtable via n8n
  const { getReferencesForBrand, getRecordId, isLoading: isLoadingList, error: listError } = usePromptList();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  // Get references for the selected brand from Airtable (dynamic, not hardcoded)
  const availableReferences = formData.brand ? getReferencesForBrand(formData.brand) : [];

  // Reset reference when brand changes
  const handleBrandChange = (value: string) => {
    onFieldChange("brand", value);
    if (formData.reference) {
      onFieldChange("reference", "");
    }
  };

  const handleReferenceChange = (selectedValue: string) => {
    // selectedValue is the prompt_name (we use prompt_name as the option id).
    // Store it in formData.reference — this is what gets sent to the generate-prompt n8n workflow.
    onFieldChange("reference", selectedValue);

    // Look up the Airtable record ID so we can fetch the full reference data.
    const recordId = getRecordId(selectedValue, formData.brand);
    onReferenceChange(formData.brand, recordId);
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
          placeholder={
            !formData.brand
              ? "Select a brand first"
              : isLoadingList
              ? "Loading prompts..."
              : availableReferences.length === 0
              ? "No prompts found for this brand"
              : "Select a reference"
          }
          error={errors.reference}
          disabled={!formData.brand || isLoadingList || availableReferences.length === 0}
          references={availableReferences}
        />
      </div>

      {/* Show error if the prompt list failed to load */}
      {listError && (
        <p className="text-sm text-destructive">
          Could not load prompts: {listError}. Please refresh the page.
        </p>
      )}

      <PositionAndRatioSelector
        subjectPosition={formData.subjectPosition}
        aspectRatio={formData.aspectRatio}
        onSubjectPositionChange={(value) => onFieldChange("subjectPosition", value)}
        onAspectRatioChange={(value) => onFieldChange("aspectRatio", value)}
      />

      <FormField
        type="text"
        label="Theme"
        value={formData.theme}
        onChange={(value) => onFieldChange("theme", value)}
        placeholder="e.g., Dark Luxury Noir Valentine's"
        maxLength={100}
        error={errors.theme}
      />

      <FormField
        type="textarea"
        label="Description"
        value={formData.description}
        onChange={(value) => onFieldChange("description", value)}
        placeholder="Describe your image in detail..."
        maxLength={500}
        rows={4}
        error={errors.description}
      />

      <ReferencePromptDataDisplay
        data={
          formData.reference
            ? {
                format_layout: formData.format_layout || referencePromptData?.format_layout || "",
                primary_object: formData.primary_object || referencePromptData?.primary_object || "",
                subject: formData.subject || referencePromptData?.subject || "",
                lighting: formData.lighting || referencePromptData?.lighting || "",
                mood: formData.mood || referencePromptData?.mood || "",
                background: formData.background || referencePromptData?.background || "",
                positive_prompt: formData.positive_prompt || referencePromptData?.positive_prompt || "",
                negative_prompt: formData.negative_prompt || referencePromptData?.negative_prompt || "",
              }
            : null
        }
        isLoading={isLoadingReferenceData}
        disabled={false}
        onChange={(field, value) => onFieldChange(field, value)}
      />

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          type="submit"
          disabled={isLoadingReferenceData}
          className="flex-1 sm:flex-none gradient-primary gap-2 h-12 text-base font-medium shadow-glow disabled:opacity-50"
        >
          <Sparkles className="w-5 h-5" />
          {isLoadingReferenceData ? "Loading..." : "Generate Prompt"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onClear}
          disabled={isLoadingReferenceData}
          className="gap-2 h-12"
        >
          <Trash2 className="w-4 h-4" />
          Clear Form
        </Button>
        <Button type="button" variant="outline" onClick={onOpenFavorites} className="gap-2 h-12 sm:ml-auto">
          <Heart className="w-4 h-4" />
          Favorites
        </Button>
      </div>
    </motion.form>
  );
}
