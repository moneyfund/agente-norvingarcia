import { Award, BadgeDollarSign, BarChart3, Building2, Calendar, CheckCircle2, Home, MapPin, Phone, Ruler, ShieldCheck, UserRound } from 'lucide-react';
import { generateAvaluoAnalysis } from '../../utils/generateAvaluoAnalysis';
import '../../modules/avaluos/pdf/avaluoPdf.css';

const money = (v: any) => new Intl.NumberFormat('es-NI', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(Number(v || 0));
const num = (v: any) => new Intl.NumberFormat('es-NI', { maximumFractionDigits: 2 }).format(Number(v || 0));
const date = (v: any) => { const d = v?.toDate ? v.toDate() : new Date(v || Date.now()); return d.toLocaleDateString('es-NI', { year: 'numeric', month: 'long', day: 'numeric' }); };
const labelize = (k: string) => k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/^./, m => m.toUpperCase());
const clean = (v: any) => v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && !v.length);
const text = (v: any): string => Array.isArray(v) ? v.join(', ') : typeof v === 'object' ? Object.entries(v).filter(([,x]) => clean(x)).map(([k,x]) => `${labelize(k)}: ${x ? 'Sí' : 'No'}`).join(' · ') : String(v);
const impact = (c: any) => { const n = Number(c || 1); const p = (n - 1) * 100; return `${p > 0 ? '+' : ''}${p.toFixed(1)}%`; };

function Img({ src, className = '', wrapperClassName = '' }: { src?: string, className?: string, wrapperClassName?: string }) {
  const content = !src
    ? <div className='avaluo-pdf-img-placeholder'>Imagen no disponible</div>
    : <img crossOrigin='anonymous' src={src} className={`avaluo-pdf-img ${className}`} />;
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

export default function AvaluoPdfTemplate({ avaluo }: { avaluo: any }) {
  const agente = avaluo?.agenteEvaluador || 'Agente evaluador no especificado';
  const chars = Object.entries(avaluo?.caracteristicas || {}).filter(([k, v]) => !['zonaData', 'imagenPrincipalFile', 'imagenesAdicionalesFiles'].includes(k) && clean(v));
  const coefs = Array.isArray(avaluo?.coeficientesAplicados) ? avaluo.coeficientesAplicados : Object.entries(avaluo?.coeficientesAplicados || {}).map(([factor, coeficiente]) => ({ factor: labelize(factor), coeficiente, impacto: impact(coeficiente) }));
  const analisis = splitAnalysisIntoParagraphs(avaluo?.analisisProfesional || generateAvaluoAnalysis(avaluo));
  const galeria = (avaluo?.imagenesAdicionales || []).slice(0, 5);
  const factorGlobal = coefs.reduce((acc: number, c: any) => acc * Number(c.coeficiente || 1), 1);

  return <div className='avaluo-pdf-template'>
    <Page><div className='avaluo-pdf-logo-row'><img src='/logo.png' className='logo-pdf logo-pdf--round' /><div><p className='avaluo-pdf-kicker'>Informe premium beta</p><h1 className='avaluo-pdf-heading'>Informe Técnico de Avalúo Inmobiliario</h1></div></div><div className='avaluo-pdf-hero'><p className='avaluo-pdf-hero-type'>{avaluo?.tipoPropiedad || 'Propiedad'}</p><h2 className='avaluo-pdf-hero-title'>{avaluo?.titulo || 'Avalúo inmobiliario'}</h2><p className='avaluo-pdf-location'><MapPin size={18} />{avaluo?.ciudad || 'Ciudad N/D'} · {avaluo?.zona || 'Zona N/D'}</p></div><Img src={avaluo?.imagenPrincipalUrl} wrapperClassName='avaluo-pdf-cover-image' /><div className='avaluo-pdf-grid-2 avaluo-pdf-mt-30'><Card icon={UserRound} label='Agente evaluador' value={agente}/><Card icon={Calendar} label='Fecha' value={date(avaluo?.createdAtServer || avaluo?.createdAt)}/></div></Page>
    <Page title='Datos generales'><div className='avaluo-pdf-grid-3'><Card icon={Home} label='Tipo' value={avaluo?.tipoPropiedad}/><Card icon={MapPin} label='Ciudad' value={avaluo?.ciudad}/><Card icon={MapPin} label='Zona' value={avaluo?.zona}/><Card icon={Building2} label='Clasificación urbana' value={avaluo?.zonaSnapshot?.clasificacion}/><Card icon={ShieldCheck} label='Tipo de entorno' value={avaluo?.caracteristicas?.entorno || avaluo?.caracteristicas?.tipoEntorno}/><Card icon={Ruler} label='Área' value={num(avaluo?.areaM2Convertida || avaluo?.caracteristicas?.areaTerreno) + ' m²'}/><Card label='Unidad de área' value={avaluo?.unidadArea}/><Card icon={BadgeDollarSign} label='Valor por m²' value={money(avaluo?.valorM2)}/><Card icon={Award} label='Nivel de confianza' value={avaluo?.nivelConfianza}/><Card icon={BarChart3} label='Rango de mercado' value={`${money(avaluo?.rangoMercado?.minimo)} - ${money(avaluo?.rangoMercado?.maximo)}`}/></div>{!!galeria.length && <div className='avaluo-pdf-mt-30'><h3 className='avaluo-pdf-section-subtitle'>Galería de referencia</h3><div className='avaluo-pdf-grid-3'>{galeria.map((src: string, i: number) => <Img key={src || i} src={src} wrapperClassName='avaluo-pdf-gallery-img' />)}</div></div>}</Page>
    <Page title='Características evaluadas'><div className='avaluo-pdf-grid-2'>{chars.map(([k, v]) => <Card key={k} label={labelize(k)} value={text(v)}/>)}</div></Page>
    <Page title='Análisis profesional'><div className='avaluo-pdf-analysis'>{analisis.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div></Page>
    <Page title='Resultado financiero'><div className='avaluo-pdf-value-box'><p className='avaluo-pdf-value-label'>Valor final estimado</p><p className='avaluo-pdf-value'>{money(avaluo?.valorFinal)}</p></div><div className='avaluo-pdf-grid-2 avaluo-pdf-mt-24'><Card label='Valor terreno' value={money(avaluo?.valorTerreno)}/><Card label='Valor construcción' value={money(avaluo?.valorConstruccion)}/><Card label='Rango mínimo' value={money(avaluo?.rangoMercado?.minimo)}/><Card label='Rango máximo' value={money(avaluo?.rangoMercado?.maximo)}/><Card label='Valor por m²' value={money(avaluo?.valorM2)}/><Card label='Factor global aplicado' value={factorGlobal.toFixed(3)}/><Card label='Nivel de confianza' value={avaluo?.nivelConfianza}/></div></Page>
    <Page title='Coeficientes y metodología'><div className='avaluo-pdf-stack'>{coefs.map((c: any, i: number) => <div key={i} className='avaluo-pdf-coef'><span>{c.factor || c.nombre}</span><span className='avaluo-pdf-coef-impact'>{c.impacto || impact(c.coeficiente)}</span></div>)}</div><p className='avaluo-pdf-note'>Este informe corresponde a una estimación técnica preliminar generada mediante un modelo multicriterio de ponderación inmobiliaria. No sustituye un avalúo certificado emitido por perito valuador autorizado cuando la ley o una institución financiera lo requiera.</p></Page>
    <Page><div className='avaluo-pdf-center' style={{ marginTop: 80 }}><img src='/logo.png' className='logo-pdf' style={{ margin: '0 auto' }} /><p style={{ marginTop: 40, marginBottom: 0, color: '#0b1f3a', fontSize: 24, fontWeight: 800 }}>{agente}</p>{avaluo?.telefonoAgente && <p className='avaluo-pdf-location' style={{ justifyContent: 'center', color: '#475569' }}><Phone size={18} />{avaluo.telefonoAgente}</p>}<p className='avaluo-pdf-paragraph'>Fecha de emisión: {date(new Date())}</p><div className='avaluo-pdf-signature'>Firma del agente evaluador</div><p className='avaluo-pdf-paragraph' style={{ maxWidth: 560, margin: '62px auto 0' }}>Gracias por confiar en DIAMANTES REALTY GROUP. Este documento se entrega como soporte técnico y comercial para la toma de decisiones inmobiliarias.</p><p className='avaluo-pdf-paragraph' style={{ margin: '14px auto 0', fontWeight: 800, color: '#0b1f3a' }}>www.diamantesrealtygroup.com</p></div></Page>
  </div>;
}
