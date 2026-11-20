import { useMemo, useState } from 'react';
import { Star } from 'lucide-react';
import Button from './Button';
import FormLogin from './FormLogin';

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
    <section className="ng-community-panel">
      <h2 className="text-xl font-semibold">Reseñas</h2>
      {reviews.length > 0 && <p className="ng-meta">
        Valoración promedio: {averageLabel} <Star size={14} className="inline text-amber-400" fill="currentColor" />
      </p>}
      {isAuthenticated && <form className="ng-form ng-community-form" onSubmit={handleSubmit}>
        <select
          aria-label="Calificación de la propiedad"
          value={rating}
          onChange={(event) => setRating(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
        >
          {[5, 4, 3, 2, 1].map((rate) => <option key={rate} value={rate}>{rate} estrellas</option>)}
        </select>
        <textarea
          aria-label="Reseña"
          rows="3"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="¿Cómo calificas esta propiedad?"
          className="w-full rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
        />
        <Button type="submit" disabled={submitting}>{submitting ? 'Publicando...' : 'Publicar reseña'}</Button>
      </form>}
      {!isAuthenticated && <FormLogin onLogin={loginWithGoogle}>Inicia sesión para publicar reseñas.</FormLogin>}

      {(feedback || error) && <p className="ng-meta" role={error ? "alert" : "status"}>{error || feedback}</p>}
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
        {!loading && !error && !reviews.length && <p className="text-sm text-slate-500">Aún no hay reseñas.</p>}
      </div>
    </section>
  );
}

export default PropertyReviewsSection;
