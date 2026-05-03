import { cn } from '../../utils/cn';

/**
 * Variants:
 *   primary    — black bg, white text (CTA)
 *   secondary  — white with black border
 *   mint       — mint bg, ink text (soft accent)
 *   ghost      — transparent, hover bg
 *   glass      — frosted glass with backdrop blur
 *
 * Sizes: sm | md (default) | lg | xl
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
    sm: 'px-4 py-2 text-sm gap-1.5',
    md: 'px-6 py-2.5 text-sm gap-2',
    lg: 'px-8 py-3.5 text-base gap-2',
    xl: 'px-12 py-5 text-base gap-2.5',
  };
  const variants = {
    primary:   'bg-ink text-paper hover:bg-black/85 shadow-soft',
    secondary: 'bg-paper text-ink border border-ink/15 hover:border-ink hover:bg-ink/5',
    mint:      'bg-mint-100 text-mint-700 border border-mint-200 hover:bg-mint-200',
    ghost:     'bg-transparent text-ink hover:bg-ink/5',
    glass:     'glass text-ink hover:bg-white/80 shadow-soft',
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
