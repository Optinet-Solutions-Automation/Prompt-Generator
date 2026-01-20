import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

const ASPECT_RATIOS = [
  { label: '1:2', value: 0.5 },
  { label: '6:11', value: 6 / 11 },
  { label: '9:16', value: 9 / 16 },
  { label: '2:3', value: 2 / 3 },
  { label: '3:4', value: 3 / 4 },
  { label: '4:5', value: 4 / 5 },
  { label: '5:6', value: 5 / 6 },
  { label: '1:1', value: 1 },
  { label: '6:5', value: 6 / 5 },
  { label: '5:4', value: 5 / 4 },
  { label: '4:3', value: 4 / 3 },
  { label: '3:2', value: 3 / 2 },
  { label: '16:9', value: 16 / 9 },
  { label: '2:1', value: 2 },
  { label: '21:9', value: 21 / 9 },
] as const;

type OrientationType = 'portrait' | 'square' | 'landscape';

interface AspectRatioSelectorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

function getOrientationFromRatio(ratioLabel: string): OrientationType {
  const ratio = ASPECT_RATIOS.find(r => r.label === ratioLabel);
  if (!ratio) return 'landscape';
  if (ratio.value < 1) return 'portrait';
  if (ratio.value === 1) return 'square';
  return 'landscape';
}

function getSliderIndexFromLabel(label: string): number {
  const index = ASPECT_RATIOS.findIndex(r => r.label === label);
  return index >= 0 ? index : 7; // Default to 1:1 (index 7)
}

function getDefaultRatioForOrientation(orientation: OrientationType): string {
  switch (orientation) {
    case 'portrait':
      return '3:4';
    case 'square':
      return '1:1';
    case 'landscape':
      return '16:9';
  }
}

export function AspectRatioSelector({
  label,
  value,
  onChange,
  disabled = false,
  error,
}: AspectRatioSelectorProps) {
  const currentRatio = ASPECT_RATIOS.find(r => r.label === value) || ASPECT_RATIOS[7];
  const sliderIndex = getSliderIndexFromLabel(value);
  const orientation = getOrientationFromRatio(value);

  const handleOrientationClick = (newOrientation: OrientationType) => {
    if (disabled) return;
    const newRatio = getDefaultRatioForOrientation(newOrientation);
    onChange(newRatio);
  };

  const handleSliderChange = (values: number[]) => {
    if (disabled) return;
    const index = values[0];
    const ratio = ASPECT_RATIOS[index];
    if (ratio) {
      onChange(ratio.label);
    }
  };

  // Calculate visual dimensions (max 80px on the larger side)
  const maxSize = 80;
  let width: number;
  let height: number;

  if (currentRatio.value >= 1) {
    width = maxSize;
    height = maxSize / currentRatio.value;
  } else {
    height = maxSize;
    width = maxSize * currentRatio.value;
  }

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-foreground">{label}</Label>

      <div className="flex items-center gap-6">
        {/* Visual Preview */}
        <div className="flex items-center justify-center w-24 h-24 flex-shrink-0">
          <div
            className="border-2 border-dashed border-muted-foreground/40 rounded-lg flex items-center justify-center transition-all duration-200"
            style={{ width: `${width}px`, height: `${height}px` }}
          >
            <span className="text-xs font-medium text-muted-foreground">
              {currentRatio.label}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex-1 space-y-4">
          {/* Orientation Toggle */}
          <div className="flex items-center justify-center">
            <div className="inline-flex rounded-full bg-muted p-1">
              {(['portrait', 'square', 'landscape'] as OrientationType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleOrientationClick(type)}
                  className={cn(
                    'px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200',
                    orientation === type
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                    disabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Slider */}
          <Slider
            value={[sliderIndex]}
            onValueChange={handleSliderChange}
            min={0}
            max={ASPECT_RATIOS.length - 1}
            step={1}
            disabled={disabled}
            className="w-full"
          />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
