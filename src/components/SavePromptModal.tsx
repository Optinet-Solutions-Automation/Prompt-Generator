import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Save } from 'lucide-react';

interface SavePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onDontSave: () => void;
}

export function SavePromptModal({ isOpen, onClose, onSave, onDontSave }: SavePromptModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Save className="w-6 h-6 text-primary" />
          </div>
          <AlertDialogTitle className="text-center">Save this prompt?</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Would you like to save this generated prompt to your collection for future reference?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center gap-3">
          <AlertDialogCancel onClick={onDontSave} className="sm:min-w-24">
            Don't Save
          </AlertDialogCancel>
          <AlertDialogAction onClick={onSave} className="gradient-primary sm:min-w-24">
            Save Prompt
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
