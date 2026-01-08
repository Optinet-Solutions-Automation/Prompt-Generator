import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { motion } from 'framer-motion';

interface BaseFieldProps {
  label: string;
  required?: boolean;
  error?: string;
}

interface SelectFieldProps extends BaseFieldProps {
  type: 'select';
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

interface TextInputProps extends BaseFieldProps {
  type: 'text';
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  maxLength?: number;
}

interface TextareaFieldProps extends BaseFieldProps {
  type: 'textarea';
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  maxLength?: number;
  rows?: number;
}

type FormFieldProps = SelectFieldProps | TextInputProps | TextareaFieldProps;

export function FormField(props: FormFieldProps) {
  const { label, required, error } = props;

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

      {props.type === 'select' && (
        <Select value={props.value} onValueChange={props.onChange}>
          <SelectTrigger
            className={`w-full bg-card border-input focus:ring-2 focus:ring-primary/20 transition-all ${
              error ? 'border-destructive' : ''
            }`}
          >
            <SelectValue placeholder={props.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {props.options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {props.type === 'text' && (
        <Input
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          placeholder={props.placeholder}
          maxLength={props.maxLength}
          className={`bg-card border-input focus:ring-2 focus:ring-primary/20 transition-all ${
            error ? 'border-destructive' : ''
          }`}
        />
      )}

      {props.type === 'textarea' && (
        <div className="relative">
          <Textarea
            value={props.value}
            onChange={(e) => props.onChange(e.target.value)}
            placeholder={props.placeholder}
            maxLength={props.maxLength}
            rows={props.rows || 4}
            className={`bg-card border-input focus:ring-2 focus:ring-primary/20 transition-all resize-none ${
              error ? 'border-destructive' : ''
            }`}
          />
          {props.maxLength && (
            <span className="absolute bottom-2 right-3 text-xs text-muted-foreground">
              {props.value.length}/{props.maxLength}
            </span>
          )}
        </div>
      )}

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
