import { useEffect, useMemo, useState } from 'react';
import { Download, Eye, FileSearch, Loader2, Pencil } from 'lucide-react';
import { getCaptacionesAdmin } from '../../services/listadoService';

const formatPrice = (value) => {
  const amount = Number(value || 0);
  if (!amount) return 'No definido';
  return new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ', maximumFractionDigits: 0 }).format(amount);
};

const formatDate = (dateLike) => {
  if (!dateLike) return 'Sin fecha';
  const date = dateLike?.toDate ? dateLike.toDate() : new Date(dateLike);
  if (Number.isNaN(date.getTime())) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-GT', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};

function AdminListadosPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({ tipoPropiedad: '', estado: '', zona: '' });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getCaptacionesAdmin();
        setItems(data);
      } catch {
        setError('No se pudieron cargar las captaciones.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filtered = useMemo(() => items.filter((item) => {
    const byType = !filters.tipoPropiedad || item.tipoPropiedad === filters.tipoPropiedad;
    const byStatus = !filters.estado || item.estado === filters.estado;
    const query = filters.zona.trim().toLowerCase();
    const zoneText = `${item.departamento || ''} ${item.municipio || ''} ${item.zona || ''}`.toLowerCase();
    const byZone = !query || zoneText.includes(query);
    return byType && byStatus && byZone;
  }), [items, filters]);

  const ensureHtml2Pdf = async () => {
    if (window.html2pdf) return window.html2pdf;
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
    return window.html2pdf;
  };

  const downloadPdf = async (item) => {
    const html2pdf = await ensureHtml2Pdf();
    const content = document.createElement('div');
    content.className = 'p-8 text-slate-900';
    content.innerHTML = `
      <h1 style="font-size:22px;margin-bottom:8px;">Ficha de captación</h1>
      <p style="color:#475569;margin-bottom:16px;">Código: ${item.codigoInterno || item.id}</p>
      ${Object.entries(item).map(([key, value]) => `<p style="margin:4px 0;"><strong>${key}:</strong> ${Array.isArray(value) ? value.join(', ') : (value ?? '-')}</p>`).join('')}
      ${(item.imagenes || []).map((img) => `<img src="${img}" style="width:100%;max-height:260px;object-fit:cover;margin-top:12px;border-radius:8px;" />`).join('')}
    `;

    await html2pdf().set({
      filename: `captacion-${item.codigoInterno || item.id}.pdf`,
      margin: 10,
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    }).from(content).save();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold">Listados internos</h1>
        <p className="text-sm text-slate-500">Panel CRM para revisar captaciones guardadas en Firestore.</p>
      </div>

      <div className="grid gap-3 rounded-2xl bg-white p-4 shadow-sm md:grid-cols-3">
        <select className="rounded-xl border p-3" value={filters.tipoPropiedad} onChange={(e) => setFilters((p) => ({ ...p, tipoPropiedad: e.target.value }))}>
          <option value="">Todos los tipos</option><option value="casa">Casa</option><option value="terreno">Terreno</option><option value="finca">Finca</option><option value="comercial">Comercial</option>
        </select>
        <select className="rounded-xl border p-3" value={filters.estado} onChange={(e) => setFilters((p) => ({ ...p, estado: e.target.value }))}>
          <option value="">Todos los estados</option><option value="borrador">Borrador</option><option value="publicado">Publicado</option>
        </select>
        <input className="rounded-xl border p-3" placeholder="Buscar por departamento, municipio o zona" value={filters.zona} onChange={(e) => setFilters((p) => ({ ...p, zona: e.target.value }))} />
      </div>

      {loading && <div className="flex items-center gap-2 rounded-2xl bg-white p-5 shadow-sm"><Loader2 className="animate-spin" size={18} /> Cargando captaciones...</div>}
      {!loading && error && <p className="rounded-2xl bg-red-50 p-4 text-red-700">{error}</p>}
      {!loading && !error && !filtered.length && <div className="rounded-2xl bg-white p-10 text-center text-slate-500 shadow-sm">No hay captaciones para mostrar con los filtros actuales.</div>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => (
          <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">{item.tipoPropiedad || 'Sin tipo'}</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">{item.departamento || '-'} · {item.municipio || '-'}</h2>
            <div className="mt-4 space-y-1 text-sm text-slate-600">
              <p><strong>Precio:</strong> {formatPrice(item.precioSolicitado)}</p>
              <p><strong>Área:</strong> {item.areaTotal || 'No definida'}</p>
              <p><strong>Estado:</strong> {item.estado || 'borrador'}</p>
              <p><strong>Creación:</strong> {formatDate(item.createdAt)}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm" onClick={() => setSelected(item)}><Eye size={14} /> Ver detalle</button>
              <button className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm" onClick={() => setSelected(item)}><Pencil size={14} /> Editar</button>
              <button className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-sm text-white" onClick={() => downloadPdf(item)}><Download size={14} /> Descargar PDF</button>
            </div>
          </article>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/60 p-4">
          <div className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between"><h3 className="text-xl font-bold">Detalle completo de captación</h3><button className="rounded-lg border px-3 py-2" onClick={() => setSelected(null)}>Cerrar</button></div>
            <div className="grid gap-3 md:grid-cols-2">
              {Object.entries(selected).map(([key, value]) => (
                <div key={key} className="rounded-xl border border-slate-200 p-3"><p className="text-xs uppercase text-slate-500">{key}</p><p className="text-sm text-slate-800">{Array.isArray(value) ? value.join(', ') : String(value ?? '-')}</p></div>
              ))}
            </div>
            {!!selected.imagenes?.length && <div className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-4">{selected.imagenes.map((img) => <img key={img} src={img} alt="captación" className="h-28 w-full rounded-lg object-cover" />)}</div>}
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-white p-4 text-xs text-slate-500 shadow-sm"><FileSearch size={14} className="mr-2 inline" />Ordenado por fecha de creación (descendente).</div>
    </div>
  );
}

export default AdminListadosPage;
