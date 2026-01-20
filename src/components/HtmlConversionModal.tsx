import { useState, useEffect, useRef } from 'react';
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
import { Loader2, Download, Eye, FileCode, Clock } from 'lucide-react';

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
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Elapsed time counter
  useEffect(() => {
    if (isConverting) {
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
  }, [isConverting]);

  const handleInputChange = (field: keyof BonusFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const buildEditPrompt = () => {
    return `Do not change the main image or subject.

Same lighting, same environment, same framing.

Only add clean, modern promotional UI text and a call-to-action overlay in the empty dark space on the left side of the image.

Before choosing any colors, analyze the background area where the text and button will be placed and determine the dominant background color and brightness.

Then:

• Choose a CTA button color that complements the dominant background color (harmonious, not clashing, not same tone).

• Choose the text color as the visual counterpart of the button color so that contrast and readability are maximized.

• Ensure WCAG-style high contrast: text must be clearly readable from a distance.

TEXT AND UI TO ADD (exact wording):

Large headline below it:

"${formData.welcomeBonus} FREE SPINS"

Smaller subtext below headline:

"NO DEPOSIT NEEDED"

Bonus line:

"+${formData.bonusPercentage}% Bonus"

Call-to-action button below the text:

Rounded rectangular button with subtle glow and soft shadow, text:

"PLAY NOW"

Below the button in smaller text:

"Bonus Code: ${formData.bonusCode}"

LAYOUT:

• All text aligned vertically on the left third of the image.

• Respect safe margins from edges.

• Headline is dominant and bold.

• Button is clearly clickable and visually separated.

STYLE:

• Modern clean sans-serif typography.

• Minimal, premium, not flashy.

• No neon unless the background is dark enough to support it.

• Subtle glow only if needed for legibility.

CONSTRAINTS:

• Do not cover the subject.

• Do not modify the background scene.

• Do not add any elements besides the text and button.

• Do not crop or zoom.

The final result should look like a professionally designed casino promotional banner with adaptive color harmony and perfect readability.`;
  };

  const handleConvert = async () => {
    setIsConverting(true);
    setError(null);

    try {
      // Step 1: Edit the image with promotional overlay
      const editResponse = await fetch('/api/edit-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl,
          editInstructions: buildEditPrompt(),
          provider: 'gemini',
        }),
      });

      if (!editResponse.ok) {
        const errorText = await editResponse.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || 'Failed to edit image');
        } catch {
          throw new Error('Failed to edit image');
        }
      }

      const editData = await editResponse.json();
      const editedImageUrl = editData.webViewLink || editData.imageUrl || editData.url;

      if (!editedImageUrl) {
        throw new Error('No edited image URL received');
      }

      // Step 2: Convert the edited image to HTML
      const htmlResponse = await fetch('/api/convert-to-html', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: editedImageUrl,
          ...formData,
        }),
      });

      if (!htmlResponse.ok) {
        const errorText = await htmlResponse.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || 'Failed to convert to HTML');
        } catch {
          throw new Error('Failed to convert to HTML');
        }
      }

      // Response is raw HTML
      const htmlContent = await htmlResponse.text();
      setGeneratedHtml(htmlContent);
    } catch (err) {
      console.error('HTML conversion error:', err);
      setError(err instanceof Error ? err.message : 'Failed to convert to HTML');
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (generatedHtml) {
      const blob = new Blob([generatedHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'email-template.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handlePreview = () => {
    if (generatedHtml) {
      const blob = new Blob([generatedHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
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
                <Label htmlFor="welcomeBonus">Welcome Bonus Spins</Label>
                <Input
                  id="welcomeBonus"
                  placeholder="No. of free spins e.g 20"
                  value={formData.welcomeBonus}
                  onChange={(e) => handleInputChange('welcomeBonus', e.target.value)}
                  disabled={isConverting}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amountToUnlock">Amount to Unlock</Label>
                <Input
                  id="amountToUnlock"
                  placeholder="e.g., $100"
                  value={formData.amountToUnlock}
                  onChange={(e) => handleInputChange('amountToUnlock', e.target.value)}
                  disabled={isConverting}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bonusCode">Bonus Code</Label>
                <Input
                  id="bonusCode"
                  placeholder="e.g., WELCOME100"
                  value={formData.bonusCode}
                  onChange={(e) => handleInputChange('bonusCode', e.target.value)}
                  disabled={isConverting}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="extraSpins">No. of Extra Spins</Label>
                <Input
                  id="extraSpins"
                  placeholder="e.g., 50"
                  value={formData.extraSpins}
                  onChange={(e) => handleInputChange('extraSpins', e.target.value)}
                  disabled={isConverting}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bonusPercentage">Bonus Percentage</Label>
                <Input
                  id="bonusPercentage"
                  placeholder="e.g., 100%"
                  value={formData.bonusPercentage}
                  onChange={(e) => handleInputChange('bonusPercentage', e.target.value)}
                  disabled={isConverting}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maximumBonus">Maximum Bonus</Label>
                <Input
                  id="maximumBonus"
                  placeholder="e.g., $500"
                  value={formData.maximumBonus}
                  onChange={(e) => handleInputChange('maximumBonus', e.target.value)}
                  disabled={isConverting}
                />
              </div>
            </div>

            {error && (
              <p className="text-destructive text-sm">{error}</p>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={isConverting}>
                Cancel
              </Button>
              <Button 
                onClick={handleConvert} 
                disabled={isConverting}
                className="gradient-primary gap-2 min-w-[140px]"
              >
                {isConverting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="tabular-nums">{elapsedTime}s</span>
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
              <p className="text-sm text-muted-foreground">
                Completed in {elapsedTime}s • Your HTML file is ready to download or preview.
              </p>
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
