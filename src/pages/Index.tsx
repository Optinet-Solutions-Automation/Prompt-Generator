import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { PromptForm } from '@/components/PromptForm';
import { ProcessingState } from '@/components/ProcessingState';
import { ResultDisplay } from '@/components/ResultDisplay';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { usePromptGenerator } from '@/hooks/usePromptGenerator';
import { useReferencePromptData } from '@/hooks/useReferencePromptData';

const Index = () => {
  const {
    appState,
    formData,
    errors,
    generatedPrompt,
    promptMetadata,
    processingTime,
    elapsedTime,
    errorMessage,
    generatedImages,
    isRegeneratingPrompt,
    handleFieldChange,
    handleSubmit,
    handleSave,
    handleDontSave,
    handleEditForm,
    handleGenerateAgain,
    handleClearForm,
    handleGoBack,
    handlePromptChange,
    handleMetadataChange,
    handleAddGeneratedImage,
    handleRemoveGeneratedImage,
  } = usePromptGenerator();

  const {
    referencePromptData,
    isLoadingReferenceData,
    fetchReferencePromptData,
    clearReferencePromptData,
  } = useReferencePromptData();

  const handleReferenceChange = (brand: string, referenceId: string) => {
    if (referenceId) {
      fetchReferencePromptData(brand, referenceId);
    } else {
      clearReferencePromptData();
    }
  };

  const showForm = appState === 'FORM';
  const showProcessing = appState === 'PROCESSING';
  const showResult = ['RESULT', 'SAVING', 'SAVED'].includes(appState);
  const showError = !!errorMessage && appState === 'FORM';

  return (
    <div className="min-h-screen bg-background">
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full gradient-primary opacity-[0.03] blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/4 w-[600px] h-[600px] rounded-full gradient-primary opacity-[0.03] blur-3xl" />
      </div>

      <div className="relative container max-w-3xl mx-auto px-4 py-8 md:py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary shadow-glow mb-6">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            AI Prompt Generator
          </h1>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            Create stunning AI image prompts tailored for your brand and campaign needs
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          layout
          className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden"
        >
          <div className="p-6 md:p-8">
            <AnimatePresence mode="wait">
              {showError && (
                <ErrorDisplay
                  key="error"
                  message={errorMessage}
                  onGoBack={handleGoBack}
                />
              )}

              {showForm && !showError && (
                <PromptForm
                  key="form"
                  formData={formData}
                  errors={errors}
                  referencePromptData={referencePromptData}
                  isLoadingReferenceData={isLoadingReferenceData}
                  onFieldChange={handleFieldChange}
                  onReferenceChange={handleReferenceChange}
                  onSubmit={handleSubmit}
                  onClear={handleClearForm}
                />
              )}

              {showProcessing && (
                <ProcessingState key="processing" elapsedTime={elapsedTime} />
              )}

              {showResult && (
                <ResultDisplay
                  key="result"
                  prompt={generatedPrompt}
                  metadata={promptMetadata}
                  processingTime={processingTime}
                  appState={appState}
                  generatedImages={generatedImages}
                  isRegeneratingPrompt={isRegeneratingPrompt}
                  referencePromptData={referencePromptData}
                  isLoadingReferenceData={isLoadingReferenceData}
                  onReferenceChange={handleReferenceChange}
                  onSave={handleSave}
                  onDontSave={handleDontSave}
                  onEditForm={handleEditForm}
                  onGenerateAgain={handleGenerateAgain}
                  onClearForm={handleClearForm}
                  onPromptChange={handlePromptChange}
                  onMetadataChange={handleMetadataChange}
                  onAddGeneratedImage={handleAddGeneratedImage}
                  onRemoveGeneratedImage={handleRemoveGeneratedImage}
                />
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-muted-foreground mt-8"
        >
          Powered by AI • Generate professional prompts in seconds
        </motion.p>
      </div>
    </div>
  );
};

export default Index;
