import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/cn';

const Logo = ({ className, dark = false, to = '/' }) => {
  const { t } = useTranslation();
  return (
    <Link to={to} className={cn('inline-flex items-center gap-2.5 select-none group', className)}>
      <span className="relative flex items-center justify-center w-8 h-8">
        <span className="absolute inset-0 rounded-full bg-mint-300 animate-pulse-soft" />
        <span className="relative w-3.5 h-3.5 rounded-full bg-mint-600 group-hover:scale-110 transition-transform" />
      </span>
      <span className={cn('display text-2xl tracking-tight', dark ? 'text-paper' : 'text-ink')}>
        {t('brand.name')}<sup className="text-[0.45em] ml-0.5">®</sup>
      </span>
    </Link>
  );
};

export default Logo;
