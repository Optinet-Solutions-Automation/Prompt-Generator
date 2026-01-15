import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Save, X } from 'lucide-react';

interface SavePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onDontSave: () => void;
}

export function SavePromptModal({ isOpen, onClose, onSave, onDontSave }: SavePromptModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        <DialogHeader className="pt-2">
          <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <Save className="w-7 h-7 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl font-semibold">Save this prompt?</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Save this generated prompt to your collection for future reference.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center gap-3 pt-4">
          <Button variant="outline" onClick={onDontSave} className="min-w-28">
            Don't Save
          </Button>
          <Button onClick={onSave} className="gradient-primary min-w-28 text-primary-foreground">
            Save Prompt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
