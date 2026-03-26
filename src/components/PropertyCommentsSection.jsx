import { useState } from 'react';
import Button from './Button';

function PropertyCommentsSection({ comments, loading, error, submitting, isAuthenticated, onSubmit, loginWithGoogle }) {
  const [content, setContent] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      setFeedback('Debes iniciar sesión para publicar comentarios.');
      return;
    }

    const value = content.trim();
    if (!value) {
      setFeedback('El comentario no puede estar vacío.');
      return;
    }

    try {
      await onSubmit(value);
      setContent('');
      setFeedback('Comentario publicado correctamente.');
    } catch (_) {
      setFeedback('');
    }
  };

  return (
    <div className="rounded-2xl bg-white p-5 shadow-premium dark:bg-slate-900">
      <h2 className="text-xl font-semibold">Comentarios</h2>
      <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
        <textarea
          rows="3"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Comparte tu opinión sobre esta propiedad"
          className="w-full rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
        />
        <Button type="submit" disabled={submitting}>{submitting ? 'Publicando...' : 'Publicar comentario'}</Button>
      </form>

      {!isAuthenticated && (
        <div className="mt-3 rounded-xl border border-brand-500/30 bg-brand-500/5 p-3">
          <p className="text-sm">Inicia sesión para escribir comentarios.</p>
          <Button className="mt-2" type="button" onClick={loginWithGoogle}>Iniciar sesión con Google</Button>
        </div>
      )}

      {(feedback || error) && <p className="mt-3 rounded-xl bg-slate-100 p-3 text-sm dark:bg-slate-800">{error || feedback}</p>}
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
        {loading && <p className="text-sm text-slate-500">Cargando comentarios...</p>}
        {!loading && !comments.length && <p className="text-sm text-slate-500">Aún no hay comentarios.</p>}
      </div>
    </div>
  );
}

export default PropertyCommentsSection;
