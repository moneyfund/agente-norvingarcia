import { ZONAS_POR_CIUDAD } from '../constants/locations';
import { M2_POR_MANZANA } from '../engine/terreno.engine';

const CIUDAD_UNICA = 'Matagalpa';
const unidadesArea = [
  { value: 'm2', label: 'Metros cuadrados' },
  { value: 'manzana', label: 'Manzanas' },
];
const tipoTerritorio = ['Urbano', 'Semiurbano', 'Semirural', 'Rural cercano', 'Rural productivo', 'Rural aislado'];
const tipoSuelo = ['Suelo firme', 'Suelo arcilloso', 'Suelo rocoso', 'Suelo arenoso', 'Suelo húmedo', 'Suelo agrícola fértil', 'Suelo mixto'];
const topografias = ['Plano', 'Semi plano', 'Ondulado', 'Inclinado', 'Muy inclinado', 'Quebrado'];
const accesosGenerales = ['Excelente', 'Bueno', 'Regular', 'Difícil', 'Muy difícil'];
const tiposVia = ['Carretera pavimentada', 'Calle adoquinada', 'Calle de concreto', 'Macadán', 'Tierra transitable', 'Camino rural', 'Vereda'];
const nivelesTrafico = ['Alto', 'Medio', 'Bajo', 'Muy bajo'];
const seguridad = ['Alta', 'Media alta', 'Media', 'Baja'];
const formas = ['Regular', 'Irregular leve', 'Irregular compleja', 'Esquinero', 'Fondo amplio', 'Frente amplio'];
const entornos = ['Residencial premium', 'Residencial medio', 'Comercial', 'Mixto', 'Popular', 'Rural productivo', 'Natural/turístico'];
const usos = ['Residencial', 'Comercial', 'Mixto', 'Lotificación', 'Agrícola', 'Ganadero', 'Turístico', 'Industrial liviano', 'Reserva natural'];
const desarrollo = ['Consolidado', 'En crecimiento', 'Emergente', 'Bajo desarrollo', 'Sin desarrollo urbano'];
const deforestacion = ['Sin deforestación', 'Baja', 'Media', 'Alta', 'Muy alta'];
const proximidades = ['Cerca de ciudad principal', 'Cerca de comunidad', 'Remoto'];
const estadosLegales = ['Documentación completa', 'Documentación revisable', 'Problemas legales'];
const recursos = ['Fuente de agua', 'Río o quebrada', 'Pozo', 'Árboles maderables', 'Vista panorámica', 'Área cultivable', 'Ninguno'];
const serviciosBasicos = [
  ['agua', 'Agua potable'],
  ['energia', 'Energía eléctrica / luz'],
  ['drenaje', 'Sistema de drenaje'],
  ['senalTelefonica', 'Acceso a señal telefónica'],
  ['internet', 'Acceso a internet'],
];
const riesgos = ['Riesgo de inundación', 'Riesgo de deslizamiento', 'Zona de difícil acceso', 'Conflicto de servidumbre', 'Ninguno'];
const legacyTopografias = ['Plano', 'Semi plano', 'Inclinado', 'Quebrado'];
const legacyAccesos = ['Pavimentado', 'Adoquinado', 'Macadán', 'Tierra'];
const legacyUsos = ['Residencial', 'Comercial', 'Mixto', 'Turístico'];
const legacyFormas = ['Regular', 'Irregular', 'Esquinero', 'Fondo amplio'];
const legacyNiveles = ['Alto', 'Medio', 'Bajo'];
const legacyExposiciones = ['Alta', 'Media', 'Baja'];
const legacyEntornos = ['Residencial premium', 'Residencial media', 'Comercial', 'Mixto', 'Popular'];
const legacyDesarrollo = ['Consolidado', 'Crecimiento', 'Emergente', 'Bajo desarrollo'];


function GeneralReportFields({ value, onChange }) {
  const selectedGallery = value.imagenesAdicionalesFiles || [];
  const accept = 'image/jpeg,image/jpg,image/png,image/webp';
  return <div className='mb-5 rounded-2xl border border-amber-500/30 bg-slate-950/70 p-4'>
    <h3 className='text-lg font-semibold text-amber-100'>Datos generales para informe PDF</h3>
    <p className='mt-1 text-sm text-slate-300'>Estos datos se guardan en Firestore y se usan para generar el informe profesional descargable.</p>
    <div className='mt-4 grid gap-4 md:grid-cols-2'>
      {field('Nombre del agente evaluador *', 'agenteEvaluador', value, onChange)}
      {field('Teléfono del agente (opcional)', 'telefonoAgente', value, onChange)}
      <label className={base}><span>Imagen principal de la propiedad</span><input type='file' accept={accept} className='mt-2 w-full rounded bg-slate-800 p-2 text-sm' onChange={e => onChange('imagenPrincipalFile', e.target.files?.[0] || null)} /><small className='text-slate-400'>Recomendado. JPG, JPEG, PNG o WEBP. Máximo 10 MB.</small></label>
      <label className={base}><span>Fotografías adicionales (máximo 5)</span><input type='file' accept={accept} multiple className='mt-2 w-full rounded bg-slate-800 p-2 text-sm' onChange={e => onChange('imagenesAdicionalesFiles', Array.from(e.target.files || []))} /><small className='text-slate-400'>{selectedGallery.length}/5 seleccionadas. Cada imagen debe pesar máximo 10 MB.</small></label>
    </div>
  </div>;
}

export default function TerrenoForm({ value, onChange, onSubmit, loading, showSubmit = true }) {
  const zonasDisponibles = ZONAS_POR_CIUDAD[CIUDAD_UNICA] || [];

  if (!showSubmit) {
    const ciudadSeleccionada = value.ciudad || CIUDAD_UNICA;
    return <div className='text-slate-200'><GeneralReportFields value={value} onChange={onChange} /><div className='grid gap-4 md:grid-cols-2'>
      {field('Título del avalúo', 'titulo', value, onChange)}
      {selectField({ label: 'Ciudad', val: ciudadSeleccionada, opts: [CIUDAD_UNICA], onChange: (ciudad) => onChange('ciudad', ciudad) })}
      {selectField({
        label: 'Zona',
        val: value.zona || '',
        opts: zonasDisponibles.map((z) => z.zona),
        onChange: (zonaNombre) => {
          const zonaCompleta = zonasDisponibles.find((z) => z.zona === zonaNombre) || null;
          onChange('zona', zonaNombre);
          onChange('zonaData', zonaCompleta);
        },
      })}
      {num('Área terreno m²', 'areaTerreno', value, onChange)}
      {num('Frente terreno (m)', 'frenteTerreno', value, onChange)}
      {num('Fondo terreno (m)', 'fondoTerreno', value, onChange)}
      {selectField({ label: 'Topografía', val: value.topografia || '', opts: legacyTopografias, onChange: (v) => onChange('topografia', v) })}
      {selectField({ label: 'Acceso', val: value.acceso || '', opts: legacyAccesos, onChange: (v) => onChange('acceso', v) })}
      {selectField({ label: 'Uso potencial', val: value.usoPotencial || '', opts: legacyUsos, onChange: (v) => onChange('usoPotencial', v) })}
      {selectField({ label: 'Forma terreno', val: value.formaTerreno || '', opts: legacyFormas, onChange: (v) => onChange('formaTerreno', v) })}
      {selectField({ label: 'Nivel comercial', val: value.nivelComercial || '', opts: legacyNiveles, onChange: (v) => onChange('nivelComercial', v) })}
      {selectField({ label: 'Exposición comercial', val: value.exposicionComercial || '', opts: legacyExposiciones, onChange: (v) => onChange('exposicionComercial', v) })}
      {selectField({ label: 'Tipo entorno', val: value.tipoEntorno || '', opts: legacyEntornos, onChange: (v) => onChange('tipoEntorno', v) })}
      {selectField({ label: 'Desarrollo urbano', val: value.desarrolloUrbano || '', opts: legacyDesarrollo, onChange: (v) => onChange('desarrolloUrbano', v) })}
      {selectField({ label: 'Densidad urbana', val: value.densidadUrbana || '', opts: legacyNiveles, onChange: (v) => onChange('densidadUrbana', v) })}
      <ServiciosBasicosChecks value={value.serviciosBasicos || {}} onChange={(s) => onChange('serviciosBasicos', s)} />
      <tog label='Esquina' val={!!value.esquina} onChange={(v) => onChange('esquina', v)} />
      <tog label='Cercanía principal' val={!!value.cercaniaPrincipal} onChange={(v) => onChange('cercaniaPrincipal', v)} />
      <tog label='Cercanía comercial' val={!!value.cercaniaComercial} onChange={(v) => onChange('cercaniaComercial', v)} />
      <tog label='Pendiente fuerte' val={!!value.pendiente} onChange={(v) => onChange('pendiente', v)} />
      <tog label='Riesgo inundación' val={!!value.riesgoInundacion} onChange={(v) => onChange('riesgoInundacion', v)} />
      <tog label='Potencial subdivisión' val={!!value.potencialSubdivision} onChange={(v) => onChange('potencialSubdivision', v)} />
      {selectField({ label: 'Seguridad zona', val: value.seguridadZona || '', opts: legacyNiveles, onChange: (v) => onChange('seguridadZona', v) })}
      {selectField({ label: 'Nivel tráfico', val: value.nivelTrafico || '', opts: legacyNiveles, onChange: (v) => onChange('nivelTrafico', v) })}
    </div></div>;
  }

  const unidadArea = value.unidadArea || 'm2';
  const areaOriginal = Number(value.areaOriginal || value.areaTerreno || 0);
  const areaM2Convertida = unidadArea === 'manzana' ? areaOriginal * M2_POR_MANZANA : areaOriginal;

  const setArea = (nextArea, nextUnit = unidadArea) => {
    const area = Number(nextArea);
    const converted = nextUnit === 'manzana' ? area * M2_POR_MANZANA : area;
    onChange('areaOriginal', area);
    onChange('unidadArea', nextUnit);
    onChange('areaM2Convertida', converted);
    onChange('areaTerreno', converted);
  };

  return <div className='text-slate-200'>
    <GeneralReportFields value={value} onChange={onChange} />
    <div className='mb-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4'>
      <h2 className='text-lg font-semibold text-amber-100'>Ficha técnica profesional de terreno</h2>
      <p className='mt-1 text-sm text-amber-50/80'>Campos cerrados, cuantificables y conectados al motor técnico para solares urbanos, áreas semiurbanas y terrenos rurales de Matagalpa.</p>
    </div>

    <div className='grid gap-4 md:grid-cols-2'>
      {field('Título del avalúo', 'titulo', value, onChange)}
      {selectField({ label: 'Ciudad', val: CIUDAD_UNICA, opts: [CIUDAD_UNICA], onChange: () => onChange('ciudad', CIUDAD_UNICA) })}
      {selectField({
        label: 'Zona / ubicación en Matagalpa',
        val: value.zona || '',
        opts: zonasDisponibles.map((z) => z.zona),
        onChange: (zonaNombre) => {
          const zonaCompleta = zonasDisponibles.find((z) => z.zona === zonaNombre) || null;
          onChange('ciudad', CIUDAD_UNICA);
          onChange('zona', zonaNombre);
          onChange('zonaData', zonaCompleta);
        },
      })}
      {selectField({ label: 'Unidad de área', val: unidadArea, opts: unidadesArea, onChange: (v) => setArea(areaOriginal, v) })}
      {num(unidadArea === 'manzana' ? 'Área original (manzanas)' : 'Área original (m²)', 'areaOriginal', { ...value, areaOriginal }, (k, v) => setArea(v))}
      <div className={base}><span>Área convertida a m²</span><p className='mt-2 rounded bg-slate-800 p-2 font-semibold text-emerald-200'>{areaM2Convertida ? areaM2Convertida.toLocaleString('es-NI', { maximumFractionDigits: 2 }) : '0'} m²</p>{unidadArea === 'manzana' && <p className='mt-2 text-xs text-amber-100'>Para terrenos grandes, el precio por m² disminuye según la extensión de la propiedad.</p>}</div>
    </div>

    <Section title='Clasificación territorial y suelo'>
      {selectField({ label: 'Categoría territorial', val: value.tipoTerritorio || '', opts: tipoTerritorio, onChange: (v) => onChange('tipoTerritorio', v) })}
      {selectField({ label: 'Tipo de suelo', val: value.tipoSuelo || '', opts: tipoSuelo, onChange: (v) => onChange('tipoSuelo', v) })}
      {selectField({ label: 'Topografía', val: value.topografia || '', opts: topografias, onChange: (v) => onChange('topografia', v) })}
      {selectField({ label: 'Forma del terreno', val: value.formaTerreno || '', opts: formas, onChange: (v) => onChange('formaTerreno', v) })}
    </Section>

    <Section title='Acceso, vía y dinámica comercial'>
      {selectField({ label: 'Acceso general', val: value.accesoGeneral || '', opts: accesosGenerales, onChange: (v) => onChange('accesoGeneral', v) })}
      {selectField({ label: 'Tipo de calle / vía', val: value.tipoVia || '', opts: tiposVia, onChange: (v) => onChange('tipoVia', v) })}
      {selectField({ label: 'Nivel de tráfico', val: value.nivelTrafico || '', opts: nivelesTrafico, onChange: (v) => onChange('nivelTrafico', v) })}
      {selectField({ label: 'Seguridad de la zona', val: value.seguridadZona || '', opts: seguridad, onChange: (v) => onChange('seguridadZona', v) })}
    </Section>

    <Section title='Entorno, uso y desarrollo'>
      {selectField({ label: 'Entorno', val: value.entorno || '', opts: entornos, onChange: (v) => onChange('entorno', v) })}
      {selectField({ label: 'Uso potencial', val: value.usoPotencial || '', opts: usos, onChange: (v) => onChange('usoPotencial', v) })}
      {selectField({ label: 'Desarrollo urbano', val: value.desarrolloUrbano || '', opts: desarrollo, onChange: (v) => onChange('desarrolloUrbano', v) })}
      {selectField({ label: 'Cercanía', val: value.proximity || '', opts: proximidades, onChange: (v) => onChange('proximity', v) })}
      {selectField({ label: 'Nivel de deforestación', val: value.nivelDeforestacion || '', opts: deforestacion, onChange: (v) => onChange('nivelDeforestacion', v) })}
      {selectField({ label: 'Seguridad jurídica', val: value.legalStatus || 'Documentación completa', opts: estadosLegales, onChange: (v) => onChange('legalStatus', v) })}
    </Section>

    <div className='mt-4 grid gap-4 md:grid-cols-3'>
      <checks title='Recursos naturales' items={recursos} value={value.recursosNaturales || []} onChange={(s) => onChange('recursosNaturales', s)} />
      <ServiciosBasicosChecks value={value.serviciosBasicos || {}} onChange={(s) => onChange('serviciosBasicos', s)} />
      <checks title='Riesgos' items={riesgos} value={value.riesgos || []} onChange={(s) => onChange('riesgos', s)} />
    </div>

    {showSubmit && <button onClick={onSubmit} disabled={loading} className='mt-5 w-full rounded-xl bg-amber-500 px-4 py-3 font-semibold text-slate-900 disabled:opacity-70'>{loading ? 'Calculando...' : 'Calcular avalúo técnico de terreno'}</button>}
  </div>;
}

const base = 'rounded-xl border border-slate-700 bg-slate-900 p-3';
function Section({ title, children }) { return <section className='mt-4'><h3 className='mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400'>{title}</h3><div className='grid gap-4 md:grid-cols-2'>{children}</div></section>; }
function field(label, key, v, onChange) { return <label className={base}><span>{label}</span><input className='mt-2 w-full rounded bg-slate-800 p-2' value={v[key] || ''} onChange={e => onChange(key, e.target.value)} /></label>; }
function num(label, key, v, onChange) { return <label className={base}><span>{label}</span><input type='number' min='0' step='0.01' className='mt-2 w-full rounded bg-slate-800 p-2' value={v[key] || ''} onChange={e => onChange(key, Number(e.target.value))} /></label>; }
function selectField({ label, val, opts, onChange, disabled = false }) { return <label className={base}><span>{label}</span><select disabled={disabled} className='mt-2 w-full rounded bg-slate-800 p-2' value={val} onChange={e => onChange(e.target.value)}><option value=''>Seleccionar</option>{opts.map(o => typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}</select></label>; }
function checks({ title, items, value, onChange }) {
  const selected = Array.isArray(value) ? value : [];
  const toggle = (item, checked) => {
    if (item === 'Ninguno') return onChange(checked ? ['Ninguno'] : []);
    const withoutNone = selected.filter((x) => x !== 'Ninguno');
    return onChange(checked ? [...withoutNone, item] : withoutNone.filter((x) => x !== item));
  };
  return <div className={base}><p className='font-medium'>{title}</p><div className='mt-2 grid gap-2'>{items.map((item) => <label key={item} className='text-sm'><input type='checkbox' checked={selected.includes(item)} onChange={(e) => toggle(item, e.target.checked)} /> {item}</label>)}</div></div>;
}

function ServiciosBasicosChecks({ value, onChange }) { return <div className={base}><p className='font-medium'>Servicios básicos</p><div className='mt-2 grid gap-2'>{serviciosBasicos.map(([k, l]) => <label key={k} className='text-sm'><input type='checkbox' checked={!!value[k]} onChange={(e) => onChange({ ...value, [k]: e.target.checked })} /> {l}</label>)}</div></div>; }
function tog({ label, val, onChange }) { return <label className={base}><span>{label}</span><input type='checkbox' className='ml-3' checked={val} onChange={(e) => onChange(e.target.checked)} /></label>; }
