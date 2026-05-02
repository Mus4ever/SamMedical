/**
 * Merge classNames, ignoring falsy values.
 * Lighter alternative to clsx/classnames.
 */
export const cn = (...args) => args.filter(Boolean).join(' ');
