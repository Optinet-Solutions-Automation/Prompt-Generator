import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, Copy, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { AppState } from '@/types/prompt';

interface ResultDisplayProps {
  prompt: string;
  processingTime: number;
  appState: AppState;
  onSave: () => void;
  onDontSave: () => void;
  onGenerateAgain: () => void;
  onClearForm: () => void;
}

export function ResultDisplay({
  prompt,
  processingTime,
  appState,
  onSave,
  onDontSave,
  onGenerateAgain,
  onClearForm,
}: ResultDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-success" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <div className="p-6">
            <p className="text-foreground leading-relaxed whitespace-pre-wrap font-mono text-sm bg-muted/50 p-4 rounded-lg">
              {prompt}
            </p>
          </div>
        </div>
      </div>

      {/* Save Section */}
      {showSaveButtons && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border border-border p-6 shadow-md"
        >
          <p className="text-center text-foreground font-medium mb-4">
            Would you like to save this prompt?
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={onSave} className="gradient-primary min-w-24">
              Yes
            </Button>
            <Button variant="outline" onClick={onDontSave} className="min-w-24">
              No
            </Button>
          </div>
        </motion.div>
      )}

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

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          onClick={onGenerateAgain}
          className="gradient-primary gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Generate Again
        </Button>
        <Button variant="outline" onClick={onClearForm} className="gap-2">
          <Trash2 className="w-4 h-4" />
          Clear Form
        </Button>
      </div>
    </motion.div>
  );
}
