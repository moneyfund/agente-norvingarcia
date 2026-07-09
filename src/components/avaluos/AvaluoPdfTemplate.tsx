import { Award, BadgeDollarSign, Building2, CheckCircle2, FileText, Home, MapPin, Ruler, ShieldCheck, TrendingUp } from 'lucide-react';
import { generateAvaluoAnalysis } from '../../utils/generateAvaluoAnalysis';
import '../../modules/avaluos/pdf/avaluoPdf.css';

const money = (v: any) => new Intl.NumberFormat('es-NI', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(Number(v || 0));
const num = (v: any) => new Intl.NumberFormat('es-NI', { maximumFractionDigits: 2 }).format(Number(v || 0));
const date = (v: any) => { const d = v?.toDate ? v.toDate() : new Date(v || Date.now()); return d.toLocaleDateString('es-NI', { year: 'numeric', month: 'long', day: 'numeric' }); };
const labelMap: Record<string, string> = {
  proximity: 'Cercanía estratégica', unidadArea: 'Unidad de área', areaM2Convertida: 'Área convertida a m²', areaOriginal: 'Área original', areaTerreno: 'Área de terreno', tipoTerritorio: 'Categoría territorial', tipoSuelo: 'Tipo de suelo', accesoGeneral: 'Acceso general', tipoVia: 'Tipo de vía', recursosNaturales: 'Recursos naturales', serviciosBasicos: 'Servicios básicos', nivelDeforestacion: 'Nivel de deforestación', usoPotencial: 'Uso potencial', desarrolloUrbano: 'Desarrollo urbano', tipoEntorno: 'Tipo de entorno', estadoConservacion: 'Estado de conservación', areaConstruccion: 'Área de construcción', antiguedad: 'Antigüedad', habitaciones: 'Habitaciones', banos: 'Baños', parqueos: 'Parqueos', seguridad: 'Seguridad', exposicionComercial: 'Exposición comercial', flujoVehicular: 'Flujo vehicular', flujoPeatonal: 'Flujo peatonal',
};
const labelize = (k: string) => labelMap[k] || k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/^./, m => m.toUpperCase());
const clean = (v: any) => v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && !v.length);
const yesNo = (v: any) => v ? 'Sí' : 'No';
const text = (v: any): string => Array.isArray(v) ? v.join(', ') : typeof v === 'object' ? Object.entries(v).filter(([,x]) => clean(x)).map(([k,x]) => `${labelize(k)}: ${typeof x === 'boolean' ? yesNo(x) : x}`).join(' · ') : String(v);
const impact = (c: any) => { const n = Number(c || 1); const p = (n - 1) * 100; return `${p > 0 ? '+' : ''}${p.toFixed(1)}%`; };
const confidenceText = (level: any) => {
  const value = String(level || '').toLowerCase();
  if (value.includes('alta') || value.includes('alto')) return 'La confianza alta permite utilizar este resultado como una referencia sólida preliminar para orientar una estrategia comercial inicial.';
  if (value.includes('media') || value.includes('medio')) return 'La confianza media indica que el valor requiere validación complementaria con comparables activos, cierres recientes y condiciones específicas de negociación.';
  return 'La confianza baja refleja alta variabilidad de mercado; se recomienda ampliar evidencias, revisar comparables y confirmar condiciones documentales antes de tomar decisiones.';
};
const coefInterpretation = (factor: any, coeficiente: any) => {
  const f = String(factor || '').toLowerCase();
  const pct = (Number(coeficiente || 1) - 1) * 100;
  if (f.includes('topograf')) return 'Condición física relevante para el aprovechamiento del terreno.';
  if (f.includes('ubic') || f.includes('zona') || f.includes('proxim')) return 'Incide en la demanda, accesibilidad y percepción comercial del sector.';
  if (f.includes('servicio') || f.includes('infraestructura')) return 'Aporta funcionalidad operativa y reduce barreras de desarrollo.';
  if (f.includes('acceso') || f.includes('vía')) return 'Determina conectividad, facilidad de ingreso y exposición del inmueble.';
  if (f.includes('área') || f.includes('area') || f.includes('escala')) return 'Ajusta el valor por dimensión, eficiencia y profundidad del mercado objetivo.';
  if (f.includes('riesgo')) return 'Considera restricciones o contingencias que pueden afectar negociación.';
  if (Math.abs(pct) < 0.1) return 'Variable con efecto neutro dentro del modelo aplicado.';
  return pct > 0 ? 'Factor favorable que fortalece la estimación comercial preliminar.' : 'Factor de ajuste conservador por condiciones específicas observadas.';
};

function Img({ src, alt = 'Imagen de la propiedad', className = '', wrapperClassName = '' }: { src?: string, alt?: string, className?: string, wrapperClassName?: string }) {
  const content = !src ? <div className='avaluo-pdf-img-placeholder'>Imagen no disponible</div> : <img src={src} alt={alt} className={`avaluo-pdf-img ${className}`} />;
  return wrapperClassName ? <div className={wrapperClassName}>{content}</div> : content;
}
const splitAnalysisIntoParagraphs = (value: string) => {
  const raw = String(value || '').trim();
  if (!raw) return [];
  const existing = raw.split(/\n{2,}/).map((p) => p.replace(/\s+/g, ' ').trim()).filter(Boolean);
  const normalized = raw.replace(/\s+/g, ' ').trim();
  if (existing.length >= 2) return existing.slice(0, 2);
  const sentences = normalized.match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g)?.map((sentence) => sentence.trim()).filter(Boolean) || [normalized];
  if (sentences.length <= 1) return [normalized];
  const midpoint = Math.ceil(sentences.length / 2);
  return [sentences.slice(0, midpoint).join(' '), sentences.slice(midpoint).join(' ')].filter(Boolean);
};

function Page({ children, title }: any) { return <section className='avaluo-pdf-page'><div className='avaluo-pdf-accent' /><div className='avaluo-pdf-content'>{title && <h2 className='avaluo-pdf-title'>{title}</h2>}{children}</div><Footer /></section>; }
function Footer() { return <div className='avaluo-pdf-footer'><span>DIAMANTES REALTY GROUP</span><span>www.diamantesrealtygroup.com</span><span>Informe técnico preliminar</span></div>; }
function Card({ icon: Icon = CheckCircle2, label, value }: any) { if (!clean(value)) return null; return <div className='avaluo-pdf-card'><Icon className='avaluo-pdf-card-icon' /><p className='avaluo-pdf-card-label'>{label}</p><p className='avaluo-pdf-card-value'>{value}</p></div>; }
function MiniFact({ label, value }: any) { if (!clean(value)) return null; return <div className='avaluo-pdf-mini-fact'><span>{label}</span><strong>{value}</strong></div>; }
function FeatureGroup({ title, items }: any) { const visible = items.filter(([k, v]: any) => clean(v)); if (!visible.length) return null; return <div className='avaluo-pdf-feature-group'><h3>{title}</h3>{visible.map(([k, v]: any) => <div key={k} className='avaluo-pdf-feature-row'><span>{labelize(k)}</span><strong>{text(v)}</strong></div>)}</div>; }
function RangeBar({ label, value, max }: any) { if (!clean(value)) return null; const width = Math.max(8, Math.min(100, (Number(value || 0) / Math.max(Number(max || value || 1), 1)) * 100)); return <div className='avaluo-pdf-range-row'><div><span>{label}</span><strong>{money(value)}</strong></div><div className='avaluo-pdf-range-track'><i style={{ width: `${width}%` }} /></div></div>; }

export default function AvaluoPdfTemplate({ avaluo }: { avaluo: any }) {
  const agente = avaluo?.agenteEvaluador || 'Agente evaluador no especificado';
  const c = avaluo?.caracteristicas || {};
  const coefs = (Array.isArray(avaluo?.coeficientesAplicados) ? avaluo.coeficientesAplicados : Object.entries(avaluo?.coeficientesAplicados || {}).map(([factor, coeficiente]) => ({ factor: labelize(factor), coeficiente, impacto: impact(coeficiente) }))).filter((coef: any) => clean(coef.factor || coef.nombre));
  const analisis = splitAnalysisIntoParagraphs(avaluo?.analisisProfesional || generateAvaluoAnalysis(avaluo));
  const galeria = (avaluo?.imagenesAdicionalesBase64 || []).filter(Boolean).slice(0, 5);
  const maxRange = Math.max(Number(avaluo?.rangoMercado?.maximo || 0), Number(avaluo?.valorFinal || 0), 1);

  return <div className='avaluo-pdf-template'>
    <Page><div className='avaluo-pdf-logo-row avaluo-pdf-logo-row--cover'><img src='/logo.png' className='logo-pdf logo-pdf--round' /><div><p className='avaluo-pdf-kicker'>DIAMANTES REALTY GROUP</p><h1 className='avaluo-pdf-heading'>INFORME TÉCNICO DE AVALÚO INMOBILIARIO</h1><p className='avaluo-pdf-subheading'>Estimación preliminar de valor comercial</p></div></div><div className='avaluo-pdf-red-band'><span>Análisis inmobiliario profesional</span><strong>{money(avaluo?.valorFinal)}</strong></div><div className='avaluo-pdf-cover-layout'><Img src={avaluo?.imagenPrincipalBase64} alt='Imagen principal de la propiedad' wrapperClassName='avaluo-pdf-cover-image' /><div className='avaluo-pdf-cover-card'><h2>{avaluo?.titulo || 'Avalúo inmobiliario'}</h2><MiniFact label='Tipo de propiedad' value={avaluo?.tipoPropiedad}/><MiniFact label='Ubicación' value={avaluo?.ciudad}/><MiniFact label='Zona' value={avaluo?.zona}/><MiniFact label='Agente evaluador' value={agente}/><MiniFact label='Fecha' value={date(avaluo?.createdAtServer || avaluo?.createdAt)}/><MiniFact label='Valor estimado' value={money(avaluo?.valorFinal)}/></div></div></Page>
    <Page title='Datos generales'><div className='avaluo-pdf-executive'><FileText/><div><h3>Resumen ejecutivo</h3><p>El presente informe resume los principales factores territoriales, físicos y comerciales considerados para estimar el valor preliminar de la propiedad evaluada.</p></div></div><div className='avaluo-pdf-grid-3 avaluo-pdf-tight-grid'><Card icon={Home} label='Tipo' value={avaluo?.tipoPropiedad}/><Card icon={MapPin} label='Ciudad' value={avaluo?.ciudad}/><Card icon={MapPin} label='Zona' value={avaluo?.zona}/><Card icon={Building2} label='Clasificación territorial' value={avaluo?.zonaSnapshot?.clasificacion}/><Card icon={ShieldCheck} label='Tipo de entorno' value={avaluo?.zonaSnapshot?.tipoEntorno || c.entorno || c.tipoEntorno}/><Card label='Factor plusvalía' value={String(avaluo?.zonaSnapshot?.factorPlusvalia || '')}/><Card label='Valor base terreno m²' value={money(avaluo?.zonaSnapshot?.valorTerrenoM2)}/><Card label='Valor construcción m²' value={money(avaluo?.zonaSnapshot?.valorConstruccionM2)}/><Card label='Observación técnica' value={avaluo?.zonaSnapshot?.observacionTecnica}/><Card icon={Ruler} label='Área' value={num(avaluo?.areaM2Convertida || c.areaTerreno || c.areaM2Convertida) + ' m²'}/><Card label='Unidad de área' value={avaluo?.unidadArea || c.unidadArea}/><Card icon={BadgeDollarSign} label='Valor por m²' value={money(avaluo?.valorM2)}/><Card icon={Award} label='Nivel de confianza' value={avaluo?.nivelConfianza}/></div>{!!galeria.length && <div className='avaluo-pdf-mt-24'><h3 className='avaluo-pdf-section-subtitle'>Galería de referencia</h3><div className='avaluo-pdf-grid-3'>{galeria.map((src: string, i: number) => <Img key={src || i} src={src} alt={`Imagen adicional ${i + 1} de la propiedad`} wrapperClassName='avaluo-pdf-gallery-img' />)}</div></div>}</Page>
    <Page title='Características evaluadas'><div className='avaluo-pdf-feature-grid'><FeatureGroup title='Ubicación y entorno' items={Object.entries(c).filter(([k]) => ['proximity','entorno','tipoEntorno','tipoTerritorio','tipoVia','accesoGeneral','desarrolloUrbano','zona','ubicacion'].includes(k))}/><FeatureGroup title='Condiciones físicas' items={Object.entries(c).filter(([k]) => ['areaOriginal','areaM2Convertida','areaTerreno','areaConstruccion','unidadArea','topografia','tipoSuelo','estadoConservacion','antiguedad','riesgos','nivelDeforestacion'].includes(k))}/><FeatureGroup title='Servicios e infraestructura' items={Object.entries(c).filter(([k]) => ['serviciosBasicos','recursosNaturales','seguridad','parqueos','habitaciones','banos'].includes(k))}/><FeatureGroup title='Potencial comercial' items={Object.entries(c).filter(([k]) => ['usoPotencial','exposicionComercial','flujoVehicular','flujoPeatonal','actividadComercial','vocacion'].includes(k))}/></div></Page>
    <Page title='Análisis profesional'><div className='avaluo-pdf-analysis'>{analisis.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div><div className='avaluo-pdf-commercial-interpretation'><h3>Interpretación comercial</h3><p>{confidenceText(avaluo?.nivelConfianza)}</p></div></Page>
    <Page title='Resultado financiero'><div className='avaluo-pdf-value-box'><p className='avaluo-pdf-value-label'>Valor final estimado</p><p className='avaluo-pdf-value'>{money(avaluo?.valorFinal)}</p></div><div className='avaluo-pdf-financial-grid'><div className='avaluo-pdf-range-card'><h3>Rango de mercado</h3><RangeBar label='Rango mínimo' value={avaluo?.rangoMercado?.minimo} max={maxRange}/><RangeBar label='Valor estimado' value={avaluo?.valorFinal} max={maxRange}/><RangeBar label='Rango máximo' value={avaluo?.rangoMercado?.maximo} max={maxRange}/></div><div className='avaluo-pdf-meter-card'><TrendingUp/><span>Valor por m²</span><strong>{money(avaluo?.valorM2)}</strong><small>Indicador unitario de referencia comercial.</small></div></div><p className='avaluo-pdf-note'>El rango estimado representa una referencia comercial preliminar sujeta a negociación, condiciones documentales y comportamiento real del mercado.</p></Page>
    <Page title='Coeficientes y metodología'><p className='avaluo-pdf-method-text'>Los coeficientes aplicados responden a un modelo multicriterio que pondera ubicación, área, acceso, servicios, entorno, uso potencial y condiciones físicas de la propiedad.</p><div className='avaluo-pdf-coef-table'>{coefs.map((coef: any, i: number) => <div key={i} className='avaluo-pdf-coef'><span>{labelize(coef.factor || coef.nombre)}</span><strong>{coef.impacto || impact(coef.coeficiente)}</strong><p>{coef.interpretacion || coefInterpretation(coef.factor || coef.nombre, coef.coeficiente)}</p></div>)}</div><p className='avaluo-pdf-note'>Este informe corresponde a una estimación técnica preliminar generada mediante un modelo multicriterio de ponderación inmobiliaria. No sustituye un avalúo certificado emitido por perito valuador autorizado cuando la ley o una institución financiera lo requiera.</p></Page>
    <Page><div className='avaluo-pdf-closing'><img src='/logo.png' className='logo-pdf logo-pdf--closing' /><h2>DIAMANTES REALTY GROUP</h2><p>Este informe ha sido generado como una herramienta de apoyo técnico y comercial para orientar procesos de compra, venta, negociación o análisis patrimonial.</p><div className='avaluo-pdf-closing-card'><MiniFact label='Agente evaluador' value={agente}/>{avaluo?.telefonoAgente && <MiniFact label='Teléfono' value={avaluo.telefonoAgente}/>}<MiniFact label='Fecha' value={date(new Date())}/><MiniFact label='Web' value='www.diamantesrealtygroup.com'/></div><div className='avaluo-pdf-signature'>Firma del agente evaluador</div></div></Page>
  </div>;
}
