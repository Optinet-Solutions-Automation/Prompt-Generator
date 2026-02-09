import { useState, useEffect, useRef } from 'react';
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
import { FavoriteHeart } from './FavoriteHeart';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  displayUrl: string;
  editUrl: string;
  provider: 'chatgpt' | 'gemini';
  onImageUpdated?: (newDisplayUrl: string, newEditUrl: string) => void;
  imageId?: string;
  liked?: boolean;
  onToggleFavorite?: (imageId: string, liked: boolean) => void;
}

export function ImageModal({ isOpen, onClose, displayUrl, editUrl, provider, onImageUpdated, imageId, liked, onToggleFavorite }: ImageModalProps) {
  const [editInstructions, setEditInstructions] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [currentDisplayUrl, setCurrentDisplayUrl] = useState(displayUrl);
  const [currentEditUrl, setCurrentEditUrl] = useState(editUrl);
  const [showHtmlModal, setShowHtmlModal] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Elapsed time counter
  useEffect(() => {
    if (isEditing) {
      setElapsedTime(0);
      intervalRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isEditing]);

  const handleDownload = async () => {
    try {
      const response = await fetch(currentDisplayUrl);
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
      window.open(currentDisplayUrl, '_blank');
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
          imageUrl: currentEditUrl,
          editInstructions: editInstructions.trim(),
          provider,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to edit image');
      }

      const data = await response.json();
      const responseData = Array.isArray(data) ? data[0] : data;
      
      // Get display URL (thumbnailUrl or imageUrl) and edit URL (viewUrl for editing API)
      const newDisplayUrl = responseData.thumbnailUrl || 
                            responseData.imageUrl || 
                            responseData.thumbnailLink || 
                            responseData.webContentLink;
      
      const newEditUrl = responseData.viewUrl || 
                         responseData.webViewLink || 
                         responseData.imageUrl ||
                         (responseData.fileId ? `https://drive.google.com/file/d/${responseData.fileId}/view?usp=drivesdk` : null);
      
      if (newDisplayUrl && newEditUrl) {
        setCurrentDisplayUrl(newDisplayUrl);
        setCurrentEditUrl(newEditUrl);
        setEditInstructions('');
        onImageUpdated?.(newDisplayUrl, newEditUrl);
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
    setCurrentDisplayUrl(displayUrl);
    setCurrentEditUrl(editUrl);
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
              {imageId && onToggleFavorite && (
                <FavoriteHeart
                  imageId={imageId}
                  liked={!!liked}
                  onToggle={onToggleFavorite}
                  className="top-2 right-2 opacity-100"
                />
              )}
              <img
                src={currentDisplayUrl}
                alt="Generated image"
                className="w-full h-auto object-contain rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Textarea
                placeholder="Enter editing instructions (e.g., 'Make the character face forward', 'Zoom in on the subject', 'Change to 1920x1080')"
                value={editInstructions}
                onChange={(e) => setEditInstructions(e.target.value)}
                className="min-h-[80px] resize-none"
                disabled={isEditing}
              />
              {editError && (
                <p className="text-destructive text-sm">{editError}</p>
              )}
              <Button 
                onClick={handleEditImage} 
                disabled={isEditing || !editInstructions.trim()}
                variant="outline"
                className="w-full gap-2 min-w-[180px]"
              >
                {isEditing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="tabular-nums">{elapsedTime}s</span>
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
                disabled={isEditing}
              >
                <FileCode className="w-4 h-4" />
                Convert to HTML
              </Button>
              <Button onClick={handleDownload} className="gap-2 gradient-primary" disabled={isEditing}>
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
        imageUrl={currentEditUrl}
      />
    </>
  );
}
