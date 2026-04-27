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
          <svg viewBox="0 0 120 120" role="img" className="hexa-n-svg" aria-hidden="true">
            <polygon className="hexa-solid" points="60,6 103,30 103,90 60,114 17,90 17,30" />
            <text className="hexa-label" x="60" y="67" textAnchor="middle">
              NU!
            </text>
          </svg>
          <svg viewBox="0 0 120 120" role="img" className="hexa-n-svg hexa-glitch hexa-glitch-a" aria-hidden="true">
            <polygon className="hexa-solid" points="60,6 103,30 103,90 60,114 17,90 17,30" />
            <text className="hexa-label" x="60" y="67" textAnchor="middle">
              NU!
            </text>
          </svg>
          <svg viewBox="0 0 120 120" role="img" className="hexa-n-svg hexa-glitch hexa-glitch-b" aria-hidden="true">
            <polygon className="hexa-solid" points="60,6 103,30 103,90 60,114 17,90 17,30" />
            <text className="hexa-label" x="60" y="67" textAnchor="middle">
              NU!
            </text>
          </svg>
        </div>
        <p className="loading-typewriter">
          Cargando
          <span className="loading-ellipsis" aria-hidden="true">
            {loadingDots}
          </span>
        </p>
      </div>
    </div>
  );
}
