import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Check, Copy, Loader2, Sparkles, RotateCcw, Bot, Gem, Save, X } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { FavoriteHeart } from './FavoriteHeart';
import type { AppState, PromptMetadata, ReferencePromptData } from '@/types/prompt';
import { BRANDS, BRAND_REFERENCES } from '@/types/prompt';
import { ImageModal } from './ImageModal';
import { SavePromptModal } from './SavePromptModal';
import { FormField } from './FormField';
import { ReferenceSelect } from './ReferenceSelect';
import { PositionAndRatioSelector } from './PositionAndRatioSelector';
import { ReferencePromptDataDisplay } from './ReferencePromptDataDisplay';
import type { GeneratedImages } from '@/hooks/usePromptGenerator';
import { useElapsedTime } from '@/hooks/useElapsedTime';
import { normalizeN8nImageResponse } from '@/lib/n8nImage';
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
  referencePromptData: ReferencePromptData | null;
  isLoadingReferenceData: boolean;
  onReferenceChange: (brand: string, referenceId: string) => void;
  onSave: () => void;
  onDontSave: () => void;
  onEditForm: () => void;
  onGenerateAgain: () => void;
  onClearForm: () => void;
  onPromptChange?: (newPrompt: string) => void;
  onMetadataChange?: (field: keyof PromptMetadata, value: string) => void;
  onAddGeneratedImage?: (provider: 'chatgpt' | 'gemini', image: { displayUrl: string; editUrl: string; referenceLabel: string; generatedBrand: string }) => void;
  onRemoveGeneratedImage?: (provider: 'chatgpt' | 'gemini', index: number) => void;
}

export function ResultDisplay({
  prompt,
  metadata,
  processingTime,
  appState,
  generatedImages,
  isRegeneratingPrompt,
  referencePromptData,
  isLoadingReferenceData,
  onReferenceChange,
  onSave,
  onDontSave,
  onEditForm,
  onGenerateAgain,
  onClearForm,
  onPromptChange,
  onMetadataChange,
  onAddGeneratedImage,
  onRemoveGeneratedImage,
}: ResultDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [generatingImage, setGeneratingImage] = useState<{ chatgpt: boolean; gemini: boolean }>({ chatgpt: false, gemini: false });
  const [imageError, setImageError] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<{ displayUrl: string; editUrl: string; provider: 'chatgpt' | 'gemini'; imageId: string } | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [editablePrompt, setEditablePrompt] = useState(prompt);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  

  // Store record_id and img_url per imageId for consistent like/unlike payloads
  const imageMetaRef = useRef<Map<string, { recordId: string; imgUrl: string }>>(new Map());
  // Store generated brand per imageId separately
  const imageBrandRef = useRef<Map<string, string>>(new Map());
  const pendingWebhookRef = useRef<Set<string>>(new Set());

  const getImageMeta = useCallback((imageId: string) => {
    if (imageMetaRef.current.has(imageId)) {
      return imageMetaRef.current.get(imageId)!;
    }
    // Extract the actual image URL from the imageId (format: "provider-index-url")
    const urlStart = imageId.indexOf('-', imageId.indexOf('-') + 1) + 1;
    const imgUrl = imageId.substring(urlStart);

    // Derive record_id from the file name (last segment of the URL path)
    let recordId: string;
    try {
      const urlObj = new URL(imgUrl);
      const pathSegments = urlObj.pathname.split('/').filter(Boolean);
      recordId = pathSegments[pathSegments.length - 1] || imgUrl;
    } catch {
      const lastSlash = imgUrl.lastIndexOf('/');
      recordId = lastSlash >= 0 ? imgUrl.substring(lastSlash + 1) : imgUrl;
    }

    const meta = { recordId, imgUrl };
    imageMetaRef.current.set(imageId, meta);
    return meta;
  }, []);

  const handleToggleFavorite = useCallback((imageId: string, liked: boolean) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (liked) next.add(imageId);
      else next.delete(imageId);
      return next;
    });

    // Prevent duplicate rapid clicks
    if (pendingWebhookRef.current.has(imageId)) return;
    pendingWebhookRef.current.add(imageId);

    const { recordId, imgUrl } = getImageMeta(imageId);

    // Get the stored brand from the image brand ref
    const storedBrand = imageBrandRef.current.get(imageId);
    const brandName = storedBrand || metadata?.brand || 'No Brand';

    const endpoint = liked
      ? 'https://automateoptinet.app.n8n.cloud/webhook/like-img'
      : 'https://automateoptinet.app.n8n.cloud/webhook/unlike-img';

    const payload = liked
      ? { record_id: recordId, img_url: imgUrl, brand_name: brandName }
      : { record_id: recordId, img_url: imgUrl };

    if (liked) {
      console.log('Liking image generated for brand:', brandName);
      console.log('Current brand selector:', metadata?.brand);
      console.log('Using stored brand:', storedBrand);
      console.log('Payload:', payload);
    }

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .catch(() => {})
      .finally(() => {
        pendingWebhookRef.current.delete(imageId);
      });
  }, [getImageMeta, metadata]);
  
  // Elapsed time trackers for different operations
  const chatgptTimer = useElapsedTime();
  const geminiTimer = useElapsedTime();

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

  // Get reference label from metadata
  const getReferenceLabel = (): string => {
    if (!metadata?.brand || !metadata?.reference) return 'Unknown';
    const refs = BRAND_REFERENCES[metadata.brand] || [];
    const found = refs.find(r => `${r.label} — ${r.description}` === metadata.reference);
    return found?.label || metadata.reference.split(' — ')[0] || 'Unknown';
  };

  const handleGenerateImage = async (provider: 'chatgpt' | 'gemini') => {
    // Prevent multiple simultaneous requests for the same provider
    if (generatingImage[provider]) return;
    
    const timer = provider === 'chatgpt' ? chatgptTimer : geminiTimer;
    
    setGeneratingImage(prev => ({ ...prev, [provider]: true }));
    timer.start();
    setImageError(null);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: editablePrompt,
          provider,
          aspectRatio: metadata?.aspectRatio || '1:1',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate image');
      }

      const data = await response.json();
      console.log('RAW API RESPONSE:', data); // ADD THIS
      
      const normalized = normalizeN8nImageResponse(data);
      console.log('NORMALIZED RESPONSE:', normalized); // ADD THIS
      
      const displayUrl = normalized.displayUrl;
      const editUrl = normalized.editUrl;
      
      console.log('DISPLAY URL:', displayUrl); // ADD THIS
      console.log('EDIT URL:', editUrl); // ADD THIS
      
      if (displayUrl && editUrl) {
        const generatedBrand = metadata?.brand || 'No Brand';
        onAddGeneratedImage?.(provider, { displayUrl, editUrl, referenceLabel: getReferenceLabel(), generatedBrand });
      } else {
        throw new Error('No image URL returned from response');
      }
    } catch (error) {
      console.error('Image generation error:', error);
      setImageError(error instanceof Error ? error.message : 'Failed to generate image');
    } finally {
      setGeneratingImage(prev => ({ ...prev, [provider]: false }));
      timer.stop();
    }
  };

  const handleGenerateBoth = async () => {
    // Start both generations simultaneously
    handleGenerateImage('chatgpt');
    handleGenerateImage('gemini');
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              disabled={isRegeneratingPrompt}
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
                  // Trigger API call to fetch reference prompt data
                  onReferenceChange(metadata.brand, refId);
                }
              }}
              placeholder={metadata.brand ? "Select a reference" : "Select a brand first"}
              disabled={!metadata.brand || (BRAND_REFERENCES[metadata.brand] || []).length === 0 || isRegeneratingPrompt}
              references={BRAND_REFERENCES[metadata.brand] || []}
            />

            <div className="sm:col-span-2">
              <PositionAndRatioSelector
                subjectPosition={metadata.subjectPosition || 'Centered'}
                aspectRatio={metadata.aspectRatio || '16:9'}
                onSubjectPositionChange={(value) => onMetadataChange?.('subjectPosition', value)}
                onAspectRatioChange={(value) => onMetadataChange?.('aspectRatio', value)}
                disabled={isRegeneratingPrompt}
              />
            </div>

            <FormField
              type="text"
              label="Theme"
              value={metadata.theme || ''}
              onChange={(value) => onMetadataChange?.('theme', value)}
              placeholder="e.g., Dark Luxury Noir Valentine's"
              disabled={isRegeneratingPrompt}
            />

            <FormField
              type="textarea"
              label="Description"
              value={metadata.description || ''}
              onChange={(value) => onMetadataChange?.('description', value)}
              placeholder="Describe your image..."
              rows={2}
              disabled={isRegeneratingPrompt}
            />

          </div>

          {/* Reference Prompt Data - Collapsible & Editable */}
          <ReferencePromptDataDisplay
            data={{
              format_layout: metadata.format_layout || '',
              primary_object: metadata.primary_object || '',
              subject: metadata.subject || '',
              lighting: metadata.lighting || '',
              mood: metadata.mood || '',
              background: metadata.background || '',
              positive_prompt: metadata.positive_prompt || '',
              negative_prompt: metadata.negative_prompt || '',
            }}
            isLoading={isLoadingReferenceData}
            disabled={isRegeneratingPrompt}
            onChange={(field, value) => onMetadataChange?.(field, value)}
          />

          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <Button
              onClick={onGenerateAgain}
              disabled={isRegeneratingPrompt || isLoadingReferenceData}
              className="gap-2 gradient-primary"
            >
              {isRegeneratingPrompt ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Regenerating...
                </>
              ) : isLoadingReferenceData ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
            <div>
              <h3 className="font-bold text-base sm:text-lg text-foreground tracking-tight">Your Generated Prompt</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Generated in {processingTime.toFixed(1)}s • Edit before generating
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
          <div className="p-4 sm:p-6">
            <Textarea
              value={editablePrompt}
              onChange={(e) => handlePromptEdit(e.target.value)}
              className="text-foreground leading-relaxed text-sm sm:text-[15px] font-medium bg-muted/30 p-4 sm:p-5 rounded-lg min-h-[180px] sm:min-h-[200px] max-h-96 border border-border/50 resize-y"
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
        className="bg-card rounded-xl border border-border p-4 sm:p-6 shadow-md"
      >
        <p className="text-center text-muted-foreground text-xs sm:text-sm mb-4">
          Generate images using this prompt
        </p>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
          <Button
            onClick={() => handleGenerateImage('chatgpt')}
            disabled={generatingImage.chatgpt}
            variant="outline"
            className="gap-2 w-full sm:w-auto sm:min-w-[120px]"
          >
            {generatingImage.chatgpt ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="tabular-nums">{chatgptTimer.elapsedTime}s</span>
              </>
            ) : (
              <>
                <Bot className="w-4 h-4" />
                ChatGPT
              </>
            )}
          </Button>
          <Button
            onClick={() => handleGenerateImage('gemini')}
            disabled={generatingImage.gemini}
            variant="outline"
            className="gap-2 w-full sm:w-auto sm:min-w-[120px]"
          >
            {generatingImage.gemini ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="tabular-nums">{geminiTimer.elapsedTime}s</span>
              </>
            ) : (
              <>
                <Gem className="w-4 h-4" />
                Gemini
              </>
            )}
          </Button>
          <Button
            onClick={handleGenerateBoth}
            disabled={generatingImage.chatgpt || generatingImage.gemini}
            variant="default"
            className="gap-2 gradient-primary w-full sm:w-auto sm:min-w-[140px]"
          >
            {(generatingImage.chatgpt && generatingImage.gemini) ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Both
              </>
            )}
          </Button>
        </div>

        {/* Error Message */}
        {imageError && (
          <p className="text-destructive text-sm text-center mt-3">{imageError}</p>
        )}

        {/* Generated Images Gallery - Combined by reference label */}
        {(generatedImages.chatgpt.length > 0 || generatedImages.gemini.length > 0) && (
          <div className="mt-6 space-y-4">
            {/* All images combined, grouped by reference label */}
            {(() => {
              // Create images with original index for removal
              const chatgptWithIndex = generatedImages.chatgpt.map((img, idx) => ({ ...img, originalIndex: idx }));
              const geminiWithIndex = generatedImages.gemini.map((img, idx) => ({ ...img, originalIndex: idx }));
              const allImages = [...chatgptWithIndex, ...geminiWithIndex];
              const groupedByRef = allImages.reduce((acc, img) => {
                const label = img.referenceLabel || 'Unknown';
                if (!acc[label]) acc[label] = [];
                acc[label].push(img);
                return acc;
              }, {} as Record<string, typeof allImages>);

              return Object.entries(groupedByRef).map(([label, images]) => (
                <div key={label}>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">{label} ({images.length})</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {images.map((img, index) => {
                      const imageId = `${img.provider}-${img.originalIndex}-${img.displayUrl}`;
                      // Register the brand stored at generation time
                      if (img.generatedBrand && !imageBrandRef.current.has(imageId)) {
                        imageBrandRef.current.set(imageId, img.generatedBrand);
                      }
                      return (
                      <div
key={`${label}-${img.provider}-${index}`}
                        className="relative group cursor-pointer aspect-square"
                        onClick={() => setModalImage({ displayUrl: img.displayUrl, editUrl: img.editUrl, provider: img.provider, imageId })}
                      >
                        <div className="absolute inset-0 bg-primary/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                          <span className="text-primary-foreground bg-primary/80 px-2 py-1 rounded text-xs font-medium">View</span>
                        </div>
                        {/* Remove button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveGeneratedImage?.(img.provider, img.originalIndex);
                          }}
                          className="absolute top-1 left-1 z-20 bg-destructive/90 hover:bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        {/* Favorite heart */}
                        <FavoriteHeart
                          imageId={imageId}
                          liked={favorites.has(imageId)}
                          onToggle={handleToggleFavorite}
                          className="top-1 right-8"
                        />
                        {/* Provider badge */}
                        <div className="absolute top-1 right-1 z-10">
                          {img.provider === 'chatgpt' ? (
                            <div className="bg-background/80 backdrop-blur-sm rounded p-1">
                              <Bot className="w-3 h-3 text-muted-foreground" />
                            </div>
                          ) : (
                            <div className="bg-background/80 backdrop-blur-sm rounded p-1">
                              <Gem className="w-3 h-3 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        {/* Brand badge */}
                        {img.generatedBrand && (
                          <div className="absolute bottom-1 left-1 z-10">
                            <span className="bg-background/80 backdrop-blur-sm text-foreground text-[10px] font-medium px-1.5 py-0.5 rounded">
                              {img.generatedBrand}
                            </span>
                          </div>
                        )}
                        <img
                          src={img.displayUrl}
                          alt={`${label} - ${img.provider}`}
                          className="w-full h-full object-cover rounded-lg border border-border shadow-sm"
                        />
                      </div>
                      );
                    })}
                  </div>
                </div>
              ));
            })()}
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
          imageId={modalImage.imageId}
          liked={favorites.has(modalImage.imageId)}
          onToggleFavorite={handleToggleFavorite}
          onImageUpdated={(newDisplayUrl, newEditUrl) => {
            setModalImage(prev => prev ? { ...prev, displayUrl: newDisplayUrl, editUrl: newEditUrl } : null);
          }}
        />
      )}

    </motion.div>
  );
}