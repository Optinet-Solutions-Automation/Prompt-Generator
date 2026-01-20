import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IMAGE_SIZES } from '@/types/prompt';

interface ImageSizeSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

export function ImageSizeSelect({
  label,
  value,
  onChange,
  placeholder = 'Select size',
  disabled = false,
  error,
}: ImageSizeSelectProps) {
  const geminiSizes = IMAGE_SIZES.filter(s => s.provider === 'Gemini');
  const gptSizes = IMAGE_SIZES.filter(s => s.provider === 'GPT');

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground">
        {label}
      </Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className={error ? 'border-destructive' : ''}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel className="text-xs font-semibold text-muted-foreground px-2 py-1.5">
              Gemini
            </SelectLabel>
            {geminiSizes.map((size) => (
              <SelectItem key={size.value} value={size.value}>
                {size.label}
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectGroup>
            <SelectLabel className="text-xs font-semibold text-muted-foreground px-2 py-1.5">
              GPT
            </SelectLabel>
            {gptSizes.map((size) => (
              <SelectItem key={size.value} value={size.value}>
                {size.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
