import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check } from 'lucide-react';
import { ReferenceOption } from '@/types/prompt';

interface ReferenceSelectProps {
  label: string;
  required?: boolean;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  references: ReferenceOption[];
}

export function ReferenceSelect({
  label,
  required,
  error,
  value,
  onChange,
  placeholder,
  disabled,
  references,
}: ReferenceSelectProps) {
  // Group references by category
  const groupedReferences = references.reduce((acc, ref) => {
    if (!acc[ref.category]) {
      acc[ref.category] = [];
    }
    acc[ref.category].push(ref);
    return acc;
  }, {} as Record<string, ReferenceOption[]>);

  // Define category order (Email Templates first as placeholder, then Promotions)
  const categoryOrder = ['Email Templates', 'Casino - Promotions', 'Sports - Promotions'];

  // Get all categories, sorted by order preference
  const categories = Object.keys(groupedReferences).sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a);
    const bIndex = categoryOrder.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          className={`w-full bg-card border-input focus:ring-2 focus:ring-primary/20 transition-all ${
            error ? 'border-destructive' : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {/* Email Templates — coming soon */}
          <SelectGroup>
            <SelectLabel className="text-sm uppercase tracking-wider text-muted-foreground font-semibold">
              Email Templates
            </SelectLabel>
            <div className="px-8 py-2 text-sm text-muted-foreground italic">
              Coming soon...
            </div>
          </SelectGroup>

          {/* Dynamic groups from Airtable, each separated by a divider */}
          {categories.filter(cat => cat !== 'Email Templates').map((category) => (
            <span key={category}>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel className="text-sm uppercase tracking-wider text-muted-foreground font-semibold">
                  {category}
                </SelectLabel>
                {groupedReferences[category].map((ref) => (
                  /*
                   * Using SelectPrimitive.Item directly instead of the shadcn SelectItem wrapper.
                   * This lets us put ONLY the label inside SelectPrimitive.ItemText — which is
                   * the part that appears in the trigger box when an item is selected.
                   * The description is a sibling outside ItemText so it shows in the dropdown
                   * list only, never in the trigger box (fixing the centering issue).
                   */
                  <SelectPrimitive.Item
                    key={ref.id}
                    value={ref.id}
                    className="relative flex w-full cursor-pointer select-none items-start rounded-sm py-2 pl-8 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground"
                  >
                    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center mt-0.5">
                      <SelectPrimitive.ItemIndicator>
                        <Check className="h-4 w-4" />
                      </SelectPrimitive.ItemIndicator>
                    </span>
                    <div className="flex flex-col gap-0.5">
                      {/* Only the label is inside ItemText — this is what shows in the trigger */}
                      <SelectPrimitive.ItemText>
                        <span className="font-medium">{ref.label}</span>
                      </SelectPrimitive.ItemText>
                      {/* Description is outside ItemText — shows in dropdown list only */}
                      {ref.description && (
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {ref.description}
                        </span>
                      )}
                    </div>
                  </SelectPrimitive.Item>
                ))}
              </SelectGroup>
            </span>
          ))}
        </SelectContent>
      </Select>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
