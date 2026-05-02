import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/cn';

/**
 * Editorial-style logo with registered trademark superscript.
 * Matches the "Aethera®" pattern from the design brief.
 */
const Logo = ({ className, dark = false, to = '/' }) => {
  const { t } = useTranslation();
  return (
    <Link
      to={to}
      className={cn(
        'font-serif text-3xl tracking-tight select-none',
        dark ? 'text-paper' : 'text-ink',
        className
      )}
    >
      {t('brand.name')}<sup className="text-xs ml-0.5 align-super">®</sup>
    </Link>
  );
};

export default Logo;
