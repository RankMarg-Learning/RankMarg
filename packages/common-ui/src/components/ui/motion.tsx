import React from 'react';
import { cn } from '../../lib/utils';

// Animation variants
export type AnimationVariant = 'fade-in' | 'slide-in-up' | 'scale-in' | 'slide-in-right' | 'slide-out-left' | 'fade-out';

interface MotionProps {
  children: React.ReactNode;
  className?: string;
  animation?: AnimationVariant;
  delay?: number;
  duration?: number;
  once?: boolean;
  style?: React.CSSProperties;
  as?: React.ElementType;
}

export const Motion: React.FC<MotionProps> = ({
  children,
  className,
  animation = 'fade-in',
  delay = 0,
  duration = 250, // Reduced from 400ms to 250ms for faster animations
  once = false,
  style = {},
  as: Component = 'div',
  ...props
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (once) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (ref.current) observer.unobserve(ref.current);
          }
        },
        {
          rootMargin: "0px",
          threshold: 0.1,
        }
      );
      
      if (ref.current) {
        observer.observe(ref.current);
      }
      
      return () => {
        if (ref.current) observer.unobserve(ref.current);
      };
    } else {
      // Set visible immediately for faster rendering
      setIsVisible(true);
    }
  }, [once]);

  const animationClass = once ? (isVisible ? `animate-${animation}` : 'opacity-0') : `animate-${animation}`;

  const motionStyles: React.CSSProperties = {
    animationDelay: `${delay}ms`,
    animationDuration: `${duration}ms`,
    ...style,
  };

  return (
    <Component
      ref={ref}
      className={cn(animationClass, className)}
      style={motionStyles}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Motion;