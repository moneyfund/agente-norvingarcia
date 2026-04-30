import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  createListadoPropiedad,
  getListadoPropiedades,
  updateListadoPropiedad,
  uploadListadoImages,
} from '../services/listadoService';

const initialForm = {
  tipoPropiedad: 'casa',
  asesorResponsable: '',
  departamento: '',
  municipio: '',
  zona: '',
  direccionReferencia: '',
  acceso: 'asfalto',
  accesoInvierno: false,
  areaTotal: '',
  areaConstruida: '',
  topografia: 'plano',
  usoActual: '',
  usoPotencial: '',
  habitaciones: '',
  banos: '',
  tieneAgua: false,
  tieneEnergia: false,
  tipoSuelo: '',
  fuentesAgua: [],
  infraestructura: [],
  senal: 'buena',
  internet: false,
  cercania: [],
  estadoGeneral: 'bueno',
  necesitaMejoras: '',
  escritura: false,
  plano: false,
  impuestos: false,
  observacionesLegales: '',
  precioSolicitado: '',
  precioSugerido: '',
  negociable: false,
  formaPago: '',
  diferencial1: '',
  diferencial2: '',
  diferencial3: '',
  ubicacionGPS: '',
  imagenes: [],
};

const toggleArray = (arr, value) => (arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
const yesNo = (value) => (value ? 'Sí' : 'No');
const formatCurrency = (value) => {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount)) return 'N/D';
  return new Intl.NumberFormat('es-NI', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
};
const formatText = (value) => (value || 'N/D');
const formatList = (value) => (Array.isArray(value) && value.length ? value.join(', ') : 'N/D');
const ensureHtml2Pdf = async () => {
  if (window.html2pdf) return window.html2pdf;
  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('No fue posible cargar html2pdf.js'));
    document.body.appendChild(script);
  });
  return window.html2pdf;
};

const buildPdfHtml = (item) => {
  const mediaHtml = (item.imagenes || []).slice(0, 3).map((src, index) => `<img src="${src}" alt="Imagen ${index + 1}" />`).join('');
  const dynamicFeatures = item.tipoPropiedad === 'casa'
    ? `Habitaciones: ${formatText(item.habitaciones)} · Baños: ${formatText(item.banos)}`
    : `Tipo de suelo: ${formatText(item.tipoSuelo)} · Fuentes de agua: ${formatList(item.fuentesAgua)}`;

  return `
    <div class="sheet">
      <header>
        <img src="${window.location.origin}/logo.png" alt="Logo Norvin García" />
        <div>
          <h1>Ficha de Propiedad</h1>
          <p>Norvin García · Agencia inmobiliaria</p>
        </div>
      </header>
      <section>
        <h2>Identificación</h2>
        <div class="grid"><p><strong>Código:</strong> ${formatText(item.codigoInterno)}</p><p><strong>Tipo:</strong> ${formatText(item.tipoPropiedad)}</p></div>
        <p><strong>Ubicación:</strong> ${formatText(item.departamento)}, ${formatText(item.municipio)}, ${formatText(item.zona)}. ${formatText(item.direccionReferencia)}</p>
      </section>
      <section>
        <h2>Datos generales</h2>
        <div class="grid"><p><strong>Área total:</strong> ${formatText(item.areaTotal)}</p><p><strong>Área construida:</strong> ${formatText(item.areaConstruida)}</p></div>
        <p><strong>Topografía:</strong> ${formatText(item.topografia)} · <strong>Uso actual:</strong> ${formatText(item.usoActual)} · <strong>Uso potencial:</strong> ${formatText(item.usoPotencial)}</p>
      </section>
      <section><h2>Características</h2><p>${dynamicFeatures}</p></section>
      <section><h2>Servicios</h2><p>Agua: ${yesNo(item.tieneAgua)} · Energía: ${yesNo(item.tieneEnergia)} · Internet: ${yesNo(item.internet)} · Señal: ${formatText(item.senal)}</p></section>
      <section><h2>Estado y documentación</h2><p><strong>Estado:</strong> ${formatText(item.estadoGeneral)} · <strong>Mejoras:</strong> ${formatText(item.necesitaMejoras)}</p><p>Escritura: ${yesNo(item.escritura)} · Plano: ${yesNo(item.plano)} · Impuestos: ${yesNo(item.impuestos)}</p><p><strong>Observaciones legales:</strong> ${formatText(item.observacionesLegales)}</p></section>
      <section><h2>Precio y diferenciales</h2><p><strong>Precio solicitado:</strong> ${formatCurrency(item.precioSolicitado)} · <strong>Precio sugerido:</strong> ${formatCurrency(item.precioSugerido)} · <strong>Negociable:</strong> ${yesNo(item.negociable)}</p><p><strong>Forma de pago:</strong> ${formatText(item.formaPago)}</p><ul><li>${formatText(item.diferencial1)}</li><li>${formatText(item.diferencial2)}</li><li>${formatText(item.diferencial3)}</li></ul></section>
      <section><h2>Observaciones</h2><p>${formatText(item.ubicacionGPS)}</p></section>
      ${mediaHtml ? `<section><h2>Imágenes</h2><div class="media">${mediaHtml}</div></section>` : ''}
    </div>
  `;
};

function ListadoPage() {
  const { user } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState({ zona: '', tipoPropiedad: '', precioMax: '' });
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [pdfLoadingId, setPdfLoadingId] = useState('');

  const generatePdf = async (item, preview = false) => {
    setPdfLoadingId(item.id);
    try {
      const html2pdf = await ensureHtml2Pdf();
      const wrapper = document.createElement('div');
      wrapper.innerHTML = `
        <style>
          .sheet { font-family: Arial, sans-serif; color: #0f172a; padding: 28px; }
          header { display: flex; gap: 12px; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 16px; }
          header img { width: 56px; height: 56px; object-fit: contain; }
          h1 { margin: 0; font-size: 20px; } h2 { margin: 0 0 8px; font-size: 14px; text-transform: uppercase; letter-spacing: .04em; color: #1d4ed8; }
          p, li { font-size: 12px; line-height: 1.5; margin: 4px 0; } section { margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid #f1f5f9; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; } ul { margin: 6px 0 0 16px; padding: 0; } .media { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
          .media img { width: 100%; height: 130px; object-fit: cover; border-radius: 6px; border: 1px solid #e2e8f0; }
        </style>
        ${buildPdfHtml(item)}
      `;

      const options = { margin: 0.35, filename: `propiedad-${item.codigoInterno || item.id}.pdf`, image: { type: 'jpeg', quality: 0.95 }, html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' } };
      if (preview) {
        const pdf = await html2pdf().from(wrapper).set(options).toPdf().get('pdf');
        window.open(pdf.output('bloburl'), '_blank', 'noopener,noreferrer');
      } else {
        await html2pdf().from(wrapper).set(options).save();
      }
    } finally {
      setPdfLoadingId('');
    }
  };

  const loadItems = async () => {
    const data = await getListadoPropiedades({ zona: search.zona, tipoPropiedad: search.tipoPropiedad });
    setItems(data);
  };

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (editingId) {
        updateListadoPropiedad(editingId, form).catch(() => {});
      }
    }, 2500);
    return () => clearTimeout(timeout);
  }, [form, editingId]);

  const visibleItems = useMemo(() => {
    const max = Number(search.precioMax || 0);
    if (!max) return items;
    return items.filter((item) => Number(item.precioSolicitado || 0) <= max);
  }, [items, search.precioMax]);

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await updateListadoPropiedad(editingId, form);
      } else {
        const created = await createListadoPropiedad({ ...form, fechaCaptacion: new Date().toISOString() }, user.uid);
        setEditingId(created.id);
      }

      if (files.length) {
        const urls = await uploadListadoImages(files, editingId || 'temp');
        await updateListadoPropiedad(editingId, { imagenes: [...(form.imagenes || []), ...urls] });
        setFiles([]);
      }

      await loadItems();
      setForm(initialForm);
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  };

  const generateDescription = () => {
    const text = `${form.tipoPropiedad} en ${form.zona}, ${form.municipio}. Área ${form.areaTotal}. Precio Q${form.precioSolicitado}. Estado ${form.estadoGeneral}.`;
    handleChange('diferencial1', text);
  };

  const copyWhatsapp = async () => {
    const text = `${form.tipoPropiedad.toUpperCase()} | ${form.zona} | Q${form.precioSolicitado} | ${form.diferencial1}`;
    await navigator.clipboard.writeText(text);
  };

  return (
    <div className="mx-auto max-w-6xl p-4">
      <h1 className="mb-4 text-2xl font-bold">Listado interno</h1>
      <div className="mb-4 grid gap-2 rounded-xl bg-white p-3 shadow md:grid-cols-3">
        <input className="rounded border p-3" placeholder="Buscar zona" value={search.zona} onChange={(e) => setSearch((s) => ({ ...s, zona: e.target.value }))} />
        <select className="rounded border p-3" value={search.tipoPropiedad} onChange={(e) => setSearch((s) => ({ ...s, tipoPropiedad: e.target.value }))}>
          <option value="">Tipo</option><option value="casa">Casa</option><option value="finca">Finca</option><option value="terreno">Terreno</option><option value="comercial">Comercial</option>
        </select>
        <input className="rounded border p-3" placeholder="Precio máximo" value={search.precioMax} onChange={(e) => setSearch((s) => ({ ...s, precioMax: e.target.value }))} />
      </div>
      <div className="mb-8 grid gap-3 md:grid-cols-2">
        {visibleItems.map((item) => (
          <div key={item.id} className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">{item.codigoInterno} · {item.tipoPropiedad}</p>
            <h3 className="font-semibold">{item.zona} - Q{item.precioSolicitado}</h3>
            <p className="text-sm">{item.estadoGeneral} · {item.departamento}</p>
            <span className={`inline-block rounded px-2 py-1 text-xs ${item.precioSolicitado && item.diferencial1 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              {item.precioSolicitado && item.diferencial1 ? 'Completa' : 'Incompleta'}
            </span>
            <button className="ml-3 text-sm font-semibold text-blue-700" onClick={() => { setForm(item); setEditingId(item.id); }}>Editar</button>
            <button
              type="button"
              className="ml-3 text-sm font-semibold text-emerald-700"
              onClick={() => generatePdf(item)}
              disabled={pdfLoadingId === item.id}
            >
              {pdfLoadingId === item.id ? 'Generando PDF...' : 'Descargar PDF'}
            </button>
            <button
              type="button"
              className="ml-3 text-sm font-semibold text-slate-700"
              onClick={() => generatePdf(item, true)}
              disabled={pdfLoadingId === item.id}
            >
              Vista previa PDF
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl bg-white p-4 shadow">
        <div className="grid gap-3 md:grid-cols-2">
          <select className="rounded border p-3" value={form.tipoPropiedad} onChange={(e) => handleChange('tipoPropiedad', e.target.value)}><option value="casa">Casa</option><option value="finca">Finca</option><option value="terreno">Terreno</option><option value="comercial">Comercial</option></select>
          <input className="rounded border p-3" placeholder="Asesor responsable" value={form.asesorResponsable} onChange={(e) => handleChange('asesorResponsable', e.target.value)} />
          <input className="rounded border p-3" placeholder="Departamento" value={form.departamento} onChange={(e) => handleChange('departamento', e.target.value)} />
          <input className="rounded border p-3" placeholder="Municipio" value={form.municipio} onChange={(e) => handleChange('municipio', e.target.value)} />
          <input className="rounded border p-3" placeholder="Zona" value={form.zona} onChange={(e) => handleChange('zona', e.target.value)} />
          <input className="rounded border p-3" placeholder="Dirección referencia" value={form.direccionReferencia} onChange={(e) => handleChange('direccionReferencia', e.target.value)} />
          <input className="rounded border p-3" placeholder="Área total" value={form.areaTotal} onChange={(e) => handleChange('areaTotal', e.target.value)} />
          <input className="rounded border p-3" placeholder="Área construida" value={form.areaConstruida} onChange={(e) => handleChange('areaConstruida', e.target.value)} />
          <input className="rounded border p-3" placeholder="Precio solicitado" value={form.precioSolicitado} onChange={(e) => handleChange('precioSolicitado', e.target.value)} />
          <input className="rounded border p-3" placeholder="Precio sugerido" value={form.precioSugerido} onChange={(e) => handleChange('precioSugerido', e.target.value)} />
        </div>

        {form.tipoPropiedad === 'casa' ? (
          <div className="grid gap-3 md:grid-cols-2">
            <input className="rounded border p-3" placeholder="Habitaciones" value={form.habitaciones} onChange={(e) => handleChange('habitaciones', e.target.value)} />
            <input className="rounded border p-3" placeholder="Baños" value={form.banos} onChange={(e) => handleChange('banos', e.target.value)} />
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            <input className="rounded border p-3" placeholder="Tipo de suelo" value={form.tipoSuelo} onChange={(e) => handleChange('tipoSuelo', e.target.value)} />
            <div className="flex flex-wrap gap-2">{['rio', 'quebrada', 'pozo', 'naciente'].map((f) => <label key={f} className="rounded border px-3 py-2 text-sm"><input type="checkbox" checked={form.fuentesAgua.includes(f)} onChange={() => handleChange('fuentesAgua', toggleArray(form.fuentesAgua, f))} /> {f}</label>)}</div>
          </div>
        )}

        <textarea className="rounded border p-3" placeholder="Necesita mejoras" value={form.necesitaMejoras} onChange={(e) => handleChange('necesitaMejoras', e.target.value)} />
        <textarea className="rounded border p-3" placeholder="Observaciones legales" value={form.observacionesLegales} onChange={(e) => handleChange('observacionesLegales', e.target.value)} />
        <input className="rounded border p-3" placeholder="Ubicación GPS" value={form.ubicacionGPS} onChange={(e) => handleChange('ubicacionGPS', e.target.value)} />
        <input multiple type="file" onChange={(e) => setFiles(Array.from(e.target.files || []))} />

        <div className="flex flex-wrap gap-2">
          <button type="submit" className="rounded bg-blue-700 px-4 py-3 font-semibold text-white">{saving ? 'Guardando...' : 'Guardar'}</button>
          <button type="button" className="rounded border px-4 py-3" onClick={generateDescription}>Generar descripción automática</button>
          <button type="button" className="rounded border px-4 py-3" onClick={copyWhatsapp}>Copiar para WhatsApp</button>
        </div>
      </form>
    </div>
  );
}

export default ListadoPage;
