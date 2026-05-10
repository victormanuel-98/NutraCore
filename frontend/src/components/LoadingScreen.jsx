import { useEffect, useState } from 'react';

export function LoadingScreen({ onComplete, minimumMs = 2400 }) {
  const [isLeaving, setIsLeaving] = useState(false);
  const [dotCount, setDotCount] = useState(0);
  const loadingDots = '...'.slice(0, dotCount).padEnd(3, ' ');

  useEffect(() => {
    const revealTimer = window.setTimeout(() => {
      setIsLeaving(true);
    }, minimumMs);

    const completeTimer = window.setTimeout(() => {
      onComplete?.();
    }, minimumMs + 420);

    return () => {
      window.clearTimeout(revealTimer);
      window.clearTimeout(completeTimer);
    };
  }, [minimumMs, onComplete]);

  useEffect(() => {
    const dotsTimer = window.setInterval(() => {
      setDotCount((prev) => (prev + 1) % 4);
    }, 260);

    return () => {
      window.clearInterval(dotsTimer);
    };
  }, []);

  return (
    <div className={`loading-screen ${isLeaving ? 'loading-screen-leave' : ''}`} aria-live="polite" aria-busy="true">
      <div className="loading-logo-wrap">
        <div className="hexa-n" aria-label="NutraCore">
          <svg viewBox="0 0 260 220" role="img" className="hexa-n-svg" aria-hidden="true">
            <polygon fill="#ff0a60" points="92,24 168,24 206,90 168,156 92,156 54,90" />

            <g fill="#ffffff" transform="translate(90,79)">
              <path d="M0,4 C0,1 4,0 10,0 H24 C30,0 33,2 33,6 V28 H21 V6 H14 V28 H0 Z" />
              <path d="M38,0 H50 V22 H56 V0 H68 V25 C68,29 63,30 57,30 H45 C40,30 38,29 38,27 Z" />
              <path d="M72,0 H86 L83,18 H75 Z" />
              <rect x="75" y="21" width="8" height="8" />
            </g>
          </svg>
        </div>
        <p className="loading-typewriter loading-word-animate loading-status-text">
          <span className="loading-status-label">Cargando</span>
          <span className="loading-ellipsis" aria-hidden="true">
            {loadingDots}
          </span>
        </p>
      </div>
    </div>
  );
}
