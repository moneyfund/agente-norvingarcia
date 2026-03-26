import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Heart, MapPin, Star } from 'lucide-react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Seo from '../components/Seo';
import { useAuth } from '../hooks/useAuth';
import { usePropertyComments } from '../hooks/usePropertyComments';
import { usePropertyReviews } from '../hooks/usePropertyReviews';
import { usePropertyLikes } from '../hooks/usePropertyLikes';
import { useProtectedPropertyForm } from '../hooks/useProtectedPropertyForm';
import { getPropiedadById } from '../services/propiedadesService';
import { propertyMarkerIcon } from '../utils/mapMarkers';

const money = new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const placeholderImage = 'https://via.placeholder.com/1200x900?text=Propiedad';

const INITIAL_VISIT_FORM = {
  phone: '',
  message: '',
};

function PropertyDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, loginWithGoogle, user, loading: authLoading } = useAuth();
  const [property, setProperty] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [visitForm, setVisitForm] = useState(INITIAL_VISIT_FORM);

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

  const requireAuthMessage = 'Debes iniciar sesión para realizar esta acción.';

  const handleLike = async () => {
    if (!isAuthenticated || !user) {
      setFeedbackMessage(requireAuthMessage);
      return;
    }

    try {
      await toggle();
      setFeedbackMessage('Like actualizado correctamente.');
    } catch (error) {
      setFeedbackMessage(error.message || 'No se pudo actualizar el like.');
    }
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();

    if (!isAuthenticated || !user) {
      setFeedbackMessage(requireAuthMessage);
      return;
    }

    if (!commentText.trim()) return;

    try {
      await submitComment(commentText.trim());
      setCommentText('');
      setFeedbackMessage('Comentario publicado correctamente.');
    } catch (error) {
      setFeedbackMessage(error.message || 'No se pudo publicar el comentario.');
    }
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();

    if (!isAuthenticated || !user) {
      setFeedbackMessage(requireAuthMessage);
      return;
    }

    if (!reviewText.trim()) return;

    try {
      await submitReview(Number(reviewRating), reviewText.trim());
      setReviewText('');
      setReviewRating(5);
      setFeedbackMessage('Reseña guardada correctamente.');
    } catch (error) {
      setFeedbackMessage(error.message || 'No se pudo guardar la reseña.');
    }
  };

  const handleVisitFormChange = (field) => (event) => {
    setVisitForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleVisitFormSubmit = async (event) => {
    event.preventDefault();

    if (!isAuthenticated || !user) {
      setFeedbackMessage(requireAuthMessage);
      return;
    }

    try {
      await submitForm({
        phone: visitForm.phone,
        message: visitForm.message,
      });
      setVisitForm(INITIAL_VISIT_FORM);
      setFeedbackMessage('Solicitud enviada correctamente.');
    } catch (error) {
      setFeedbackMessage(error.message || 'No se pudo enviar la solicitud de visita.');
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
            <Button type="button" variant={hasLiked ? 'primary' : 'outline'} onClick={handleLike} disabled={likesLoading} className="inline-flex items-center gap-2">
              <Heart size={16} /> {hasLiked ? 'Te gusta' : 'Me gusta'} ({likesCount})
            </Button>
          </div>
          {!isAuthenticated && (
            <div className="rounded-2xl border border-brand-500/30 bg-brand-500/5 p-4">
              <p className="text-sm">Debes iniciar sesión para comentar, reseñar, dar like y enviar formularios.</p>
              <Button className="mt-3" onClick={loginWithGoogle}>Iniciar sesión con Google</Button>
            </div>
          )}
          {(feedbackMessage || likesError) && <p className="rounded-xl bg-slate-100 p-3 text-sm dark:bg-slate-800">{feedbackMessage || likesError}</p>}
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
        <div className="rounded-2xl bg-white p-5 shadow-premium dark:bg-slate-900">
          <h2 className="text-xl font-semibold">Comentarios</h2>
          <form className="mt-4 space-y-3" onSubmit={handleCommentSubmit}>
            <textarea
              rows="3"
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              placeholder="Comparte tu opinión sobre esta propiedad"
              className="w-full rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
            />
            <Button type="submit" disabled={!isAuthenticated || commentsSubmitting}>{commentsSubmitting ? 'Publicando...' : 'Publicar comentario'}</Button>
          </form>
          {commentsError && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{commentsError}</p>}
          <div className="mt-4 space-y-3">
            {comments.map((comment) => (
              <article key={comment.id} className="rounded-xl bg-slate-100 p-3 text-sm dark:bg-slate-800">
                <div className="flex items-center gap-2">
                  {comment.userPhotoURL && <img src={comment.userPhotoURL} alt={comment.userName} className="h-7 w-7 rounded-full" />}
                  <p className="font-semibold">{comment.userName}</p>
                </div>
                <p className="mt-1 text-slate-600 dark:text-slate-300">{comment.content}</p>
              </article>
            ))}
            {commentsLoading && <p className="text-sm text-slate-500">Cargando comentarios...</p>}
            {!commentsLoading && !comments.length && <p className="text-sm text-slate-500">Aún no hay comentarios.</p>}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-premium dark:bg-slate-900">
          <h2 className="text-xl font-semibold">Reseñas</h2>
          <p className="mt-2 text-sm text-slate-500">Valoración promedio: {averageRating.toFixed(1)} <Star size={14} className="inline text-amber-400" fill="currentColor" /></p>
          <form className="mt-4 space-y-3" onSubmit={handleReviewSubmit}>
            <select
              value={reviewRating}
              onChange={(event) => setReviewRating(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
            >
              {[5, 4, 3, 2, 1].map((rate) => <option key={rate} value={rate}>{rate} estrellas</option>)}
            </select>
            <textarea
              rows="3"
              value={reviewText}
              onChange={(event) => setReviewText(event.target.value)}
              placeholder="¿Cómo calificas esta propiedad?"
              className="w-full rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
            />
            <Button type="submit" disabled={!isAuthenticated || reviewsSubmitting}>{reviewsSubmitting ? 'Publicando...' : 'Publicar reseña'}</Button>
          </form>
          {reviewsError && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{reviewsError}</p>}
          <div className="mt-4 space-y-3">
            {reviews.map((review) => (
              <article key={review.id} className="rounded-xl bg-slate-100 p-3 text-sm dark:bg-slate-800">
                <div className="flex items-center gap-2">
                  {review.userPhotoURL && <img src={review.userPhotoURL} alt={review.userName} className="h-7 w-7 rounded-full" />}
                  <p className="font-semibold">{review.userName} · {review.rating}/5</p>
                </div>
                <p className="mt-1 text-slate-600 dark:text-slate-300">{review.content}</p>
              </article>
            ))}
            {reviewsLoading && <p className="text-sm text-slate-500">Cargando reseñas...</p>}
            {!reviewsLoading && !reviews.length && <p className="text-sm text-slate-500">Aún no hay reseñas.</p>}
          </div>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)}>
        <h2 className="text-2xl font-semibold">Solicitar visita</h2>
        <p className="mt-2 text-slate-500">Este formulario es protegido y se guarda en la propiedad actual.</p>
        {!isAuthenticated && (
          <div className="mt-4 rounded-xl border border-brand-500/30 bg-brand-500/5 p-4">
            <p className="text-sm">Debes iniciar sesión para enviar la solicitud.</p>
            <Button className="mt-3" type="button" onClick={loginWithGoogle}>Iniciar sesión con Google</Button>
          </div>
        )}
        {formError && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{formError}</p>}
        {formSuccess && <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">Formulario enviado correctamente.</p>}
        <form className="mt-4 space-y-3" onSubmit={handleVisitFormSubmit}>
          <Input label="Teléfono" value={visitForm.phone} onChange={handleVisitFormChange('phone')} placeholder="Tu teléfono" />
          <label>
            <span className="mb-2 block text-sm font-medium">Mensaje</span>
            <textarea
              rows="4"
              value={visitForm.message}
              onChange={handleVisitFormChange('message')}
              placeholder="Cuéntanos cuándo te gustaría visitar la propiedad"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
            />
          </label>
          <Button type="submit" disabled={!isAuthenticated || formSubmitting}>{formSubmitting ? 'Enviando...' : 'Enviar solicitud'}</Button>
        </form>
      </Modal>
    </section>
  );
}

export default PropertyDetailPage;
