import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  provider: 'chatgpt' | 'gemini';
}

export function ImageModal({ isOpen, onClose, imageUrl, provider }: ImageModalProps) {
  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
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
      window.open(imageUrl, '_blank');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Generated Image ({provider === 'chatgpt' ? 'ChatGPT' : 'Gemini'})</span>
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="relative w-full overflow-auto max-h-[60vh] rounded-lg bg-muted/50">
            <img
              src={imageUrl}
              alt="Generated image"
              className="w-full h-auto object-contain rounded-lg"
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleDownload} className="gap-2 gradient-primary">
              <Download className="w-4 h-4" />
              Download Image
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
