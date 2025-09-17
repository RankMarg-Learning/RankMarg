"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface BaseFieldProps {
  label?: string;
  required?: boolean;
  error?: string;
  className?: string;
  id?: string;
}

interface TextFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'password';
}

interface NumberFieldProps extends BaseFieldProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

interface TextareaFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

interface SelectFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  options: Array<{ value: string; label: string }>;
}

interface SwitchFieldProps extends BaseFieldProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}

// Simple field wrapper
const FieldWrapper: React.FC<{ 
  children: React.ReactNode; 
  label?: string; 
  required?: boolean; 
  error?: string; 
  className?: string;
  id?: string;
}> = ({ children, label, required, error, className, id }) => (
  <div className={cn("space-y-2", className)}>
    {label && (
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
    )}
    {children}
    {error && (
      <p className="text-red-500 text-xs">{error}</p>
    )}
  </div>
);

// Text field component
export const TextField: React.FC<TextFieldProps> = ({ 
  value, 
  onChange, 
  label, 
  required, 
  error, 
  placeholder, 
  type = 'text', 
  className,
  id,
  ...props 
}) => (
  <FieldWrapper label={label} required={required} error={error} className={className} id={id}>
    <Input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={error ? "border-red-500" : ""}
      {...props}
    />
  </FieldWrapper>
);

// Number field component
export const NumberField: React.FC<NumberFieldProps> = ({ 
  value, 
  onChange, 
  label, 
  required, 
  error, 
  placeholder, 
  min, 
  max, 
  step, 
  className,
  id,
  ...props 
}) => (
  <FieldWrapper label={label} required={required} error={error} className={className} id={id}>
    <Input
      id={id}
      type="number"
      value={value || ''}
      onChange={(e) => onChange(Number(e.target.value) || 0)}
      placeholder={placeholder}
      min={min}
      max={max}
      step={step}
      className={error ? "border-red-500" : ""}
      {...props}
    />
  </FieldWrapper>
);

// Textarea field component
export const TextareaField: React.FC<TextareaFieldProps> = ({ 
  value, 
  onChange, 
  label, 
  required, 
  error, 
  placeholder, 
  rows = 3, 
  className,
  id,
  ...props 
}) => (
  <FieldWrapper label={label} required={required} error={error} className={className} id={id}>
    <Textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={error ? "border-red-500" : ""}
      {...props}
    />
  </FieldWrapper>
);

// Select field component
export const SelectField: React.FC<SelectFieldProps> = ({ 
  value, 
  onChange, 
  label, 
  required, 
  error, 
  placeholder, 
  options, 
  className,
  id,
  ...props 
}) => (
  <FieldWrapper label={label} required={required} error={error} className={className} id={id}>
    <Select value={value} onValueChange={onChange} {...props}>
      <SelectTrigger id={id} className={error ? "border-red-500" : ""}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </FieldWrapper>
);

// Switch field component
export const SwitchField: React.FC<SwitchFieldProps> = ({ 
  checked, 
  onChange, 
  label, 
  required, 
  error, 
  description, 
  className,
  id,
  ...props 
}) => (
  <FieldWrapper label={label} required={required} error={error} className={className} id={id}>
    <div className="flex items-center space-x-2">
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        {...props}
      />
      {description && (
        <span className="text-sm text-gray-500">{description}</span>
      )}
    </div>
  </FieldWrapper>
);

// Form section wrapper
export const FormSection: React.FC<{
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, description, children, className }) => (
  <div className={cn("space-y-4", className)}>
    {(title || description) && (
      <div className="space-y-1">
        {title && <h3 className="text-lg font-medium">{title}</h3>}
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
    )}
    {children}
  </div>
);

// Grid layout helpers
export const FormGrid: React.FC<{
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: 2 | 3 | 4 | 6;
  className?: string;
}> = ({ children, cols = 2, gap = 4, className }) => (
  <div className={cn(
    "grid",
    cols === 1 && "grid-cols-1",
    cols === 2 && "grid-cols-2",
    cols === 3 && "grid-cols-3",
    cols === 4 && "grid-cols-4",
    gap === 2 && "gap-2",
    gap === 3 && "gap-3",
    gap === 4 && "gap-4",
    gap === 6 && "gap-6",
    className
  )}>
    {children}
  </div>
);
