import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { arDZ } from 'date-fns/locale';

const localeFor = (lang) => (lang === 'ar' ? arDZ : fr);

export const formatDate = (isoString, lang = 'fr') => {
  if (!isoString) return '';
  try {
    return format(parseISO(isoString), 'dd MMMM yyyy', { locale: localeFor(lang) });
  } catch {
    return isoString;
  }
};

export const formatDateTime = (isoString, lang = 'fr') => {
  if (!isoString) return '';
  try {
    return format(parseISO(isoString), "dd MMM yyyy 'à' HH:mm", { locale: localeFor(lang) });
  } catch {
    return isoString;
  }
};

export const formatRelative = (isoString, lang = 'fr') => {
  if (!isoString) return '';
  try {
    return formatDistanceToNow(parseISO(isoString), { addSuffix: true, locale: localeFor(lang) });
  } catch {
    return isoString;
  }
};
