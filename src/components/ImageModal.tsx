import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Download, FileCode, Loader2, Wand2 } from 'lucide-react';
import { HtmlConversionModal } from './HtmlConversionModal';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  provider: 'chatgpt' | 'gemini';
  onImageUpdated?: (newImageUrl: string) => void;
}

export function ImageModal({ isOpen, onClose, imageUrl, provider, onImageUpdated }: ImageModalProps) {
  const [editInstructions, setEditInstructions] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(imageUrl);
  const [showHtmlModal, setShowHtmlModal] = useState(false);

  const handleDownload = async () => {
    try {
      const response = await fetch(currentImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `generated-image-${provider}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open in new tab
      window.open(currentImageUrl, '_blank');
    }
  };

  const handleEditImage = async () => {
    if (!editInstructions.trim()) return;
    
    setIsEditing(true);
    setEditError(null);

    try {
      const response = await fetch('/api/edit-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: currentImageUrl,
          editInstructions: editInstructions.trim(),
          provider,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to edit image');
      }

      const data = await response.json();
      
      // Handle different response formats (direct imageUrl or Google Drive response)
      const newImageUrl = data.imageUrl || 
                          data.thumbnailLink || 
                          data.webContentLink || 
                          (Array.isArray(data) && data[0]?.thumbnailLink) ||
                          (Array.isArray(data) && data[0]?.webContentLink);
      
      if (newImageUrl) {
        setCurrentImageUrl(newImageUrl);
        setEditInstructions('');
        onImageUpdated?.(newImageUrl);
      } else {
        throw new Error('No image URL returned');
      }
    } catch (error) {
      console.error('Image edit error:', error);
      setEditError(error instanceof Error ? error.message : 'Failed to edit image');
    } finally {
      setIsEditing(false);
    }
  };

  const handleClose = () => {
    setEditInstructions('');
    setEditError(null);
    setCurrentImageUrl(imageUrl);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Generated Image ({provider === 'chatgpt' ? 'ChatGPT' : 'Gemini'})</span>
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="relative w-full overflow-auto max-h-[50vh] rounded-lg bg-muted/50">
              <img
                src={currentImageUrl}
                alt="Generated image"
                className="w-full h-auto object-contain rounded-lg"
              />
            </div>

            {/* Edit Instructions */}
            <div className="space-y-2">
              <Textarea
                placeholder="Enter editing instructions (e.g., 'Make the character face forward', 'Zoom in on the subject', 'Change to 1920x1080')"
                value={editInstructions}
                onChange={(e) => setEditInstructions(e.target.value)}
                className="min-h-[80px] resize-none"
              />
              {editError && (
                <p className="text-destructive text-sm">{editError}</p>
              )}
              <Button 
                onClick={handleEditImage} 
                disabled={isEditing || !editInstructions.trim()}
                variant="outline"
                className="w-full gap-2"
              >
                {isEditing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Apply Edit & Regenerate
                  </>
                )}
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <Button 
                onClick={() => setShowHtmlModal(true)} 
                variant="outline"
                className="gap-2"
              >
                <FileCode className="w-4 h-4" />
                Convert to HTML
              </Button>
              <Button onClick={handleDownload} className="gap-2 gradient-primary">
                <Download className="w-4 h-4" />
                Download Image
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* HTML Conversion Modal */}
      <HtmlConversionModal
        isOpen={showHtmlModal}
        onClose={() => setShowHtmlModal(false)}
        imageUrl={currentImageUrl}
      />
    </>
  );
}
