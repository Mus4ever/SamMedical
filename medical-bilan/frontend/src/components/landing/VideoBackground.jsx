import { useEffect, useRef } from 'react';

/**
 * Cinematic looping video background with manual fade-in/fade-out.
 *
 * Implementation per design brief:
 *   - requestAnimationFrame monitors currentTime / duration
 *   - Fades IN over 0.5s at the start (opacity 0 → 1)
 *   - Fades OUT over 0.5s before the end (opacity 1 → 0)
 *   - On `ended`: opacity 0 → wait 100ms → reset currentTime → play again
 *
 * Replace `src` with your own video URL. Suggested free sources:
 *   - Pexels: https://www.pexels.com/videos/ (search "medical", "hospital", "research")
 *   - Coverr: https://coverr.co/ (free, no attribution)
 */
const VideoBackground = ({
  src = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4',
  fadeDuration = 0.5,
}) => {
  const videoRef = useRef(null);
  const rafRef   = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.style.opacity = '0';

    const tick = () => {
      const v = videoRef.current;
      if (!v || v.paused || !v.duration || isNaN(v.duration)) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const t = v.currentTime;
      const d = v.duration;

      let opacity = 1;
      if (t < fadeDuration) {
        // Fade in
        opacity = t / fadeDuration;
      } else if (t > d - fadeDuration) {
        // Fade out
        opacity = Math.max(0, (d - t) / fadeDuration);
      }
      v.style.opacity = String(opacity);

      rafRef.current = requestAnimationFrame(tick);
    };

    const onEnded = () => {
      video.style.opacity = '0';
      setTimeout(() => {
        video.currentTime = 0;
        video.play().catch(() => { /* autoplay block — ignore */ });
      }, 100);
    };

    video.addEventListener('ended', onEnded);
    video.play().catch(() => { /* autoplay block — ignore */ });
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      video.removeEventListener('ended', onEnded);
    };
  }, [fadeDuration]);

  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
      style={{ top: '300px', inset: 'auto 0 0 0', height: 'calc(100vh - 300px)' }}
    >
      <video
        ref={videoRef}
        src={src}
        muted
        playsInline
        autoPlay
        preload="auto"
        className="w-full h-full object-cover"
        style={{ transition: 'opacity 0.05s linear' }}
      />
      {/* Gradient overlays per brief */}
      <div className="absolute inset-0 bg-gradient-to-b from-paper via-transparent to-paper" />
    </div>
  );
};

export default VideoBackground;
