import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize, Play } from 'lucide-react';
import Modal from './Modal';
import { applyImageFallback, optimizedPropertyPhoto, propertyThumbnail } from '../utils/propertyPresentation';

function GalleryMedia({ item, description, fullscreen, onOpen }) {
  if (item.type === 'video') {
    return <video src={item.url} controls playsInline preload="metadata" className="ng-gallery-media" />;
  }

  const picture = <img src={optimizedPropertyPhoto(item.url)} alt={description} className="ng-gallery-media" decoding="async" onError={applyImageFallback} />;
  return fullscreen ? picture : (
    <button type="button" className="ng-gallery-picture" onClick={onOpen} aria-label="Abrir fotografía en pantalla completa">{picture}</button>
  );
}

export default function PropertyGallery({ media, title }) {
  const [index, setIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const touchStart = useRef(null);

  if (!media.length) {
    return <div className="ng-gallery-missing"><img src="/img/placeholder-property.svg" alt="" /><p>Fotografías aún no disponibles.</p></div>;
  }

  const active = Math.min(index, media.length - 1);
  const item = media[active];
  const change = (direction) => setIndex((current) => (Math.min(current, media.length - 1) + direction + media.length) % media.length);
  const description = `${title}, fotografía ${active + 1}`;

  const onKeyDown = (event) => {
    if (media.length < 2 || event.target.closest('video, input, select, textarea')) return;
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    change(event.key === 'ArrowRight' ? 1 : -1);
  };

  function renderStage(inDialog) {
    return (
      <div
        className={`ng-gallery-stage${inDialog ? ' ng-gallery-stage--fullscreen' : ''}`}
        tabIndex={media.length > 1 ? 0 : undefined}
        role="group"
        aria-label="Fotografía o video de la propiedad"
        onTouchStart={(event) => {
          const touch = event.changedTouches[0];
          touchStart.current = item.type === 'image' && touch ? { x: touch.clientX, y: touch.clientY } : null;
        }}
        onTouchCancel={() => { touchStart.current = null; }}
        onTouchEnd={(event) => {
          const touch = event.changedTouches[0];
          const start = touchStart.current;
          touchStart.current = null;
          if (!start || !touch || media.length < 2) return;
          const dx = touch.clientX - start.x;
          const dy = touch.clientY - start.y;
          if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) change(dx < 0 ? 1 : -1);
        }}
      >
        {item.type === 'image' && <img className="ng-gallery-ambient" src={optimizedPropertyPhoto(item.url)} alt="" aria-hidden="true" decoding="async" />}
        {item.type === 'video' ? (
          <GalleryMedia key={item.url} item={item} />
        ) : (
          <div key={`${item.url}-${active}`} className="ng-gallery-slide">
            <GalleryMedia item={item} description={description} fullscreen={inDialog} onOpen={() => setFullscreen(true)} />
          </div>
        )}
        {media.length > 1 && <>
          <button type="button" className="ng-icon-button ng-gallery-prev" aria-label="Medio anterior" onClick={() => change(-1)}><ChevronLeft size={23} /></button>
          <button type="button" className="ng-icon-button ng-gallery-next" aria-label="Medio siguiente" onClick={() => change(1)}><ChevronRight size={23} /></button>
        </>}
        {!inDialog && <button type="button" className="ng-icon-button ng-gallery-expand" aria-label="Abrir galería en pantalla completa" onClick={() => setFullscreen(true)}><Maximize size={19} /></button>}
      </div>
    );
  }

  function renderStrip() {
    return (
      <div className="ng-gallery-strip">
        <div className="ng-gallery-thumbs" aria-label="Miniaturas de la galería">
          {media.map(({ url, type }, position) => {
            const thumbnail = type === 'image' ? propertyThumbnail(url) : null;
            return (
              <button type="button" key={`${url}-${position}`} aria-pressed={position === active} aria-label={`Ver ${type === 'video' ? 'video' : 'fotografía'} ${position + 1}`} onClick={() => setIndex(position)}>
                {type === 'video' && <Play size={18} aria-hidden="true" />}
                {thumbnail && <span className="ng-gallery-thumbnail" style={thumbnail} aria-hidden="true" />}
                {type === 'image' && !thumbnail && <img src={optimizedPropertyPhoto(url)} alt="" loading="lazy" decoding="async" onError={applyImageFallback} />}
              </button>
            );
          })}
        </div>
        <span className="ng-gallery-count" aria-live="polite" aria-label={`Medio ${active + 1} de ${media.length}`}>{active + 1} / {media.length}</span>
      </div>
    );
  }

  return (
    <>
      <div className="ng-gallery" aria-label="Galería de la propiedad" onKeyDown={onKeyDown}>
        {fullscreen && item.type === 'video' ? <div className="ng-gallery-stage ng-gallery-paused" aria-hidden="true"><Play size={32} /></div> : renderStage(false)}
        {renderStrip()}
      </div>
      <Modal open={fullscreen} title="Galería de la propiedad" onClose={() => setFullscreen(false)} className="ng-lightbox">
        <div onKeyDown={onKeyDown}>
          {renderStage(true)}
          {renderStrip()}
        </div>
      </Modal>
    </>
  );
}
