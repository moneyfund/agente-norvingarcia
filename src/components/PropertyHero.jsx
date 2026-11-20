import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ChevronDown } from 'lucide-react';

export default function PropertyHero() {
  const hero = useRef(null);

  useEffect(() => {
    const el = hero.current;
    const media = window.matchMedia('(hover: hover) and (min-width: 761px) and (prefers-reduced-motion: no-preference)');
    let frame = 0;
    let x = 0;
    let y = 0;
    function paint() {
      frame = 0;
      if (!media.matches) {
        el.style.removeProperty('--scene-transform');
        return;
      }
      el.style.setProperty('--scene-transform', `translate3d(${x}px, ${y + Math.min(window.scrollY, el.offsetHeight) * .065}px, 0) scale(1.025)`);
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(paint); }
    function point(event) {
      if (!media.matches) return;
      const box = el.getBoundingClientRect();
      x = (event.clientX / box.width - .5) * -9;
      y = ((event.clientY - box.top) / box.height - .5) * -6;
      schedule();
    }
    function reset() { x = 0; y = 0; schedule(); }
    function scroll() { if (media.matches && window.scrollY < el.offsetHeight + 100) schedule(); }
    el.addEventListener('pointermove', point, { passive: true });
    el.addEventListener('pointerleave', reset);
    window.addEventListener('scroll', scroll, { passive: true });
    media.addEventListener('change', reset);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener('pointermove', point);
      el.removeEventListener('pointerleave', reset);
      window.removeEventListener('scroll', scroll);
      media.removeEventListener('change', reset);
    };
  }, []);

  return (
    <section ref={hero} className="ng-residence" aria-labelledby="ng-hero-name">
      <picture className="ng-residence-photo">
        <source media="(max-width: 660px)" srcSet="/brand/hero-mobile.webp" />
        <img src="/brand/hero-wide.webp" srcSet="/brand/hero-medium.webp 1280w, /brand/hero-wide.webp 1920w" sizes="100vw"
          width="1920" height="685" fetchPriority="high" alt="" />
      </picture>
      <div className="ng-wrap ng-residence-inner">
        <div className="ng-residence-copy">
          <p className="ng-hero-kicker"><span /> Bienes raíces en Nicaragua</p>
          <h1 id="ng-hero-name" className="ng-hero-wordmark">
            <span className="sr-only">Norvin García</span>
            <picture aria-hidden="true">
              <source media="(max-width: 660px)" srcSet="/brand/norvin-garcia-hero-stacked.svg" width="556" height="222" />
              <img src="/brand/norvin-garcia-hero.svg" alt="" width="1150" height="117" fetchPriority="high" />
            </picture>
          </h1>
          <p className="ng-residence-description">Asesoría personal para comprar o vender casas, terrenos y fincas.</p>
          <div className="ng-residence-actions">
            <Link to="/propiedades" className="ng-button ng-button--wine">Explorar propiedades</Link>
            <Link to="/contacto" className="ng-hero-contact">Contactar al agente</Link>
          </div>
        </div>
        <div className="ng-residence-credit">
          <span>Agente de <strong>Diamantes Realty Group</strong></span>
          <button type="button" className="ng-discover" onClick={() => { const target = document.getElementById("buscar-propiedad"); target?.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",block:"start"}); target?.querySelector("button")?.focus({preventScroll:true}); }}><span>Descubre</span><span className="ng-discover-arrows" aria-hidden="true"><ChevronDown size={17}/><ChevronDown size={17}/></span></button>
          <span><MapPin size={15} aria-hidden="true" /> Matagalpa, Nicaragua</span>
        </div>
      </div>
    </section>
  );
}
