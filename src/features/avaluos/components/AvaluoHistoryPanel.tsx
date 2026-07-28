import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, ExternalLink, Search } from 'lucide-react';
import DownloadAvaluoPdfButton from '../../../components/avaluos/DownloadAvaluoPdfButton';
import DeleteAvaluoButton from '../../../components/avaluos/DeleteAvaluoButton';

type AvaluoHistoryPanelProps = {
  items: any[];
  onDeleted?: (id: string) => void;
};

export function AvaluoHistoryPanel({ items, onDeleted }: AvaluoHistoryPanelProps) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const filtered = useMemo(() => items.filter((item) => {
    const haystack = `${item.titulo} ${item.ciudad} ${item.zona} ${item.agenteEvaluador}`.toLowerCase();
    return (!query || haystack.includes(query.toLowerCase())) && (!type || item.tipoPropiedad === type);
  }), [items, query, type]);
  return (
    <section id="historial-avaluos" className="avaluo-history">
      <div className="avaluo-history__heading"><div><span>Registro profesional</span><h2>Historial de avalúos</h2><p>Consulta y administra los informes guardados sin generar consultas adicionales.</p></div><div className="avaluo-history__filters"><label><Search /><input aria-label="Buscar avalúos" placeholder="Buscar por título, ciudad o zona" value={query} onChange={(event) => setQuery(event.target.value)} /></label><select aria-label="Filtrar por tipo" value={type} onChange={(event) => setType(event.target.value)}><option value="">Todos los tipos</option><option value="terreno">Terrenos</option><option value="casa">Casas</option></select></div></div>
      <div className="avaluo-history__grid">
        {filtered.map((i) => (
          <article key={i.id} className="avaluo-history-card">
            <div className="avaluo-history-card__top"><span>{i.tipoPropiedad || 'Avalúo'}</span><strong>{i.titulo || 'Avalúo inmobiliario'}</strong><small>{i.ciudad || 'Ciudad no definida'} · {i.zona || 'Zona no definida'}</small></div>
            <div className="avaluo-history-card__meta"><span><CalendarDays /> {new Date(i.createdAt).toLocaleDateString('es-NI')}</span><span>{i.agenteEvaluador || 'Agente no indicado'}</span></div>
            <p className="avaluo-history-card__value"><small>Valor estimado</small>${Number(i.valorFinal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            {i.referenciaBase?.precioBaseFueEditado && <span className="mt-2 inline-flex rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-100">Precio base ajustado</span>}
            <div className="avaluo-history-card__actions">
              <Link to={`/avaluos/${i.id}`} className="avaluo-btn avaluo-btn--secondary"><ExternalLink /> Abrir</Link>
              <DownloadAvaluoPdfButton avaluo={i} />
              <DeleteAvaluoButton avaluo={i} onDeleted={onDeleted} />
            </div>
          </article>
        ))}
        {!filtered.length && <p className="avaluo-history__empty">No hay avalúos que coincidan con los filtros.</p>}
      </div>
    </section>
  );
}
