import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Seo from '../components/Seo';
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
import { propertyMarkerIcon } from '../utils/mapMarkers';

const money = new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const placeholderImage = 'https://via.placeholder.com/1200x900?text=Propiedad';

function PropertyDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, loginWithGoogle, loading: authLoading } = useAuth();
  const [property, setProperty] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const { comments, loading: commentsLoading, submitting: commentsSubmitting, error: commentsError, submitComment } = usePropertyComments(id);
  const {
    reviews,
    averageRating,
    loading: reviewsLoading,
    submitting: reviewsSubmitting,
    error: reviewsError,
    submitReview,
  } = usePropertyReviews(id);
  const { likesCount, hasLiked, loading: likesLoading, error: likesError, toggle } = usePropertyLikes(id);
  const { submitForm, submitting: formSubmitting, error: formError, success: formSuccess } = useProtectedPropertyForm(id);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getPropiedadById(id);
        setProperty(data);
        setCurrentImageIndex(0);
      } catch (error) {
        console.error('Error al cargar la propiedad', { propertyId: id, error });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      setFeedbackMessage('Debes iniciar sesión para dar like.');
      return;
    }

    try {
      await toggle();
      setFeedbackMessage('Like actualizado correctamente.');
    } catch (_) {
      setFeedbackMessage('No se pudo actualizar el like.');
    }
  };

  if (loading || authLoading) return <section className="section-container">Cargando propiedad...</section>;
  if (!property) return <section className="section-container">No se encontró esta propiedad.</section>;

  const gallery = property.imagenes?.length ? property.imagenes : [placeholderImage];
  const hasMultipleImages = gallery.length > 1;
  const activeImage = gallery[currentImageIndex] || gallery[0];
  const operationLabel = property.tipoOperacion === 'alquiler' ? 'En Alquiler' : 'En Venta';
  const showGalleryFallback = !property.imagenes?.length;

  const goToPreviousImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + gallery.length) % gallery.length);
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % gallery.length);
  };

  const handleGalleryKeyDown = (event) => {
    if (!hasMultipleImages) return;
    if (event.key === 'ArrowLeft') goToPreviousImage();
    if (event.key === 'ArrowRight') goToNextImage();
  };

  return (
    <section className="section-container">
      <Seo title={`${property.titulo} | Norvin García`} description={property.descripcion} />
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <div
            className="relative"
            onKeyDown={handleGalleryKeyDown}
            tabIndex={hasMultipleImages ? 0 : -1}
            aria-label="Galería de imágenes de la propiedad"
          >
            <img src={activeImage} alt={property.titulo} className="h-96 w-full rounded-2xl object-cover shadow-premium" />
            {hasMultipleImages && (
              <>
                <button
                  type="button"
                  onClick={goToPreviousImage}
                  aria-label="Imagen anterior"
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/45 p-2 text-white transition hover:bg-black/65 focus:outline-none focus:ring-2 focus:ring-white/80"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  type="button"
                  onClick={goToNextImage}
                  aria-label="Imagen siguiente"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/45 p-2 text-white transition hover:bg-black/65 focus:outline-none focus:ring-2 focus:ring-white/80"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>
          {showGalleryFallback && <p className="mt-3 text-sm text-slate-500">Esta propiedad no tiene imágenes disponibles aún.</p>}
        </div>
        <div className="space-y-5">
          <p className="text-4xl font-bold text-brand-500">{money.format(property.precio)}</p>
          <h1 className="font-display text-4xl font-semibold">{property.titulo}</h1>
          <p className="flex items-center gap-2 text-slate-500"><MapPin size={16} /> {property.ubicacion}</p>
          <p className="text-slate-600 dark:text-slate-300">{property.descripcion}</p>
          <ul className="grid grid-cols-2 gap-3 text-sm">
            <li className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">Habitaciones: {property.habitaciones}</li>
            <li className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">Baños: {property.banos}</li>
            <li className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">Tipo: {property.tipo}</li>
            <li className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">Operación: {operationLabel}</li>
            <li className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">Premium: {property.premium ? 'Sí' : 'No'}</li>
          </ul>
          <div className="flex flex-wrap gap-3">
            <a href="https://wa.me/18095551234" target="_blank" rel="noreferrer"><Button>Contactar por WhatsApp</Button></a>
            <Button variant="outline" onClick={() => setOpen(true)}>Solicitar visita</Button>
            <PropertyLikeButton
              likesCount={likesCount}
              hasLiked={hasLiked}
              loading={likesLoading}
              onToggle={handleLike}
              disabled={false}
              message={feedbackMessage || likesError}
            />
          </div>
          {!isAuthenticated && (
            <div className="rounded-2xl border border-brand-500/30 bg-brand-500/5 p-4">
              <p className="text-sm">Debes iniciar sesión para comentar, reseñar, dar like y enviar formularios.</p>
              <Button className="mt-3" onClick={loginWithGoogle}>Iniciar sesión con Google</Button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-10 overflow-hidden rounded-2xl shadow-premium">
        <MapContainer center={[property.lat, property.lng]} zoom={13} style={{ height: '360px', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[property.lat, property.lng]} icon={propertyMarkerIcon}>
            <Popup>{property.titulo}</Popup>
          </Marker>
        </MapContainer>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <PropertyCommentsSection
          comments={comments}
          loading={commentsLoading}
          error={commentsError}
          submitting={commentsSubmitting}
          isAuthenticated={isAuthenticated}
          onSubmit={submitComment}
          loginWithGoogle={loginWithGoogle}
        />
        <PropertyReviewsSection
          reviews={reviews}
          averageRating={averageRating}
          loading={reviewsLoading}
          error={reviewsError}
          submitting={reviewsSubmitting}
          isAuthenticated={isAuthenticated}
          onSubmit={submitReview}
          loginWithGoogle={loginWithGoogle}
        />
      </div>

      <Modal open={open} onClose={() => setOpen(false)}>
        <PropertyContactForm
          submitForm={submitForm}
          submitting={formSubmitting}
          error={formError}
          success={formSuccess}
          isAuthenticated={isAuthenticated}
          loginWithGoogle={loginWithGoogle}
        />
      </Modal>
    </section>
  );
}

export default PropertyDetailPage;
