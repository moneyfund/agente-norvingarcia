import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, MessageCircle, Share2 } from 'lucide-react';
import { useInView } from 'framer-motion';
import Modal from '../components/Modal';
import Seo from '../components/Seo';
import PropertyGallery from '../components/PropertyGallery';
import PropertyCommentsSection from '../components/PropertyCommentsSection';
import PropertyReviewsSection from '../components/PropertyReviewsSection';
import PropertyLikeButton from '../components/PropertyLikeButton';
import PropertyContactForm from '../components/PropertyContactForm';
import { useAuth } from '../hooks/useAuth';
import { usePropertyComments } from '../hooks/usePropertyComments';
import { usePropertyReviews } from '../hooks/usePropertyReviews';
import { usePropertyLikes } from '../hooks/usePropertyLikes';
import { useProtectedPropertyForm } from '../hooks/useProtectedPropertyForm';
import { getPropiedadById } from '../services/propiedadesService';
import { contact } from '../config/brand';
import { normalizePropertyMedia } from '../utils/propertyMedia';
import { formatUSD, isPositiveNumber, operationLabel, pricePerArea, propertyUnit } from '../utils/propertyPresentation';

const PropertyLocation = lazy(() => import('../components/PropertyLocation'));

function PropertyDetailPage() {
  const { id } = useParams();
  const { state } = useLocation();
  const { isAuthenticated, loginWithGoogle } = useAuth();
  const [request, setRequest] = useState(null);
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [showShareUrl, setShowShareUrl] = useState(false);

  const cached = state?.property?.id === id ? state.property : null;
  const currentRequest = request?.id === id ? request : null;
  const property = currentRequest && !currentRequest.error ? currentRequest.property : cached;
  const gallery = useMemo(() => normalizePropertyMedia(property || {}), [property]);
  const mapRef = useRef(null);
  const showMap = useInView(mapRef, { once: true, margin: '200px 0px' });

  const { comments, loading: commentsLoading, submitting: commentsSubmitting, error: commentsError, submitComment } = usePropertyComments(id);
  const { reviews, averageRating, loading: reviewsLoading, submitting: reviewsSubmitting, error: reviewsError, submitReview } = usePropertyReviews(id);
  const { likesCount, hasLiked, loading: likesLoading, error: likesError, toggle } = usePropertyLikes(id);
  const { submitForm, submitting: formSubmitting, error: formError, success: formSuccess } = useProtectedPropertyForm(id);

  useEffect(() => {
    let active = true;
    getPropiedadById(id)
      .then((data) => { if (active) setRequest({ id, property: data }); })
      .catch(() => { if (active) setRequest({ id, error: true }); });
    return () => { active = false; };
  }, [id]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      setFeedback('Inicia sesión para dar me gusta.');
      return;
    }
    try {
      await toggle();
      setFeedback('');
    } catch {
      setFeedback('No se pudo actualizar el me gusta.');
    }
  };

  if (!property) {
    return (
      <section className="ng-wrap ng-detail-state" aria-busy={!currentRequest}>
        <Link to="/propiedades" className="ng-back"><ArrowLeft size={17} aria-hidden="true" /> Catálogo</Link>
        {!currentRequest ? <div className="ng-detail-skeleton" role="status"><span className="sr-only">Cargando propiedad</span><div /><div /></div> : (
          <div className="ng-empty">
            <h1>{currentRequest.error ? 'No se pudo cargar la propiedad' : 'Propiedad no encontrada'}</h1>
            <p>{currentRequest.error ? 'Puedes recargar la ficha o regresar al catálogo.' : 'Consulta las propiedades disponibles en el catálogo.'}</p>
            <Link to="/propiedades" className="ng-button ng-button--line">Ir al catálogo</Link>
          </div>
        )}
      </section>
    );
  }

  const title = property.titulo || property.title || property.name || 'Propiedad';
  const price = formatUSD(property.precio);
  const unit = propertyUnit(property.unidadMedida);
  const perArea = pricePerArea(property);
  const lat = Number(property.lat);
  const lng = Number(property.lng);
  const hasCoordinates = Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 && (lat !== 0 || lng !== 0);
  const whatsappMessage = `Hola Norvin, quiero información sobre ${title} (ID: ${property.id}).`;
  const whatsappUrl = `${contact.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`;
  const shareUrl = new URL(`/propiedad/${encodeURIComponent(id)}`, window.location.origin).href;

  const share = async () => {
    setShareMessage('');
    setShowShareUrl(false);
    try {
      if (navigator.share) {
        await navigator.share({ title, url: shareUrl });
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      setShareMessage('Enlace copiado.');
    } catch (error) {
      if (error.name === 'AbortError') return;
      setShowShareUrl(true);
    }
  };

  const specs = [
    ['Tipo', property.tipo],
    ['Modalidad', operationLabel(property)],
    ['Habitaciones', isPositiveNumber(property.habitaciones) ? property.habitaciones : null],
    ['Baños', isPositiveNumber(property.banos) ? property.banos : null],
    ['Área de terreno', isPositiveNumber(property.area) ? `${property.area} ${unit.short}` : null],
    ['Área construida', isPositiveNumber(property.areaConstruida) ? `${property.areaConstruida} ${unit.short}` : null],
    [`Precio por ${unit.long}`, perArea === null ? null : formatUSD(perArea)],
  ].filter(([, value]) => value !== null && value !== undefined && value !== '');

  return (
    <article className="ng-detail">
      <Seo title={`${title} | Norvin García`} description={property.descripcion} />
      <div className="ng-detail-header">
        <div className="ng-wrap">
          <Link to="/propiedades" className="ng-back"><ArrowLeft size={17} aria-hidden="true" /> Catálogo</Link>
          <div className="ng-detail-title">
            <div>
              <p className="ng-label">{[operationLabel(property), property.tipo, property.premium ? 'Destacada' : ''].filter(Boolean).join(' · ')}</p>
              <h1 className="ng-display">{title}</h1>
              {property.ubicacion && <p className="ng-detail-location"><MapPin size={17} aria-hidden="true" />{property.ubicacion}</p>}
            </div>
            <p className="ng-detail-price">{price}</p>
          </div>
        </div>
      </div>
      <div className="ng-wrap ng-detail-content">
        <PropertyGallery key={id} media={gallery} title={title} />

        <div className="ng-detail-layout">
          <aside className="ng-detail-contact">
            <p className="ng-label">Asesoría y visitas</p>
            <h2>Norvin García</h2>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="ng-button ng-button--wine"><MessageCircle size={18} aria-hidden="true" /> Escribir por WhatsApp</a>
            <button type="button" className="ng-button ng-button--line" onClick={() => setOpen(true)}>Solicitar una visita</button>
            <button type="button" className="ng-text-link" onClick={share}><Share2 size={16} aria-hidden="true" /> Compartir ficha</button>
            {shareMessage && <p className="ng-meta" role="status">{shareMessage}</p>}
            {showShareUrl && <label className="ng-share-field">Enlace de la propiedad<input readOnly value={shareUrl} onFocus={(event) => event.target.select()} /></label>}
            <PropertyLikeButton likesCount={likesError ? null : likesCount} hasLiked={hasLiked} loading={likesLoading} onToggle={handleLike} message={feedback || likesError} />
          </aside>
          <div className="ng-detail-information">
            <section>
              <h2 className="ng-display">La propiedad</h2>
              <dl className="ng-detail-specs">
                {specs.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
              </dl>
              {property.descripcion && <p className="ng-detail-description">{property.descripcion}</p>}
            </section>
            {hasCoordinates && <section className="ng-detail-map">
              <h2 className="ng-display">Ubicación</h2>
              <div className="ng-map-frame" ref={mapRef}>
                {showMap && <Suspense fallback={<div className="ng-leaflet" role="status">Cargando mapa…</div>}>
                  <PropertyLocation coordinates={[lat, lng]} title={title} />
                </Suspense>}
              </div>
            </section>}
          </div>
        </div>
        <div className="ng-interaction-grid">
          <PropertyCommentsSection comments={comments} loading={commentsLoading} error={commentsError} submitting={commentsSubmitting} isAuthenticated={isAuthenticated} onSubmit={submitComment} loginWithGoogle={loginWithGoogle} />
          <PropertyReviewsSection reviews={reviews} averageRating={averageRating} loading={reviewsLoading} error={reviewsError} submitting={reviewsSubmitting} isAuthenticated={isAuthenticated} onSubmit={submitReview} loginWithGoogle={loginWithGoogle} />
        </div>
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Solicitar una visita">
        <PropertyContactForm submitForm={submitForm} submitting={formSubmitting} error={formError} success={formSuccess} isAuthenticated={isAuthenticated} loginWithGoogle={loginWithGoogle} />
      </Modal>
    </article>
  );
}

export default PropertyDetailPage;
