import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * GSAP scroll-triggered reveal.
 * Animates from { opacity: 0, y: 40 } to current state when element enters viewport.
 *
 * Usage:
 *   const ref = useGsapReveal();
 *   <div ref={ref}>...</div>
 */
export const useGsapReveal = ({ y = 40, opacity = 0, duration = 1.0, delay = 0, stagger = 0 } = {}) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const targets = stagger
      ? ref.current.children
      : ref.current;

    const ctx = gsap.context(() => {
      gsap.from(targets, {
        opacity,
        y,
        duration,
        delay,
        stagger: stagger || 0,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    }, ref);

    return () => ctx.revert();
  }, [y, opacity, duration, delay, stagger]);

  return ref;
};

/**
 * Parallax — translates element on scroll.
 *
 * Usage:
 *   const ref = useGsapParallax(60);
 */
export const useGsapParallax = (distance = 80) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.to(ref.current, {
        y: -distance,
        ease: 'none',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });
    return () => ctx.revert();
  }, [distance]);

  return ref;
};

/**
 * Animated count-up when element enters viewport.
 *
 * Usage:
 *   const ref = useCountUp(500, '+');
 *   <span ref={ref}>0</span>
 */
export const useCountUp = (end, suffix = '', { duration = 2, prefix = '' } = {}) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const obj = { val: 0 };
    const target = typeof end === 'number' ? end : parseInt(end, 10) || 0;

    const ctx = gsap.context(() => {
      gsap.to(obj, {
        val: target,
        duration,
        ease: 'power2.out',
        snap: { val: 1 },
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
        onUpdate: () => {
          if (ref.current) {
            const n = Math.round(obj.val);
            const formatted = n >= 1000 ? n.toLocaleString('fr-FR') : n.toString();
            ref.current.textContent = `${prefix}${formatted}${suffix}`;
          }
        },
      });
    });
    return () => ctx.revert();
  }, [end, suffix, duration, prefix]);

  return ref;
};
