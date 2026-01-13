import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Download, Eye, FileCode } from 'lucide-react';

interface HtmlConversionModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
}

interface BonusFormData {
  welcomeBonus: string;
  amountToUnlock: string;
  bonusCode: string;
  extraSpins: string;
  bonusPercentage: string;
  maximumBonus: string;
}

export function HtmlConversionModal({ isOpen, onClose, imageUrl }: HtmlConversionModalProps) {
  const [formData, setFormData] = useState<BonusFormData>({
    welcomeBonus: '',
    amountToUnlock: '',
    bonusCode: '',
    extraSpins: '',
    bonusPercentage: '',
    maximumBonus: '',
  });
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedHtml, setGeneratedHtml] = useState<{ url: string; previewUrl: string } | null>(null);

  const handleInputChange = (field: keyof BonusFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleConvert = async () => {
    setIsConverting(true);
    setError(null);

    try {
      const response = await fetch('/api/convert-to-html', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl,
          ...formData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to convert to HTML');
      }

      const data = await response.json();
      
      // Handle Google Drive response format
      const htmlUrl = data.webContentLink || 
                      data.downloadUrl || 
                      (Array.isArray(data) && data[0]?.webContentLink);
      const previewUrl = data.webViewLink || 
                         data.previewUrl || 
                         (Array.isArray(data) && data[0]?.webViewLink);

      if (htmlUrl) {
        setGeneratedHtml({ url: htmlUrl, previewUrl: previewUrl || htmlUrl });
      } else {
        throw new Error('No HTML URL returned');
      }
    } catch (err) {
      console.error('HTML conversion error:', err);
      setError(err instanceof Error ? err.message : 'Failed to convert to HTML');
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (generatedHtml?.url) {
      window.open(generatedHtml.url, '_blank');
    }
  };

  const handlePreview = () => {
    if (generatedHtml?.previewUrl) {
      window.open(generatedHtml.previewUrl, '_blank');
    }
  };

  const handleClose = () => {
    setFormData({
      welcomeBonus: '',
      amountToUnlock: '',
      bonusCode: '',
      extraSpins: '',
      bonusPercentage: '',
      maximumBonus: '',
    });
    setGeneratedHtml(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCode className="w-5 h-5" />
            Convert to HTML
          </DialogTitle>
        </DialogHeader>
        
        {!generatedHtml ? (
          <>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="welcomeBonus">Welcome Bonus</Label>
                <Input
                  id="welcomeBonus"
                  placeholder="e.g., 100% Match Bonus"
                  value={formData.welcomeBonus}
                  onChange={(e) => handleInputChange('welcomeBonus', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amountToUnlock">Amount to Unlock</Label>
                <Input
                  id="amountToUnlock"
                  placeholder="e.g., $100"
                  value={formData.amountToUnlock}
                  onChange={(e) => handleInputChange('amountToUnlock', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bonusCode">Bonus Code</Label>
                <Input
                  id="bonusCode"
                  placeholder="e.g., WELCOME100"
                  value={formData.bonusCode}
                  onChange={(e) => handleInputChange('bonusCode', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="extraSpins">No. of Extra Spins</Label>
                <Input
                  id="extraSpins"
                  placeholder="e.g., 50"
                  value={formData.extraSpins}
                  onChange={(e) => handleInputChange('extraSpins', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bonusPercentage">Bonus Percentage</Label>
                <Input
                  id="bonusPercentage"
                  placeholder="e.g., 100%"
                  value={formData.bonusPercentage}
                  onChange={(e) => handleInputChange('bonusPercentage', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maximumBonus">Maximum Bonus</Label>
                <Input
                  id="maximumBonus"
                  placeholder="e.g., $500"
                  value={formData.maximumBonus}
                  onChange={(e) => handleInputChange('maximumBonus', e.target.value)}
                />
              </div>
            </div>

            {error && (
              <p className="text-destructive text-sm">{error}</p>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleConvert} 
                disabled={isConverting}
                className="gradient-primary gap-2"
              >
                {isConverting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <FileCode className="w-4 h-4" />
                    Convert
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="py-6 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <FileCode className="w-8 h-8 text-primary" />
              </div>
              <p className="text-foreground font-medium mb-2">HTML Generated Successfully!</p>
              <p className="text-sm text-muted-foreground">Your HTML file is ready to download or preview.</p>
            </div>

            <DialogFooter className="flex gap-2 sm:gap-2">
              <Button variant="outline" onClick={handlePreview} className="gap-2">
                <Eye className="w-4 h-4" />
                Preview
              </Button>
              <Button onClick={handleDownload} className="gradient-primary gap-2">
                <Download className="w-4 h-4" />
                Download HTML
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
