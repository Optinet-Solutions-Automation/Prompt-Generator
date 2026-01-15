import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Check, Copy, Loader2, Sparkles, RotateCcw, Bot, Gem, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { AppState, PromptMetadata } from '@/types/prompt';
import { BRANDS, BRAND_REFERENCES } from '@/types/prompt';
import { ImageModal } from './ImageModal';
import { SavePromptModal } from './SavePromptModal';
import { FormField } from './FormField';
import { ReferenceSelect } from './ReferenceSelect';
import type { GeneratedImages } from '@/hooks/usePromptGenerator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ResultDisplayProps {
  prompt: string;
  metadata: PromptMetadata | null;
  processingTime: number;
  appState: AppState;
  generatedImages: GeneratedImages;
  isRegeneratingPrompt: boolean;
  onSave: () => void;
  onDontSave: () => void;
  onEditForm: () => void;
  onGenerateAgain: () => void;
  onClearForm: () => void;
  onPromptChange?: (newPrompt: string) => void;
  onMetadataChange?: (field: keyof PromptMetadata, value: string) => void;
  onAddGeneratedImage?: (provider: 'chatgpt' | 'gemini', image: { displayUrl: string; editUrl: string }) => void;
}

export function ResultDisplay({
  prompt,
  metadata,
  processingTime,
  appState,
  generatedImages,
  isRegeneratingPrompt,
  onSave,
  onDontSave,
  onEditForm,
  onGenerateAgain,
  onClearForm,
  onPromptChange,
  onMetadataChange,
  onAddGeneratedImage,
}: ResultDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [generatingImage, setGeneratingImage] = useState<'chatgpt' | 'gemini' | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<{ displayUrl: string; editUrl: string; provider: 'chatgpt' | 'gemini' } | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [editablePrompt, setEditablePrompt] = useState(prompt);

  // Sync editablePrompt with prompt prop when it changes (e.g., after regenerating)
  useEffect(() => {
    setEditablePrompt(prompt);
  }, [prompt]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(editablePrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePromptEdit = (value: string) => {
    setEditablePrompt(value);
    onPromptChange?.(value);
  };

  const handleGenerateImage = async (provider: 'chatgpt' | 'gemini') => {
    // Prevent multiple simultaneous requests
    if (generatingImage !== null) return;
    
    setGeneratingImage(provider);
    setImageError(null);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: editablePrompt, // Use the editable prompt
          provider,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate image');
      }

      const data = await response.json();
      const responseData = Array.isArray(data) ? data[0] : data;
      
      // Get display URL (thumbnailLink for faster loading) and edit URL (webViewLink/webContentLink for API)
      const displayUrl = responseData.imageUrl || 
                         responseData.thumbnailLink || 
                         responseData.webContentLink;
      
      const editUrl = responseData.webViewLink || 
                      responseData.webContentLink || 
                      responseData.imageUrl ||
                      (responseData.id ? `https://drive.google.com/file/d/${responseData.id}/view?usp=drivesdk` : null);
      
      if (displayUrl && editUrl) {
        onAddGeneratedImage?.(provider, { displayUrl, editUrl });
      } else {
        throw new Error('No image URL returned');
      }
    } catch (error) {
      console.error('Image generation error:', error);
      setImageError(error instanceof Error ? error.message : 'Failed to generate image');
    } finally {
      setGeneratingImage(null);
    }
  };

  const isSaving = appState === 'SAVING';
  const isSaved = appState === 'SAVED';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Editable Request Data Form */}
      {metadata && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl border border-border p-5 shadow-sm"
        >
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Request Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              type="select"
              label="Brand"
              required
              options={[...BRANDS]}
              value={metadata.brand}
              onChange={(value) => {
                onMetadataChange?.('brand', value);
                // Reset reference when brand changes
                onMetadataChange?.('reference', '');
              }}
              placeholder="Select a brand"
            />

            <ReferenceSelect
              label="Reference"
              required
              value={(() => {
                // Find reference ID from the formatted string "Label — Description"
                const refs = BRAND_REFERENCES[metadata.brand] || [];
                const found = refs.find(r => `${r.label} — ${r.description}` === metadata.reference);
                return found?.id || '';
              })()}
              onChange={(refId) => {
                // Convert ID back to formatted string for API
                const refs = BRAND_REFERENCES[metadata.brand] || [];
                const ref = refs.find(r => r.id === refId);
                if (ref) {
                  onMetadataChange?.('reference', `${ref.label} — ${ref.description}`);
                }
              }}
              placeholder={metadata.brand ? "Select a reference" : "Select a brand first"}
              disabled={!metadata.brand || (BRAND_REFERENCES[metadata.brand] || []).length === 0}
              references={BRAND_REFERENCES[metadata.brand] || []}
            />

            <FormField
              type="text"
              label="Theme"
              value={metadata.theme || ''}
              onChange={(value) => onMetadataChange?.('theme', value)}
              placeholder="e.g., Dark Luxury Noir Valentine's"
            />

            <FormField
              type="textarea"
              label="Description"
              value={metadata.description || ''}
              onChange={(value) => onMetadataChange?.('description', value)}
              placeholder="Describe your image..."
              rows={2}
            />
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              onClick={onGenerateAgain}
              disabled={isRegeneratingPrompt}
              className="gap-2 gradient-primary"
            >
              {isRegeneratingPrompt ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Regenerate Prompt
                </>
              )}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Editable Prompt Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="relative"
      >
        <div className="absolute -inset-1 gradient-primary rounded-2xl opacity-20 blur-sm" />
        <div className="relative bg-card rounded-xl border-2 border-primary/30 shadow-lg shadow-primary/10 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
            <div>
              <h3 className="font-bold text-lg text-foreground tracking-tight">Your Generated Prompt</h3>
              <p className="text-sm text-muted-foreground">
                Generated in {processingTime.toFixed(1)}s • Edit before generating image
              </p>
            </div>
            
            {/* Toolbar */}
            <TooltipProvider>
              <div className="flex items-center gap-0.5 bg-background rounded-lg p-1 border border-border shadow-sm">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCopy}
                      className="h-8 w-8 hover:bg-primary/10"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-success" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{copied ? 'Copied!' : 'Copy'}</p>
                  </TooltipContent>
                </Tooltip>

                <div className="w-px h-4 bg-border" />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onClearForm}
                      className="h-8 w-8 hover:bg-primary/10"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Reset</p>
                  </TooltipContent>
                </Tooltip>

                <div className="w-px h-4 bg-border" />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowSaveModal(true)}
                      className="h-8 w-8 text-primary hover:bg-primary/10"
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Save Prompt</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
          <div className="p-6">
            <Textarea
              value={editablePrompt}
              onChange={(e) => handlePromptEdit(e.target.value)}
              className="text-foreground leading-relaxed text-[15px] font-medium bg-muted/30 p-5 rounded-lg min-h-[200px] max-h-96 border border-border/50 resize-y"
              placeholder="Your generated prompt will appear here..."
            />
          </div>
        </div>
      </motion.div>


      {/* Save Prompt Modal - Only opens on icon click */}
      <SavePromptModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={() => {
          setShowSaveModal(false);
          onSave();
        }}
        onDontSave={() => {
          setShowSaveModal(false);
          onDontSave();
        }}
      />

      {/* Saving State */}
      {isSaving && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-2 py-4"
        >
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <span className="text-muted-foreground">Saving...</span>
        </motion.div>
      )}

      {/* Saved State */}
      {isSaved && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-center gap-2 py-4 text-success"
        >
          <Check className="w-5 h-5" />
          <span className="font-medium">Saved successfully!</span>
        </motion.div>
      )}

      {/* Image Generation Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card rounded-xl border border-border p-6 shadow-md"
      >
        <p className="text-center text-muted-foreground text-sm mb-4">
          Generate images using this prompt
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Button
            onClick={() => handleGenerateImage('chatgpt')}
            disabled={generatingImage !== null}
            variant="outline"
            className="gap-2"
          >
            {generatingImage === 'chatgpt' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Bot className="w-4 h-4" />
            )}
            ChatGPT
          </Button>
          <Button
            onClick={() => handleGenerateImage('gemini')}
            disabled={generatingImage !== null}
            variant="outline"
            className="gap-2"
          >
            {generatingImage === 'gemini' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Gem className="w-4 h-4" />
            )}
            Gemini
          </Button>
        </div>

        {/* Error Message */}
        {imageError && (
          <p className="text-destructive text-sm text-center mt-3">{imageError}</p>
        )}

        {/* Generated Images Gallery */}
        {(generatedImages.chatgpt.length > 0 || generatedImages.gemini.length > 0) && (
          <div className="mt-6 space-y-4">
            {/* ChatGPT Images */}
            {generatedImages.chatgpt.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Bot className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">ChatGPT ({generatedImages.chatgpt.length})</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {generatedImages.chatgpt.map((img, index) => (
                    <div
                      key={`chatgpt-${index}`}
                      className="relative group cursor-pointer aspect-square"
                      onClick={() => setModalImage({ displayUrl: img.displayUrl, editUrl: img.editUrl, provider: 'chatgpt' })}
                    >
                      <div className="absolute inset-0 bg-primary/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                        <span className="text-primary-foreground bg-primary/80 px-2 py-1 rounded text-xs font-medium">View</span>
                      </div>
                      <img
                        src={img.displayUrl}
                        alt={`ChatGPT image ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg border border-border shadow-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gemini Images */}
            {generatedImages.gemini.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Gem className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Gemini ({generatedImages.gemini.length})</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {generatedImages.gemini.map((img, index) => (
                    <div
                      key={`gemini-${index}`}
                      className="relative group cursor-pointer aspect-square"
                      onClick={() => setModalImage({ displayUrl: img.displayUrl, editUrl: img.editUrl, provider: 'gemini' })}
                    >
                      <div className="absolute inset-0 bg-primary/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                        <span className="text-primary-foreground bg-primary/80 px-2 py-1 rounded text-xs font-medium">View</span>
                      </div>
                      <img
                        src={img.displayUrl}
                        alt={`Gemini image ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg border border-border shadow-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Image Modal */}
      {modalImage && (
        <ImageModal
          isOpen={!!modalImage}
          onClose={() => setModalImage(null)}
          displayUrl={modalImage.displayUrl}
          editUrl={modalImage.editUrl}
          provider={modalImage.provider}
          onImageUpdated={(newDisplayUrl, newEditUrl) => {
            setModalImage(prev => prev ? { ...prev, displayUrl: newDisplayUrl, editUrl: newEditUrl } : null);
          }}
        />
      )}

    </motion.div>
  );
}