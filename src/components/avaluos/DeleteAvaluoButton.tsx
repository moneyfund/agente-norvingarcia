import { useState } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const CONFIRM_MESSAGE = '¿Seguro que deseas eliminar este avalúo? Esta acción no se puede deshacer.';
const ERROR_MESSAGE = 'No se pudo eliminar el avalúo.';

type DeleteAvaluoButtonProps = {
  avaluo: { id?: string };
  onDeleted?: (id: string) => void;
  className?: string;
};

export default function DeleteAvaluoButton({ avaluo, onDeleted, className = '' }: DeleteAvaluoButtonProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (deleting) return;
    if (!avaluo?.id) {
      setError(ERROR_MESSAGE);
      return;
    }

    const confirmed = window.confirm(CONFIRM_MESSAGE);
    if (!confirmed) return;

    setDeleting(true);
    setError('');

    try {
      await deleteDoc(doc(db, 'avaluos', avaluo.id));
      onDeleted?.(avaluo.id);
    } catch (err) {
      console.error('Error eliminando avalúo:', err);
      setError(ERROR_MESSAGE);
      alert(ERROR_MESSAGE);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className={`inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/30 bg-gradient-to-r from-red-700 to-rose-700 px-4 py-2 font-semibold text-white shadow-lg shadow-red-950/20 transition hover:from-red-600 hover:to-rose-600 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      >
        {deleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
        {deleting ? 'Eliminando...' : 'Eliminar'}
      </button>
      {error && <span className="text-xs font-medium text-red-300">{error}</span>}
    </div>
  );
}
