import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

const SUBJECT_POSITIONS = [
  { label: 'Lower Left', value: 0 },
  { label: 'Upper Left', value: 1 },
  { label: 'Left Aligned', value: 2 },
  { label: 'Centered', value: 3 },
  { label: 'Right Aligned', value: 4 },
  { label: 'Upper Right', value: 5 },
  { label: 'Lower Right', value: 6 },
] as const;

type AlignmentType = 'left' | 'center' | 'right';

interface SubjectPositionSelectorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  aspectRatio?: string;
}

function getAlignmentFromPosition(positionLabel: string): AlignmentType {
  const position = SUBJECT_POSITIONS.find(p => p.label === positionLabel);
  if (!position) return 'center';
  if (position.value < 3) return 'left';
  if (position.value === 3) return 'center';
  return 'right';
}

function getSliderIndexFromLabel(label: string): number {
  const index = SUBJECT_POSITIONS.findIndex(p => p.label === label);
  return index >= 0 ? index : 3; // Default to Centered (index 3)
}

function getDefaultPositionForAlignment(alignment: AlignmentType): string {
  switch (alignment) {
    case 'left':
      return 'Left Aligned';
    case 'center':
      return 'Centered';
    case 'right':
      return 'Right Aligned';
  }
}

// Get visual position for the indicator circle
function getIndicatorPosition(positionLabel: string): { x: number; y: number } {
  switch (positionLabel) {
    case 'Lower Left':
      return { x: 15, y: 75 };
    case 'Upper Left':
      return { x: 15, y: 25 };
    case 'Left Aligned':
      return { x: 15, y: 50 };
    case 'Centered':
      return { x: 50, y: 50 };
    case 'Right Aligned':
      return { x: 85, y: 50 };
    case 'Upper Right':
      return { x: 85, y: 25 };
    case 'Lower Right':
      return { x: 85, y: 75 };
    default:
      return { x: 50, y: 50 };
  }
}

// Parse aspect ratio string to get numeric value
function parseAspectRatio(ratioLabel: string): number {
  const parts = ratioLabel.split(':');
  if (parts.length === 2) {
    const width = parseFloat(parts[0]);
    const height = parseFloat(parts[1]);
    if (!isNaN(width) && !isNaN(height) && height !== 0) {
      return width / height;
    }
  }
  return 16 / 9; // Default
}

export function SubjectPositionSelector({
  label,
  value,
  onChange,
  disabled = false,
  error,
  aspectRatio = '16:9',
}: SubjectPositionSelectorProps) {
  const currentPosition = SUBJECT_POSITIONS.find(p => p.label === value) || SUBJECT_POSITIONS[3];
  const sliderIndex = getSliderIndexFromLabel(value);
  const alignment = getAlignmentFromPosition(value);
  const indicatorPos = getIndicatorPosition(value);

  const handleAlignmentClick = (newAlignment: AlignmentType) => {
    if (disabled) return;
    const newPosition = getDefaultPositionForAlignment(newAlignment);
    onChange(newPosition);
  };

  const handleSliderChange = (values: number[]) => {
    if (disabled) return;
    const index = values[0];
    const position = SUBJECT_POSITIONS[index];
    if (position) {
      onChange(position.label);
    }
  };

  // Calculate visual dimensions for the preview box (max 80px on the larger side)
  const maxSize = 80;
  const ratioValue = parseAspectRatio(aspectRatio);
  let width: number;
  let height: number;

  if (ratioValue >= 1) {
    width = maxSize;
    height = maxSize / ratioValue;
  } else {
    height = maxSize;
    width = maxSize * ratioValue;
  }

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-foreground">{label}</Label>

      <div className="flex items-center gap-6">
        {/* Visual Preview with Position Indicator */}
        <div className="flex items-center justify-center w-24 h-24 flex-shrink-0">
          <div
            className="border-2 border-dashed border-muted-foreground/40 rounded-lg relative overflow-hidden transition-all duration-200"
            style={{ width: `${width}px`, height: `${height}px` }}
          >
            {/* Position Indicator Circle */}
            <div
              className="absolute w-8 h-8 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center transition-all duration-300 ease-out"
              style={{
                left: `${indicatorPos.x}%`,
                top: `${indicatorPos.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <span className="text-[8px] font-bold text-primary whitespace-nowrap">
                {aspectRatio}
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex-1 space-y-4">
          {/* Alignment Toggle */}
          <div className="flex items-center justify-center">
            <div className="inline-flex rounded-full bg-muted p-1">
              {(['left', 'center', 'right'] as AlignmentType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleAlignmentClick(type)}
                  className={cn(
                    'px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200',
                    alignment === type
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
            max={SUBJECT_POSITIONS.length - 1}
            step={1}
            disabled={disabled}
            className="w-full"
          />

          {/* Current Position Label */}
          <div className="text-center">
            <span className="text-xs text-muted-foreground">
              {currentPosition.label}
            </span>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
