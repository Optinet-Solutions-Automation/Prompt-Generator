import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface SavePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, prompt: string) => void;
  initialPrompt: string;
}

export function SavePromptModal({ isOpen, onClose, onSave, initialPrompt }: SavePromptModalProps) {
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState(initialPrompt);

  useEffect(() => {
    if (isOpen) {
      setPrompt(initialPrompt);
      setTitle('');
    }
  }, [isOpen, initialPrompt]);

  const handleSave = () => {
    if (title.trim() && prompt.trim()) {
      onSave(title, prompt);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Save Prompt</DialogTitle>
          <DialogDescription>
            Give your prompt a title to save it to your library.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title" className="text-left font-medium">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Summer Campaign V1"
              autoFocus
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="prompt" className="text-left font-medium">
              Prompt Content
            </Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[150px] font-mono text-xs leading-relaxed"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim() || !prompt.trim()} className="gradient-primary">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
