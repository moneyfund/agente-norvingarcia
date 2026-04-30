import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  FileText,
  Home,
  Landmark,
  MapPin,
  Save,
  TriangleAlert,
  Upload,
  Wifi,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import {
  createListadoPropiedad,
  getListadoPropiedades,
  updateListadoPropiedad,
  uploadListadoImages,
} from '../services/listadoService';

const initialForm = {
  codigoInterno: '',
  fechaCaptacion: '',
  tipoPropiedad: 'casa',
  asesorResponsable: '',
  departamento: '',
  municipio: '',
  zona: '',
  direccionReferencia: '',
  ubicacionGPS: '',
  areaTotal: '',
  areaConstruida: '',
  topografia: 'plano',
  usoActual: '',
  usoPotencial: '',
  habitaciones: '',
  banos: '',
  sala: false,
  comedor: false,
  cocina: false,
  garaje: false,
  energia: false,
  agua: 'potable',
  tipoSuelo: '',
  acceso: 'asfalto',
  accesoInvierno: false,
  serviciosDisponibles: [],
  manzanasHectareas: '',
  tipoUso: 'ganadero',
  fuentesAgua: [],
  infraestructura: [],
  tipoPasto: '',
  cercas: false,
  tipoLocal: '',
  estacionamiento: '',
  servicios: '',
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
  imagenes: [],
};

const toggleArray = (arr, value) => (arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);

function Card({ icon: Icon, title, children }) {
  return (
    <section className="rounded-2xl border bg-white p-4 shadow-sm">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-800">
        <Icon size={18} className="text-blue-700" /> {title}
      </h2>
      <div className="grid gap-3 md:grid-cols-2">{children}</div>
    </section>
  );
}

function ListadoPage() {
  const { user } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState({ zona: '', tipoPropiedad: '', precioMax: '' });
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [autoSave, setAutoSave] = useState(true);
  const [previewUrls, setPreviewUrls] = useState([]);
  const sectionRefs = useRef({});

  const loadItems = async () => {
    const data = await getListadoPropiedades({ zona: search.zona, tipoPropiedad: search.tipoPropiedad });
    setItems(data);
  };

  useEffect(() => { loadItems(); }, []);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  useEffect(() => {
    if (!autoSave || !editingId) return undefined;
    const timeout = setTimeout(() => {
      updateListadoPropiedad(editingId, form).catch(() => {});
    }, 1200);
    return () => clearTimeout(timeout);
  }, [form, editingId, autoSave]);

  const visibleItems = useMemo(() => {
    const max = Number(search.precioMax || 0);
    if (!max) return items;
    return items.filter((item) => Number(item.precioSolicitado || 0) <= max);
  }, [items, search.precioMax]);

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    if (!form.tipoPropiedad || !form.precioSolicitado || !form.departamento || !form.municipio || !form.zona) {
      throw new Error('Completa campos obligatorios: tipo, precio y ubicación (departamento/municipio/zona).');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      validate();
      if (!user?.uid) throw new Error('No hay usuario autenticado. Inicia sesión para guardar.');

      let propertyId = editingId;
      if (editingId) {
        await updateListadoPropiedad(editingId, { ...form, fechaCaptacion: form.fechaCaptacion || new Date().toISOString() });
      } else {
        const created = await createListadoPropiedad({ ...form, fechaCaptacion: new Date().toISOString() }, user.uid);
        propertyId = created.id;
      }

      if (files.length && propertyId) {
        const urls = await uploadListadoImages(files, propertyId);
        await updateListadoPropiedad(propertyId, { imagenes: [...(form.imagenes || []), ...urls] });
      }

      setSuccess('Propiedad guardada correctamente');
      await loadItems();
      setForm(initialForm);
      setFiles([]);
      setEditingId(null);
    } catch (submitError) {
      setError(submitError.message || 'No se pudo guardar la propiedad en Firestore.');
    } finally {
      setSaving(false);
    }
  };

  const renderDynamicFields = () => {
    if (form.tipoPropiedad === 'casa') {
      return (<>
        <input className="rounded border p-3" placeholder="Habitaciones" value={form.habitaciones} onChange={(e) => handleChange('habitaciones', e.target.value)} />
        <input className="rounded border p-3" placeholder="Baños" value={form.banos} onChange={(e) => handleChange('banos', e.target.value)} />
        {['sala', 'comedor', 'cocina', 'garaje', 'energia'].map((key) => <label key={key} className="flex items-center gap-2 rounded border p-3"><input type="checkbox" checked={form[key]} onChange={(e) => handleChange(key, e.target.checked)} /> {key}</label>)}
        <select className="rounded border p-3" value={form.agua} onChange={(e) => handleChange('agua', e.target.value)}><option value="potable">Agua potable</option><option value="pozo">Pozo</option><option value="otro">Otro</option></select>
      </>);
    }
    if (form.tipoPropiedad === 'terreno') {
      return (<>
        <input className="rounded border p-3" placeholder="Tipo de suelo" value={form.tipoSuelo} onChange={(e) => handleChange('tipoSuelo', e.target.value)} />
        <input className="rounded border p-3" placeholder="Topografía" value={form.topografia} onChange={(e) => handleChange('topografia', e.target.value)} />
        <select className="rounded border p-3" value={form.acceso} onChange={(e) => handleChange('acceso', e.target.value)}><option value="asfalto">Asfalto</option><option value="balastre">Balastre</option><option value="tierra">Tierra</option></select>
        <label className="flex items-center gap-2 rounded border p-3"><input type="checkbox" checked={form.accesoInvierno} onChange={(e) => handleChange('accesoInvierno', e.target.checked)} />Acceso en invierno</label>
        {['agua', 'energia', 'internet', 'drenaje'].map((s) => <label key={s} className="flex items-center gap-2 rounded border p-3"><input type="checkbox" checked={form.serviciosDisponibles.includes(s)} onChange={() => handleChange('serviciosDisponibles', toggleArray(form.serviciosDisponibles, s))} />{s}</label>)}
      </>);
    }
    if (form.tipoPropiedad === 'finca') {
      return (<>
        <input className="rounded border p-3" placeholder="Manzanas / hectáreas" value={form.manzanasHectareas} onChange={(e) => handleChange('manzanasHectareas', e.target.value)} />
        <select className="rounded border p-3" value={form.tipoUso} onChange={(e) => handleChange('tipoUso', e.target.value)}><option value="ganadero">Ganadero</option><option value="agricola">Agrícola</option><option value="mixto">Mixto</option></select>
        {['rio', 'quebrada', 'pozo', 'naciente'].map((f) => <label key={f} className="flex items-center gap-2 rounded border p-3"><input type="checkbox" checked={form.fuentesAgua.includes(f)} onChange={() => handleChange('fuentesAgua', toggleArray(form.fuentesAgua, f))} />{f}</label>)}
        {['casa', 'corrales', 'galeras'].map((i) => <label key={i} className="flex items-center gap-2 rounded border p-3"><input type="checkbox" checked={form.infraestructura.includes(i)} onChange={() => handleChange('infraestructura', toggleArray(form.infraestructura, i))} />{i}</label>)}
        <input className="rounded border p-3" placeholder="Tipo de pasto" value={form.tipoPasto} onChange={(e) => handleChange('tipoPasto', e.target.value)} />
        <label className="flex items-center gap-2 rounded border p-3"><input type="checkbox" checked={form.cercas} onChange={(e) => handleChange('cercas', e.target.checked)} />Cercas</label>
      </>);
    }
    return (<>
      <input className="rounded border p-3" placeholder="Tipo de local" value={form.tipoLocal} onChange={(e) => handleChange('tipoLocal', e.target.value)} />
      <input className="rounded border p-3" placeholder="Área construida" value={form.areaConstruida} onChange={(e) => handleChange('areaConstruida', e.target.value)} />
      <input className="rounded border p-3" placeholder="Baños" value={form.banos} onChange={(e) => handleChange('banos', e.target.value)} />
      <input className="rounded border p-3" placeholder="Estacionamiento" value={form.estacionamiento} onChange={(e) => handleChange('estacionamiento', e.target.value)} />
      <input className="rounded border p-3 md:col-span-2" placeholder="Servicios" value={form.servicios} onChange={(e) => handleChange('servicios', e.target.value)} />
    </>);
  };

  return (
    <div className="mx-auto max-w-6xl p-4 pb-24">
      <h1 className="mb-3 text-2xl font-bold">Captación profesional de propiedades</h1>
      <div className="mb-4 flex flex-wrap gap-2">
        {['id', 'ubicacion', 'datos', 'caracteristicas', 'precio'].map((s) => <button key={s} type="button" className="rounded bg-slate-100 px-3 py-2 text-sm" onClick={() => sectionRefs.current[s]?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>{s}</button>)}
      </div>
      {success && <div className="mb-3 flex items-center gap-2 rounded border border-emerald-200 bg-emerald-50 p-3 text-emerald-700"><CheckCircle2 size={18} />{success}</div>}
      {error && <div className="mb-3 flex items-center gap-2 rounded border border-red-200 bg-red-50 p-3 text-red-700"><TriangleAlert size={18} />{error}</div>}

      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div ref={(el) => { sectionRefs.current.id = el; }}><Card icon={FileText} title="Identificación">
          <input className="rounded border p-3" value={form.codigoInterno} placeholder="Código interno (auto)" disabled />
          <select className="rounded border p-3" value={form.tipoPropiedad} onChange={(e) => handleChange('tipoPropiedad', e.target.value)}><option value="casa">Casa</option><option value="terreno">Terreno</option><option value="finca">Finca</option><option value="comercial">Comercial</option></select>
          <input className="rounded border p-3" placeholder="Asesor responsable" value={form.asesorResponsable} onChange={(e) => handleChange('asesorResponsable', e.target.value)} />
          <input className="rounded border p-3" value={form.fechaCaptacion} placeholder="Fecha captación (auto)" disabled />
        </Card></div>
        <div ref={(el) => { sectionRefs.current.ubicacion = el; }}><Card icon={MapPin} title="Ubicación">
          {['departamento', 'municipio', 'zona', 'direccionReferencia', 'ubicacionGPS'].map((f) => <input key={f} className="rounded border p-3" placeholder={f} value={form[f]} onChange={(e) => handleChange(f, e.target.value)} />)}
        </Card></div>
        <div ref={(el) => { sectionRefs.current.datos = el; }}><Card icon={Landmark} title="Datos generales">
          {['areaTotal', 'areaConstruida', 'topografia', 'usoActual', 'usoPotencial'].map((f) => <input key={f} className="rounded border p-3" placeholder={f} value={form[f]} onChange={(e) => handleChange(f, e.target.value)} />)}
        </Card></div>
        <div ref={(el) => { sectionRefs.current.caracteristicas = el; }}><Card icon={Home} title="Características dinámicas">{renderDynamicFields()}</Card></div>
        <Card icon={Wifi} title="Servicios y entorno">
          <select className="rounded border p-3" value={form.senal} onChange={(e) => handleChange('senal', e.target.value)}><option value="excelente">Señal excelente</option><option value="buena">Señal buena</option><option value="regular">Señal regular</option></select>
          <label className="flex items-center gap-2 rounded border p-3"><input type="checkbox" checked={form.internet} onChange={(e) => handleChange('internet', e.target.checked)} />Internet</label>
          {['escuela', 'hospital', 'mercado', 'transporte'].map((c) => <label key={c} className="flex items-center gap-2 rounded border p-3"><input type="checkbox" checked={form.cercania.includes(c)} onChange={() => handleChange('cercania', toggleArray(form.cercania, c))} />{c}</label>)}
        </Card>
        <Card icon={Building2} title="Estado y documentación">
          <select className="rounded border p-3" value={form.estadoGeneral} onChange={(e) => handleChange('estadoGeneral', e.target.value)}><option value="excelente">Excelente</option><option value="bueno">Bueno</option><option value="regular">Regular</option></select>
          <textarea className="rounded border p-3 md:col-span-2" placeholder="Necesita mejoras" value={form.necesitaMejoras} onChange={(e) => handleChange('necesitaMejoras', e.target.value)} />
          {['escritura', 'plano', 'impuestos'].map((k) => <label key={k} className="flex items-center gap-2 rounded border p-3"><input type="checkbox" checked={form[k]} onChange={(e) => handleChange(k, e.target.checked)} />{k}</label>)}
          <textarea className="rounded border p-3 md:col-span-2" placeholder="Observaciones legales" value={form.observacionesLegales} onChange={(e) => handleChange('observacionesLegales', e.target.value)} />
        </Card>
        <div ref={(el) => { sectionRefs.current.precio = el; }}><Card icon={Save} title="Precio y diferenciales">
          {['precioSolicitado', 'precioSugerido', 'formaPago', 'diferencial1', 'diferencial2', 'diferencial3'].map((f) => <input key={f} className="rounded border p-3" placeholder={f} value={form[f]} onChange={(e) => handleChange(f, e.target.value)} />)}
          <label className="flex items-center gap-2 rounded border p-3"><input type="checkbox" checked={form.negociable} onChange={(e) => handleChange('negociable', e.target.checked)} />Negociable</label>
        </Card></div>
        <Card icon={Upload} title="Media">
          <input className="rounded border p-3 md:col-span-2" type="file" accept="image/*" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} />
          <div className="md:col-span-2 grid grid-cols-3 gap-2">{previewUrls.map((src) => <img key={src} src={src} alt="preview" className="h-24 w-full rounded object-cover" />)}</div>
        </Card>

        <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-white/95 p-3 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2">
            <button type="submit" disabled={saving} className="rounded-lg bg-blue-700 px-4 py-3 text-white">{saving ? 'Guardando...' : 'Guardar propiedad'}</button>
            <button type="button" className="rounded-lg bg-slate-900 px-4 py-3 text-white" onClick={() => handleChange('diferencial1', `${form.tipoPropiedad} en ${form.zona}, ${form.municipio}. Precio: ${form.precioSolicitado}`)}>Generar descripción</button>
            <button type="button" className="rounded-lg bg-emerald-700 px-4 py-3 text-white" onClick={() => navigator.clipboard.writeText(`${form.tipoPropiedad.toUpperCase()} | ${form.zona} | Q${form.precioSolicitado} | ${form.diferencial1}`)}>Copiar para WhatsApp</button>
            <label className="ml-auto flex items-center gap-2 text-sm"><input type="checkbox" checked={autoSave} onChange={(e) => setAutoSave(e.target.checked)} />Autoguardado</label>
          </div>
        </div>
      </form>

      <div className="mt-8 rounded-xl bg-white p-4 shadow">
        <h3 className="mb-3 font-semibold">Debug Firestore</h3>
        <p className="text-sm">Firebase DB: {String(!!import.meta.env.VITE_FIREBASE_API_KEY)} | Auth: {user?.uid ? 'OK' : 'Sin sesión'}</p>
        <p className="text-xs text-slate-500">Para writes en Firestore revisa reglas en firestore.rules y permite create/update para usuarios autenticados.</p>
      </div>

      <div className="mt-8 grid gap-3 md:grid-cols-2">
        {visibleItems.map((item) => (
          <div key={item.id} className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">{item.codigoInterno} · {item.tipoPropiedad}</p>
            <h3 className="font-semibold">{item.zona} - Q{item.precioSolicitado}</h3>
            <button className="text-sm font-semibold text-blue-700" onClick={() => { setForm(item); setEditingId(item.id); }}>Editar</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ListadoPage;
