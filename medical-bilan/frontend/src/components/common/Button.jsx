import { cn } from '../../utils/cn';

/**
 * Primary CTA button — black pill with white text.
 * Matches the "Begin Journey" pattern from the design brief.
 *
 * Variants:
 *   - primary  (default): black bg, white text
 *   - secondary: white bg, black border, black text
 *   - ghost: transparent, hover bg-black/5
 *
 * Sizes:
 *   - sm | md (default) | lg | xl
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className,
  as: Component = 'button',
  ...rest
}) => {
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-10 py-3.5 text-base',
    xl: 'px-14 py-5 text-base',
  };
  const variants = {
    primary:   'bg-ink text-paper hover:bg-black/90',
    secondary: 'bg-paper text-ink border border-ink hover:bg-ink hover:text-paper',
    ghost:     'bg-transparent text-ink hover:bg-black/5',
  };
  return (
    <Component
      className={cn(
        'inline-flex items-center justify-center rounded-full font-medium',
        'transition-all duration-200 hover:scale-[1.03] active:scale-100',
        'disabled:opacity-50 disabled:pointer-events-none',
        sizes[size],
        variants[variant],
        className
      )}
      {...rest}
    >
      {children}
    </Component>
  );
};

export default Button;
