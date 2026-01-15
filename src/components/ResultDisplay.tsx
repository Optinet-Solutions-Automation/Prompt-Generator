import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, Copy, Loader2, RefreshCw, Sparkles, Image, Palette, Target, Pencil, RotateCcw, Bot, Gem, Save } from 'lucide-react';
import { useState } from 'react';
import type { AppState, PromptMetadata } from '@/types/prompt';
import { ImageModal } from './ImageModal';
import { SavePromptModal } from './SavePromptModal';
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
  onSave: () => void;
  onDontSave: () => void;
  onEditForm: () => void;
  onGenerateAgain: () => void;
  onClearForm: () => void;
}

export function ResultDisplay({
  prompt,
  metadata,
  processingTime,
  appState,
  onSave,
  onDontSave,
  onEditForm,
  onGenerateAgain,
  onClearForm,
}: ResultDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [generatingImage, setGeneratingImage] = useState<'chatgpt' | 'gemini' | null>(null);
  const [generatedImages, setGeneratedImages] = useState<{ chatgpt: { displayUrl: string; editUrl: string }[]; gemini: { displayUrl: string; editUrl: string }[] }>({ chatgpt: [], gemini: [] });
  const [imageError, setImageError] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<{ displayUrl: string; editUrl: string; provider: 'chatgpt' | 'gemini' } | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateImage = async (provider: 'chatgpt' | 'gemini') => {
    setGeneratingImage(provider);
    setImageError(null);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
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
        setGeneratedImages(prev => ({
          ...prev,
          [provider]: [...prev[provider], { displayUrl, editUrl }]
        }));
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

  const showSaveButtons = appState === 'RESULT';
  const isSaving = appState === 'SAVING';
  const isSaved = appState === 'SAVED';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Metadata Card */}
      {metadata && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          <div className="bg-card rounded-lg border border-border p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-primary mb-1">
              <Target className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Relevance</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{metadata.relevance_score}/100</p>
          </div>
          <div className="bg-card rounded-lg border border-border p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-primary mb-1">
              <Palette className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Style</span>
            </div>
            <p className="text-lg font-semibold text-foreground capitalize">{metadata.style_confidence}</p>
          </div>
          <div className="bg-card rounded-lg border border-border p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-primary mb-1">
              <Image className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wide">References</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{metadata.reference_count}</p>
          </div>
          <div className="bg-card rounded-lg border border-border p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-primary mb-1">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Prompts Used</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{metadata.similar_prompts_used}</p>
          </div>
        </motion.div>
      )}

      {/* Recommended AI */}
      {metadata?.recommended_ai && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20 p-4"
        >
          <p className="text-sm text-muted-foreground mb-1">Recommended AI Tools</p>
          <p className="text-foreground font-medium">{metadata.recommended_ai}</p>
        </motion.div>
      )}

      {/* Prompt Card */}
      <div className="relative">
        <div className="absolute inset-0 gradient-primary rounded-xl opacity-5" />
        <div className="relative bg-card rounded-xl border border-border shadow-lg overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
            <div>
              <h3 className="font-semibold text-foreground">Your Generated Prompt</h3>
              <p className="text-sm text-muted-foreground">
                Generated in {processingTime.toFixed(1)} seconds
              </p>
            </div>
            
            {/* Toolbar */}
            <TooltipProvider>
              <div className="flex items-center gap-1 bg-background/50 rounded-lg p-1 border border-border">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCopy}
                      className="h-8 w-8"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{copied ? 'Copied!' : 'Copy'}</p>
                  </TooltipContent>
                </Tooltip>

                <div className="w-px h-5 bg-border" />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onGenerateAgain}
                      className="h-8 w-8"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Generate Again</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onEditForm}
                      className="h-8 w-8"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit Form</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onClearForm}
                      className="h-8 w-8"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Reset</p>
                  </TooltipContent>
                </Tooltip>

                <div className="w-px h-5 bg-border" />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowSaveModal(true)}
                      className="h-8 w-8 text-primary hover:text-primary"
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
            <p className="text-foreground leading-relaxed whitespace-pre-wrap font-mono text-sm bg-muted/50 p-4 rounded-lg max-h-96 overflow-y-auto">
              {prompt}
            </p>
          </div>
        </div>
      </div>

      {/* Save Prompt Modal */}
      <SavePromptModal
        isOpen={showSaveModal || showSaveButtons}
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
            setGeneratedImages(prev => ({ ...prev, [modalImage.provider]: { displayUrl: newDisplayUrl, editUrl: newEditUrl } }));
            setModalImage(prev => prev ? { ...prev, displayUrl: newDisplayUrl, editUrl: newEditUrl } : null);
          }}
        />
      )}

    </motion.div>
  );
}
