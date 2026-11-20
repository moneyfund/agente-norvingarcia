import { useState } from 'react';
import Button from './Button';
import FormLogin from './FormLogin';

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
    <section className="ng-community-panel">
      <h2 className="text-xl font-semibold">Comentarios</h2>
      {isAuthenticated && <form className="ng-form ng-community-form" onSubmit={handleSubmit}>
        <textarea
          aria-label="Comentario"
          rows="3"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Comparte tu opinión sobre esta propiedad"
          className="w-full rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
        />
        <Button type="submit" disabled={submitting}>{submitting ? 'Publicando...' : 'Publicar comentario'}</Button>
      </form>}
      {!isAuthenticated && <FormLogin onLogin={loginWithGoogle}>Inicia sesión para escribir comentarios.</FormLogin>}

      {(feedback || error) && <p className="ng-meta" role={error ? "alert" : "status"}>{error || feedback}</p>}
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
        {!loading && !error && !comments.length && <p className="text-sm text-slate-500">Aún no hay comentarios.</p>}
      </div>
    </section>
  );
}

export default PropertyCommentsSection;
