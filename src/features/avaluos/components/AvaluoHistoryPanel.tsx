import { Link } from 'react-router-dom';
import DownloadAvaluoPdfButton from '../../../components/avaluos/DownloadAvaluoPdfButton';
import DeleteAvaluoButton from '../../../components/avaluos/DeleteAvaluoButton';

type AvaluoHistoryPanelProps = {
  items: any[];
  onDeleted?: (id: string) => void;
};

export function AvaluoHistoryPanel({ items, onDeleted }: AvaluoHistoryPanelProps) {
  return (
    <section className="mt-10">
      <h2 className="text-2xl font-bold text-white">HISTORIAL DE AVALÚOS</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {items.map((i) => (
          <article key={i.id} className="rounded-2xl border border-slate-700 bg-slate-900 p-4 text-slate-200">
            <p className="font-semibold">{i.titulo}</p>
            <p className="text-sm text-slate-400">{i.tipoPropiedad} · {i.zona}</p>
            <p className="text-sm">{new Date(i.createdAt).toLocaleString()}</p>
            <p className="font-bold text-amber-300">${Number(i.valorFinal).toFixed(2)}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link to={`/avaluos/${i.id}`} className="inline-flex items-center rounded-xl border border-amber-400 px-4 py-2 font-semibold text-amber-100 hover:bg-amber-400/10">
                Ver informe
              </Link>
              <DownloadAvaluoPdfButton avaluo={i} />
              <DeleteAvaluoButton avaluo={i} onDeleted={onDeleted} />
            </div>
          </article>
        ))}
        {!items.length && <p className="text-slate-400">No hay avalúos guardados aún.</p>}
      </div>
    </section>
  );
}
