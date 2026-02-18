import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { motion } from 'framer-motion';
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
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
          {/* flex-1 min-w-0 ensures the text truncates and leaves room for the chevron icon */}
          <SelectValue placeholder={placeholder} className="flex-1 min-w-0 truncate" />
        </SelectTrigger>
        <SelectContent>
          {/* Email Templates — coming soon */}
          <SelectGroup>
            <SelectLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Email Templates
            </SelectLabel>
            <div className="px-8 py-2 text-sm text-muted-foreground italic">
              Coming soon...
            </div>
          </SelectGroup>

          {/* Dynamic groups from Airtable, each separated by a divider */}
          {categories.filter(cat => cat !== 'Email Templates').map((category, index) => (
            <span key={category}>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  {category}
                </SelectLabel>
                {groupedReferences[category].map((ref) => (
                  <SelectItem key={ref.id} value={ref.id} className="cursor-pointer">
                    {ref.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </span>
          ))}
        </SelectContent>
      </Select>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-destructive"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}