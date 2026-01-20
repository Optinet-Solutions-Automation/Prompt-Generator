import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

// Aspect Ratio Constants
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

// Subject Position Constants
const SUBJECT_POSITIONS = [
  { label: 'Lower Left', value: 0 },
  { label: 'Upper Left', value: 1 },
  { label: 'Left Aligned', value: 2 },
  { label: 'Centered', value: 3 },
  { label: 'Right Aligned', value: 4 },
  { label: 'Upper Right', value: 5 },
  { label: 'Lower Right', value: 6 },
] as const;

type OrientationType = 'portrait' | 'square' | 'landscape';
type AlignmentType = 'left' | 'center' | 'right';

interface PositionAndRatioSelectorProps {
  aspectRatio: string;
  subjectPosition: string;
  onAspectRatioChange: (value: string) => void;
  onSubjectPositionChange: (value: string) => void;
  disabled?: boolean;
}

// Aspect Ratio helpers
function getOrientationFromRatio(ratioLabel: string): OrientationType {
  const ratio = ASPECT_RATIOS.find(r => r.label === ratioLabel);
  if (!ratio) return 'landscape';
  if (ratio.value < 1) return 'portrait';
  if (ratio.value === 1) return 'square';
  return 'landscape';
}

function getAspectRatioSliderIndex(label: string): number {
  const index = ASPECT_RATIOS.findIndex(r => r.label === label);
  return index >= 0 ? index : 12; // Default to 16:9 (index 12)
}

function getDefaultRatioForOrientation(orientation: OrientationType): string {
  switch (orientation) {
    case 'portrait': return '3:4';
    case 'square': return '1:1';
    case 'landscape': return '16:9';
  }
}

// Subject Position helpers
function getAlignmentFromPosition(positionLabel: string): AlignmentType {
  const position = SUBJECT_POSITIONS.find(p => p.label === positionLabel);
  if (!position) return 'center';
  if (position.value < 3) return 'left';
  if (position.value === 3) return 'center';
  return 'right';
}

function getPositionSliderIndex(label: string): number {
  const index = SUBJECT_POSITIONS.findIndex(p => p.label === label);
  return index >= 0 ? index : 3; // Default to Centered (index 3)
}

function getDefaultPositionForAlignment(alignment: AlignmentType): string {
  switch (alignment) {
    case 'left': return 'Left Aligned';
    case 'center': return 'Centered';
    case 'right': return 'Right Aligned';
  }
}

// Get visual position for the indicator circle
function getIndicatorPosition(positionLabel: string): { x: number; y: number } {
  switch (positionLabel) {
    case 'Lower Left': return { x: 20, y: 75 };
    case 'Upper Left': return { x: 20, y: 25 };
    case 'Left Aligned': return { x: 20, y: 50 };
    case 'Centered': return { x: 50, y: 50 };
    case 'Right Aligned': return { x: 80, y: 50 };
    case 'Upper Right': return { x: 80, y: 25 };
    case 'Lower Right': return { x: 80, y: 75 };
    default: return { x: 50, y: 50 };
  }
}

// Parse aspect ratio string to get numeric value
function parseAspectRatio(ratioLabel: string): number {
  const ratio = ASPECT_RATIOS.find(r => r.label === ratioLabel);
  if (ratio) return ratio.value;
  
  const parts = ratioLabel.split(':');
  if (parts.length === 2) {
    const width = parseFloat(parts[0]);
    const height = parseFloat(parts[1]);
    if (!isNaN(width) && !isNaN(height) && height !== 0) {
      return width / height;
    }
  }
  return 16 / 9;
}

export function PositionAndRatioSelector({
  aspectRatio,
  subjectPosition,
  onAspectRatioChange,
  onSubjectPositionChange,
  disabled = false,
}: PositionAndRatioSelectorProps) {
  // Aspect Ratio state
  const aspectRatioIndex = getAspectRatioSliderIndex(aspectRatio);
  const orientation = getOrientationFromRatio(aspectRatio);
  
  // Subject Position state
  const positionIndex = getPositionSliderIndex(subjectPosition);
  const alignment = getAlignmentFromPosition(subjectPosition);
  const indicatorPos = getIndicatorPosition(subjectPosition);
  const currentPosition = SUBJECT_POSITIONS.find(p => p.label === subjectPosition) || SUBJECT_POSITIONS[3];

  // Calculate visual dimensions (max 120px on the larger side)
  const maxSize = 120;
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

  // Handlers
  const handleOrientationClick = (newOrientation: OrientationType) => {
    if (disabled) return;
    onAspectRatioChange(getDefaultRatioForOrientation(newOrientation));
  };

  const handleAspectRatioSliderChange = (values: number[]) => {
    if (disabled) return;
    const ratio = ASPECT_RATIOS[values[0]];
    if (ratio) onAspectRatioChange(ratio.label);
  };

  const handleAlignmentClick = (newAlignment: AlignmentType) => {
    if (disabled) return;
    onSubjectPositionChange(getDefaultPositionForAlignment(newAlignment));
  };

  const handlePositionSliderChange = (values: number[]) => {
    if (disabled) return;
    const position = SUBJECT_POSITIONS[values[0]];
    if (position) onSubjectPositionChange(position.label);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-6">
        {/* Combined Visual Preview */}
        <div className="flex items-center justify-center w-32 h-32 flex-shrink-0">
          <div
            className="border-2 border-dashed border-muted-foreground/40 rounded-lg relative overflow-hidden transition-all duration-300 ease-out bg-muted/20"
            style={{ width: `${width}px`, height: `${height}px` }}
          >
            {/* Position Indicator Circle */}
            <div
              className="absolute w-9 h-9 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center transition-all duration-300 ease-out shadow-sm"
              style={{
                left: `${indicatorPos.x}%`,
                top: `${indicatorPos.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <span className="text-[9px] font-bold text-primary whitespace-nowrap">
                {aspectRatio}
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex-1 space-y-5">
          {/* Subject Position Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">Subject Position</Label>
            
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

            {/* Position Slider */}
            <Slider
              value={[positionIndex]}
              onValueChange={handlePositionSliderChange}
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

          {/* Aspect Ratio Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">Aspect Ratio</Label>
            
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

            {/* Aspect Ratio Slider */}
            <Slider
              value={[aspectRatioIndex]}
              onValueChange={handleAspectRatioSliderChange}
              min={0}
              max={ASPECT_RATIOS.length - 1}
              step={1}
              disabled={disabled}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
