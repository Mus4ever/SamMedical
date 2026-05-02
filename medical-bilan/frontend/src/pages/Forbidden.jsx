import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../components/common/Button';

const Forbidden = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-paper">
      <p className="font-serif text-9xl text-ink/10">403</p>
      <h1 className="font-serif text-4xl text-ink mt-2">{t('errors.forbidden.title')}</h1>
      <p className="text-muted mt-3 max-w-sm">{t('errors.forbidden.body')}</p>
      <Button as={Link} to="/" size="lg" className="mt-8">{t('errors.forbidden.cta')}</Button>
    </div>
  );
};

export default Forbidden;
