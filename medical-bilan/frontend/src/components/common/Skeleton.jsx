import { cn } from '../../utils/cn';

/**
 * Shimmer skeleton placeholder.
 * Pre-baked variants: line, circle, card, rect.
 */
const Skeleton = ({ className, variant = 'rect', ...rest }) => {
  const variants = {
    rect:   'rounded-xl',
    line:   'rounded-full h-3',
    circle: 'rounded-full',
    card:   'rounded-2xl',
  };
  return (
    <div
      className={cn(
        'bg-gradient-to-r from-ink/5 via-ink/10 to-ink/5 bg-[length:400%_100%] animate-[shimmer_1.6s_ease_infinite]',
        variants[variant],
        className
      )}
      {...rest}
    />
  );
};

export default Skeleton;
