import { ArrowLeft, Building2, ClipboardCheck, RotateCcw, Save, ShieldCheck } from 'lucide-react';

export const terrenoSteps = ['Datos generales', 'Ubicación y mercado', 'Características físicas', 'Acceso y servicios', 'Entorno y mercado', 'Información legal', 'Revisión y cálculo'];
export const casaSteps = ['Datos generales', 'Ubicación', 'Terreno', 'Construcción', 'Distribución', 'Instalaciones', 'Información legal', 'Revisión y cálculo'];

export function AvaluoHeader({ type, city, onClear }) {
  return <header className="avaluo-header">
    <div className="avaluo-header__icon"><Building2 aria-hidden="true" /></div>
    <div className="avaluo-header__copy"><p className="avaluo-eyebrow">Plataforma profesional de avalúos</p><h1>Valoración inmobiliaria técnica</h1><p>Ubicación, características físicas y comportamiento de mercado integrados en un informe profesional.</p>
      <div className="avaluo-badges"><span><ShieldCheck /> {type ? (type === 'casa' ? 'Casa' : 'Terreno') : 'Nuevo avalúo'}</span><span>{city || 'Ciudad pendiente'}</span><span className="is-draft">Borrador local</span></div>
    </div>
    <div className="avaluo-header__actions"><a href="#historial-avaluos" className="avaluo-btn avaluo-btn--secondary"><ArrowLeft /> Ver historial</a><button type="button" onClick={onClear} className="avaluo-btn avaluo-btn--danger"><RotateCcw /> Limpiar</button></div>
  </header>;
}

export function AvaluoSidebar({ steps, active, onStep, progress, completed }) {
  return <aside className="avaluo-sidebar" aria-label="Etapas del avalúo"><div className="avaluo-progress"><div><span>Progreso del avalúo</span><strong>{progress}%</strong></div><div className="avaluo-progress__track"><i style={{ width: `${progress}%` }} /></div><small>{completed} campos completados</small></div>
    <nav>{steps.map((step, index) => <button type="button" key={step} onClick={() => onStep(index)} className={active === index ? 'is-active' : ''} aria-current={active === index ? 'step' : undefined}><span>{index + 1}</span><div><strong>{step}</strong><small>{index < active ? 'Revisado' : index === active ? 'En curso' : 'Pendiente'}</small></div></button>)}</nav>
  </aside>;
}

export function TechnicalSummary({ type, form, result, progress }) {
  const money = (n) => Number(n || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  const rows = [['Tipo', type === 'casa' ? 'Casa' : type === 'terreno' ? 'Terreno' : '—'], ['Ciudad', form.ciudad || '—'], ['Zona', form.zona || '—'], ['Área', form.areaOriginal ? `${Number(form.areaOriginal).toLocaleString('es-NI')} ${form.unidadArea || form.unidad || 'm²'}` : '—'], ['Precio base', form.precioBaseAplicado ? money(form.precioBaseAplicado) : '—']];
  return <aside className="avaluo-summary"><div className="avaluo-summary__title"><ClipboardCheck /><div><strong>Resumen técnico</strong><span>Actualización en tiempo real</span></div></div>{rows.map(([a,b]) => <div className="avaluo-summary__row" key={a}><span>{a}</span><strong>{b}</strong></div>)}
    {result ? <div className="avaluo-summary__result"><span>Valor estimado</span><strong>{money(result.estimatedValue ?? result.valorFinalEstimado)}</strong><small>{result.nivelConfianza || 'Resultado calculado'}</small></div> : <div className="avaluo-summary__empty"><Save /><p>Completa los datos requeridos para generar el avalúo.</p><small>Estado del formulario: {progress > 65 ? 'listo para revisión' : 'en proceso'}</small></div>}
  </aside>;
}
