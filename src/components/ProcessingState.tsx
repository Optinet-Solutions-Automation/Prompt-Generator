import { Loader2 } from 'lucide-react';

interface ProcessingStateProps {
  elapsedTime: number;
}

export function ProcessingState({ elapsedTime }: ProcessingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative">
        <div className="relative w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </div>

      <h2 className="mt-8 text-xl font-semibold text-foreground">
        Processing your request...
      </h2>

      <div className="mt-4 px-6 py-3 rounded-full gradient-processing">
        <span className="text-2xl font-bold text-primary tabular-nums">
          {elapsedTime}s
        </span>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        Crafting the perfect prompt for you...
      </p>
    </div>
  );
}
