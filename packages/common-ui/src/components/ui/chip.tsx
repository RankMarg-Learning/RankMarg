import React from 'react';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  removable?: boolean;
  onRemove?: () => void;
  icon?: React.ReactNode;
}

export const Chip: React.FC<ChipProps> = ({
  children,
  className,
  variant = 'default',
  size = 'md',
  removable = false,
  onRemove,
  icon,
  ...props
}) => {
  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove?.();
  };

  const variants = {
    default: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary/50 text-secondary-foreground hover:bg-secondary/80'
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5 rounded-full',
    md: 'text-sm px-3 py-1 rounded-full',
    lg: 'text-base px-4 py-1.5 rounded-full'
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 font-medium transition-colors',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
      {removable && (
        <button
          type="button"
          onClick={handleRemoveClick}
          className={cn(
            'ml-1 flex-shrink-0 rounded-full p-0.5',
            'hover:bg-background/20 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
            'transition-colors'
          )}
          aria-label="Remove"
        >
          <X className={cn(
            size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-3.5 w-3.5' : 'h-4 w-4'
          )} />
        </button>
      )}
    </div>
  );
};

export const ChipSelect = ({
  options,
  value,
  onChange,
  className,
  chipProps,
}: {
  options: { value: string | number; label: string; icon?: React.ReactNode }[];
  value: string | number | null;
  onChange: (value: string | number) => void;
  className?: string;
  chipProps?: Partial<ChipProps>;
}) => {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((option) => (
        <Chip
          key={option.value}
          variant={value === option.value ? "primary" : "outline"}
          size="md"
          icon={option.icon}
          className={cn(
            "cursor-pointer transition-all",
            value === option.value
              ? "ring-2 ring-primary/20 shadow-sm"
              : "hover:bg-secondary/50"
          )}
          onClick={() => onChange(option.value)}
          {...chipProps}
        >
          {option.label}
        </Chip>
      ))}
    </div>
  );
};

export default Chip;