import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ProcessingStateProps {
  elapsedTime: number;
}

export function ProcessingState({ elapsedTime }: ProcessingStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col items-center justify-center py-20"
    >
      <div className="relative">
        {/* Outer glow ring */}
        <motion.div
          className="absolute inset-0 rounded-full gradient-primary opacity-20 blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ width: 120, height: 120, margin: -20 }}
        />
        
        {/* Spinner container */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-primary/20"
          />
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </div>

      <motion.h2
        className="mt-8 text-xl font-semibold text-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Processing your request...
      </motion.h2>

      <motion.div
        className="mt-4 px-6 py-3 rounded-full gradient-processing"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <span className="text-2xl font-bold text-primary tabular-nums">
          {elapsedTime}s
        </span>
      </motion.div>

      <motion.p
        className="mt-4 text-sm text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Crafting the perfect prompt for you...
      </motion.p>
    </motion.div>
  );
}
