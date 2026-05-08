import { useEffect } from 'react';

/**
 * Sets per-page <title> and meta description without react-helmet.
 * Call once at the top of any page component.
 */
export const useSeo = ({ title, description }) => {
  useEffect(() => {
    if (title) {
      document.title = `${title} — Clinique`;
    }
    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', description);
    }
  }, [title, description]);
};
