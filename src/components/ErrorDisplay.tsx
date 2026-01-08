import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft } from 'lucide-react';

interface ErrorDisplayProps {
  message: string;
  onGoBack: () => void;
}

export function ErrorDisplay({ message, onGoBack }: ErrorDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col items-center justify-center py-16"
    >
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
        <AlertCircle className="w-8 h-8 text-destructive" />
      </div>

      <h2 className="text-xl font-semibold text-foreground mb-2">
        Something went wrong
      </h2>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        {message}
      </p>

      <Button onClick={onGoBack} variant="outline" className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Go Back
      </Button>
    </motion.div>
  );
}
