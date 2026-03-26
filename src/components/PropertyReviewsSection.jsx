import { useMemo, useState } from 'react';
import { Star } from 'lucide-react';
import Button from './Button';

function PropertyReviewsSection({ reviews, averageRating, loading, error, submitting, isAuthenticated, onSubmit, loginWithGoogle }) {
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');

  const averageLabel = useMemo(() => averageRating.toFixed(1), [averageRating]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      setFeedback('Debes iniciar sesión para publicar reseñas.');
      return;
    }

    const value = content.trim();
    if (!value) {
      setFeedback('La reseña no puede estar vacía.');
      return;
    }

    try {
      await onSubmit(Number(rating), value);
      setContent('');
      setRating(5);
      setFeedback('Reseña guardada correctamente.');
    } catch (_) {
      setFeedback('');
    }
  };

  return (
    <div className="rounded-2xl bg-white p-5 shadow-premium dark:bg-slate-900">
      <h2 className="text-xl font-semibold">Reseñas</h2>
      <p className="mt-2 text-sm text-slate-500">
        Valoración promedio: {averageLabel} <Star size={14} className="inline text-amber-400" fill="currentColor" />
      </p>
      <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
        <select
          value={rating}
          onChange={(event) => setRating(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
        >
          {[5, 4, 3, 2, 1].map((rate) => <option key={rate} value={rate}>{rate} estrellas</option>)}
        </select>
        <textarea
          rows="3"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="¿Cómo calificas esta propiedad?"
          className="w-full rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
        />
        <Button type="submit" disabled={submitting}>{submitting ? 'Publicando...' : 'Publicar reseña'}</Button>
      </form>

      {!isAuthenticated && (
        <div className="mt-3 rounded-xl border border-brand-500/30 bg-brand-500/5 p-3">
          <p className="text-sm">Inicia sesión para publicar reseñas.</p>
          <Button className="mt-2" type="button" onClick={loginWithGoogle}>Iniciar sesión con Google</Button>
        </div>
      )}

      {(feedback || error) && <p className="mt-3 rounded-xl bg-slate-100 p-3 text-sm dark:bg-slate-800">{error || feedback}</p>}
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
        {loading && <p className="text-sm text-slate-500">Cargando reseñas...</p>}
        {!loading && !reviews.length && <p className="text-sm text-slate-500">Aún no hay reseñas.</p>}
      </div>
    </div>
  );
}

export default PropertyReviewsSection;
