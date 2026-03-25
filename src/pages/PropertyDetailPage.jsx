import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, MapPin, Star } from 'lucide-react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Seo from '../components/Seo';
import { useAuth } from '../hooks/useAuth';
import { subscribeToComments, createComment } from '../services/commentsService';
import { subscribeToLikes, togglePropertyLike } from '../services/likesService';
import { subscribeToReviews, upsertReview } from '../services/reviewsService';
import { createPropertyForm } from '../services/formulariosService';
import { getPropiedadById } from '../services/propiedadesService';

const money = new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const placeholderImage = 'https://via.placeholder.com/1200x900?text=Propiedad';

const INITIAL_VISIT_FORM = {
  phone: '',
  preferredDate: '',
  notes: '',
};

function PropertyDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, loginWithGoogle, user, loading: authLoading } = useAuth();
  const [property, setProperty] = useState(null);
  const [activeImage, setActiveImage] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [likes, setLikes] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [visitForm, setVisitForm] = useState(INITIAL_VISIT_FORM);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getPropiedadById(id);
        setProperty(data);
        setActiveImage(data?.imagenes?.[0] || '');
      } catch (error) {
        console.error('Error al cargar la propiedad', { propertyId: id, error });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  useEffect(() => {
    const unsubscribeLikes = subscribeToLikes(id, setLikes);
    const unsubscribeComments = subscribeToComments(id, setComments);
    const unsubscribeReviews = subscribeToReviews(id, setReviews);

    return () => {
      unsubscribeLikes();
      unsubscribeComments();
      unsubscribeReviews();
    };
  }, [id]);

  const hasLiked = useMemo(() => Boolean(user?.uid && likes.some((like) => like.uid === user.uid)), [likes, user?.uid]);

  const averageRating = useMemo(() => {
    if (!reviews.length) return '0.0';
    const total = reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0);
    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  const requireAuthMessage = 'Debes iniciar sesión para realizar esta acción.';

  const handleLike = async () => {
    if (!isAuthenticated || !user) {
      setFeedbackMessage(requireAuthMessage);
      return;
    }

    try {
      await togglePropertyLike({ propertyId: id, user });
      setFeedbackMessage('Like actualizado correctamente.');
    } catch (error) {
      setFeedbackMessage('No se pudo actualizar el like. Revisa la consola.');
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
      await createComment({
        propertyId: id,
        message: commentText.trim(),
        user,
      });
      setCommentText('');
      setFeedbackMessage('Comentario publicado correctamente.');
    } catch (error) {
      setFeedbackMessage('No se pudo publicar el comentario. Revisa la consola.');
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
      await upsertReview({
        propertyId: id,
        rating: Number(reviewRating),
        message: reviewText.trim(),
        user,
      });
      setReviewText('');
      setReviewRating(5);
      setFeedbackMessage('Reseña guardada correctamente.');
    } catch (error) {
      setFeedbackMessage('No se pudo guardar la reseña. Revisa la consola.');
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
      await createPropertyForm({
        propertyId: id,
        tipoFormulario: 'solicitud_visita',
        payload: {
          ...visitForm,
          propertyTitle: property?.titulo || '',
        },
        user,
      });
      setVisitForm(INITIAL_VISIT_FORM);
      setOpen(false);
      setFeedbackMessage('Solicitud de visita enviada correctamente.');
    } catch (error) {
      setFeedbackMessage('No se pudo enviar la solicitud de visita. Revisa la consola.');
    }
  };

  if (loading || authLoading) return <section className="section-container">Cargando propiedad...</section>;
  if (!property) return <section className="section-container">No se encontró esta propiedad.</section>;

  const gallery = property.imagenes?.length ? property.imagenes : [placeholderImage];
  const operationLabel = property.tipoOperacion === 'alquiler' ? 'En Alquiler' : 'En Venta';

  return (
    <section className="section-container">
      <Seo title={`${property.titulo} | Norvin García`} description={property.descripcion} />
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <img src={activeImage || gallery[0]} alt={property.titulo} className="h-96 w-full rounded-2xl object-cover shadow-premium" />
          <div className="mt-4 grid grid-cols-3 gap-3">
            {gallery.map((image) => (
              <button key={image} onClick={() => setActiveImage(image)}>
                <img src={image} alt={property.titulo} className="h-24 w-full rounded-xl object-cover" />
              </button>
            ))}
          </div>
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
            <Button type="button" variant={hasLiked ? 'primary' : 'outline'} onClick={handleLike} className="inline-flex items-center gap-2">
              <Heart size={16} /> {hasLiked ? 'Te gusta' : 'Me gusta'} ({likes.length})
            </Button>
          </div>
          {!isAuthenticated && (
            <div className="rounded-2xl border border-brand-500/30 bg-brand-500/5 p-4">
              <p className="text-sm">Debes iniciar sesión para comentar, reseñar, dar like y enviar formularios.</p>
              <Button className="mt-3" onClick={loginWithGoogle}>Iniciar sesión con Google</Button>
            </div>
          )}
          {feedbackMessage && <p className="rounded-xl bg-slate-100 p-3 text-sm dark:bg-slate-800">{feedbackMessage}</p>}
        </div>
      </div>

      <div className="mt-10 overflow-hidden rounded-2xl shadow-premium">
        <MapContainer center={[property.lat, property.lng]} zoom={13} style={{ height: '360px', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[property.lat, property.lng]}>
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
            <Button type="submit" disabled={!isAuthenticated}>Publicar comentario</Button>
          </form>
          <div className="mt-4 space-y-3">
            {comments.map((comment) => (
              <article key={comment.id} className="rounded-xl bg-slate-100 p-3 text-sm dark:bg-slate-800">
                <div className="flex items-center gap-2">
                  {comment.photoURL && <img src={comment.photoURL} alt={comment.displayName} className="h-7 w-7 rounded-full" />}
                  <p className="font-semibold">{comment.displayName}</p>
                </div>
                <p className="mt-1 text-slate-600 dark:text-slate-300">{comment.message}</p>
              </article>
            ))}
            {!comments.length && <p className="text-sm text-slate-500">Aún no hay comentarios.</p>}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-premium dark:bg-slate-900">
          <h2 className="text-xl font-semibold">Reseñas</h2>
          <p className="mt-2 text-sm text-slate-500">Valoración promedio: {averageRating} <Star size={14} className="inline text-amber-400" fill="currentColor" /></p>
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
            <Button type="submit" disabled={!isAuthenticated}>Publicar reseña</Button>
          </form>
          <div className="mt-4 space-y-3">
            {reviews.map((review) => (
              <article key={review.id} className="rounded-xl bg-slate-100 p-3 text-sm dark:bg-slate-800">
                <div className="flex items-center gap-2">
                  {review.photoURL && <img src={review.photoURL} alt={review.displayName} className="h-7 w-7 rounded-full" />}
                  <p className="font-semibold">{review.displayName} · {review.rating}/5</p>
                </div>
                <p className="mt-1 text-slate-600 dark:text-slate-300">{review.message}</p>
              </article>
            ))}
            {!reviews.length && <p className="text-sm text-slate-500">Aún no hay reseñas.</p>}
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
        <form className="mt-4 space-y-3" onSubmit={handleVisitFormSubmit}>
          <Input label="Teléfono" value={visitForm.phone} onChange={handleVisitFormChange('phone')} placeholder="Tu teléfono" />
          <Input label="Fecha preferida" type="date" value={visitForm.preferredDate} onChange={handleVisitFormChange('preferredDate')} />
          <label>
            <span className="mb-2 block text-sm font-medium">Notas</span>
            <textarea
              rows="4"
              value={visitForm.notes}
              onChange={handleVisitFormChange('notes')}
              placeholder="Horario, acompañantes o detalles adicionales"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
            />
          </label>
          <Button type="submit" disabled={!isAuthenticated}>Enviar solicitud</Button>
        </form>
      </Modal>
    </section>
  );
}

export default PropertyDetailPage;
