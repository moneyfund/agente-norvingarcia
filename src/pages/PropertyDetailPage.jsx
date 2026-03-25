import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, MapPin, Star } from 'lucide-react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Seo from '../components/Seo';
import { useAuth } from '../context/authContext';
import {
  addComment,
  addReview,
  subscribeToComments,
  subscribeToProperty,
  subscribeToReviews,
  togglePropertyLike,
} from '../services/interaccionesService';
import { getPropiedadById } from '../services/propiedadesService';

const money = new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const placeholderImage = 'https://via.placeholder.com/1200x900?text=Propiedad';

function PropertyDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, loginWithGoogle, user } = useAuth();
  const [property, setProperty] = useState(null);
  const [activeImage, setActiveImage] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getPropiedadById(id);
        setProperty(data);
        setActiveImage(data?.imagenes?.[0] || '');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  useEffect(() => {
    const unsubscribeProperty = subscribeToProperty(id, (updatedProperty) => {
      if (!updatedProperty) return;
      setProperty((prev) => ({ ...prev, ...updatedProperty }));
    });

    const unsubscribeComments = subscribeToComments(id, setComments);
    const unsubscribeReviews = subscribeToReviews(id, setReviews);

    return () => {
      unsubscribeProperty();
      unsubscribeComments();
      unsubscribeReviews();
    };
  }, [id]);

  const hasLiked = useMemo(
    () => Boolean(user?.uid && property?.likes?.includes(user.uid)),
    [property?.likes, user?.uid],
  );

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;
    const total = reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0);
    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  const requireAuthMessage = 'Debes iniciar sesión para realizar esta acción';

  const handleLike = async () => {
    if (!isAuthenticated || !user) {
      setFeedbackMessage(requireAuthMessage);
      return;
    }

    await togglePropertyLike(id, user.uid, hasLiked);
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    if (!isAuthenticated || !user) {
      setFeedbackMessage(requireAuthMessage);
      return;
    }

    if (!commentText.trim()) return;

    await addComment({
      propiedadId: id,
      userId: user.uid,
      nombre: user.displayName || user.email || 'Usuario',
      comentario: commentText.trim(),
    });
    setCommentText('');
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    if (!isAuthenticated || !user) {
      setFeedbackMessage(requireAuthMessage);
      return;
    }

    if (!reviewText.trim()) return;

    await addReview({
      propiedadId: id,
      userId: user.uid,
      nombre: user.displayName || user.email || 'Usuario',
      comentario: reviewText.trim(),
      rating: Number(reviewRating),
    });
    setReviewText('');
    setReviewRating(5);
  };

  if (loading) return <section className="section-container">Cargando propiedad...</section>;
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
              <Heart size={16} /> {hasLiked ? 'Te gusta' : 'Me gusta'} ({property.likes?.length || 0})
            </Button>
          </div>
          {!isAuthenticated && (
            <div className="rounded-2xl border border-brand-500/30 bg-brand-500/5 p-4">
              <p className="text-sm">Debes iniciar sesión para comentar, reseñar o dar like.</p>
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
            <Button type="submit">Publicar comentario</Button>
          </form>
          <div className="mt-4 space-y-3">
            {comments.map((comment) => (
              <article key={comment.id} className="rounded-xl bg-slate-100 p-3 text-sm dark:bg-slate-800">
                <p className="font-semibold">{comment.nombre}</p>
                <p className="mt-1 text-slate-600 dark:text-slate-300">{comment.comentario}</p>
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
            <Button type="submit">Publicar reseña</Button>
          </form>
          <div className="mt-4 space-y-3">
            {reviews.map((review) => (
              <article key={review.id} className="rounded-xl bg-slate-100 p-3 text-sm dark:bg-slate-800">
                <p className="font-semibold">{review.nombre} · {review.rating}/5</p>
                <p className="mt-1 text-slate-600 dark:text-slate-300">{review.comentario}</p>
              </article>
            ))}
            {!reviews.length && <p className="text-sm text-slate-500">Aún no hay reseñas.</p>}
          </div>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)}>
        <h2 className="text-2xl font-semibold">Agenda una visita</h2>
        <p className="mt-2 text-slate-500">Escríbenos por WhatsApp para coordinar fecha y hora.</p>
        <a href="https://wa.me/18095551234" target="_blank" rel="noreferrer" className="mt-4 inline-block"><Button>Ir a WhatsApp</Button></a>
      </Modal>
    </section>
  );
}

export default PropertyDetailPage;
