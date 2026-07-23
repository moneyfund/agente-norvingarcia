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
            <p className="text-sm text-slate-400">{i.tipoPropiedad}</p>
            <p className="text-sm text-slate-400">{i.ciudad || 'Ciudad no definida'} · {i.zona || 'Zona no definida'}</p>
            <p className="text-sm">{new Date(i.createdAt).toLocaleString()}</p>
            <p className="font-bold text-amber-300">${Number(i.valorFinal).toFixed(2)}</p>
            {i.referenciaBase?.precioBaseFueEditado && <span className="mt-2 inline-flex rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-100">Precio base ajustado</span>}
            <div className="mt-3 flex flex-wrap gap-2">
              <Link to={`/avaluos/${i.id}`} className="inline-flex items-center rounded-xl border border-amber-400 px-4 py-2 font-semibold text-amber-100 hover:bg-amber-400/10">
                Vista previa
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
