import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../components/common/Button';

const NotFound = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-paper">
      <p className="font-serif text-9xl text-ink/10">404</p>
      <h1 className="font-serif text-4xl text-ink mt-2">{t('errors.notFound.title')}</h1>
      <p className="text-muted mt-3 max-w-sm">{t('errors.notFound.body')}</p>
      <Button as={Link} to="/" size="lg" className="mt-8">{t('errors.notFound.cta')}</Button>
    </div>
  );
};

export default NotFound;
