import { cn } from '../../utils/cn';

const LoadingSpinner = ({ size = 'md', className }) => {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-2', lg: 'w-12 h-12 border-[3px]' };
  return (
    <div
      className={cn(
        'rounded-full border-ink/20 border-t-ink animate-spin',
        sizes[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
};

export default LoadingSpinner;
