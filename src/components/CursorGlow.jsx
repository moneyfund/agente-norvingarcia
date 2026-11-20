import { useEffect, useRef } from 'react';

export default function CursorGlow() {
  const glow = useRef(null);
  useEffect(() => {
    const el = glow.current;
    if (!el) return;
    const media = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    let frame = 0, x = -200, y = -200;
    const paint = () => {
      frame = 0;
      el.style.transform = `translate3d(${x}px,${y}px,0)`;
      el.dataset.visible = 'true';
    };
    const hide = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      el.dataset.visible = 'false';
    };
    const move = (event) => {
      if (!media.matches || event.pointerType !== 'mouse') { hide(); return; }
      x = event.clientX; y = event.clientY;
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const leave = (event) => { if (!event.relatedTarget) hide(); };
    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerout', leave);
    window.addEventListener('blur', hide);
    media.addEventListener('change', hide);
    return () => {
      hide();
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerout', leave);
      window.removeEventListener('blur', hide);
      media.removeEventListener('change', hide);
    };
  }, []);
  return <div ref={glow} className="ng-cursor-light" data-visible="false" aria-hidden="true" />;
}
