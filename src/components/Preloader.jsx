import { useEffect, useState } from 'react';

const DISPLAY_DURATION_MS = 2500;
const EXIT_DURATION_MS = 450;

function Preloader({ onFinish }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, DISPLAY_DURATION_MS);

    const finishTimer = setTimeout(() => {
      onFinish?.();
    }, DISPLAY_DURATION_MS + EXIT_DURATION_MS);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`preloader ${isExiting ? 'preloader--exit' : ''}`}
      aria-hidden="true"
    >
      <div className="preloader__content">
        <img src="/logo.png" alt="Norvin García" className="preloader__logo" />
        <p className="preloader__text">VISITA, CONOCE E INVIERTE EN NICARAGUA</p>
      </div>
    </div>
  );
}

export default Preloader;
