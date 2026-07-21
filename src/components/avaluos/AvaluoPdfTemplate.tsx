import { Award, BadgeDollarSign, BarChart3, Building2, CheckCircle2, Droplets, FileText, Gavel, Home, Leaf, MapPin, PieChart, Ruler, ShieldCheck, TrendingUp, Waves } from 'lucide-react';
import { generateAvaluoAnalysis } from '../../utils/generateAvaluoAnalysis';
import '../../modules/avaluos/pdf/avaluoPdf.css';

const money = (v: any) => new Intl.NumberFormat('es-NI', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(Number(v || 0));
const num = (v: any) => new Intl.NumberFormat('es-NI', { maximumFractionDigits: 2 }).format(Number(v || 0));
const date = (v: any, fallback = 'Fecha no disponible') => {
  if (v === undefined || v === null || v === '') return fallback;
  const raw = v?.toDate ? v.toDate() : (typeof v?.seconds === 'number' ? new Date(v.seconds * 1000) : v);
  const d = raw instanceof Date ? raw : new Date(raw);
  if (Number.isNaN(d.getTime())) return fallback;
  return d.toLocaleDateString('es-NI', { year: 'numeric', month: 'long', day: 'numeric' });
};
const labelMap: Record<string, string> = {
  proximity: 'Cercanía estratégica', unidadArea: 'Unidad de área', areaM2Convertida: 'Área convertida a m²', areaOriginal: 'Área original', areaTerreno: 'Área de terreno', tipoTerritorio: 'Categoría territorial', tipoSuelo: 'Tipo de suelo', accesoGeneral: 'Acceso general', tipoVia: 'Tipo de vía', recursosNaturales: 'Recursos naturales', serviciosBasicos: 'Servicios básicos', nivelDeforestacion: 'Nivel de deforestación', usoPotencial: 'Uso potencial', desarrolloUrbano: 'Desarrollo urbano', tipoEntorno: 'Tipo de entorno', estadoConservacion: 'Estado de conservación', areaConstruccion: 'Área de construcción', antiguedad: 'Antigüedad', habitaciones: 'Habitaciones', banos: 'Baños', parqueos: 'Parqueos', seguridad: 'Seguridad', exposicionComercial: 'Exposición comercial', flujoVehicular: 'Flujo vehicular', flujoPeatonal: 'Flujo peatonal', hidrologia: 'Hidrología', vegetacion: 'Vegetación', orientacion: 'Orientación', frenteTerreno: 'Frente', fondoTerreno: 'Fondo', liquidez: 'Liquidez', demanda: 'Demanda', oferta: 'Oferta',
};
const labelize = (k: string) => (labelMap[k] || k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/^./, m => m.toUpperCase())).replace(/^Paso\s*\d+\s*[·:.-]?\s*/i, '');
const clean = (v: any) => v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && !v.length);
const yesNo = (v: any) => v ? 'Sí' : 'No';
const text = (v: any): string => { const value = Array.isArray(v) ? v.join(', ') : typeof v === 'object' ? Object.entries(v).filter(([,x]) => clean(x)).map(([k,x]) => `${labelize(k)}: ${typeof x === 'boolean' ? yesNo(x) : x}`).join(' · ') : String(v); return value.replace(/\bPaso\s*\d+\s*[·:.-]?\s*/gi, ''); };
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

function Page({ children, title, pageNumber, totalPages, premium = false }: any) { return <section className={`avaluo-pdf-page ${premium ? 'terrain-pdf-page' : ''}`}><div className='avaluo-pdf-accent' /><div className='avaluo-pdf-content'>{title && <h2 className='avaluo-pdf-title'>{title}</h2>}{children}</div><Footer pageNumber={pageNumber} totalPages={totalPages} /></section>; }
function Footer({ pageNumber, totalPages }: any) { return <div className='avaluo-pdf-footer'><span>DIAMANTES REALTY GROUP</span><span>www.diamantesrealtygroup.com</span><span>Informe Técnico de Avalúo</span><span>{clean(pageNumber) ? `PÁGINA ${pageNumber}${clean(totalPages) ? ` DE ${totalPages}` : ''}` : ''}</span></div>; }
function Card({ icon: Icon = CheckCircle2, label, value }: any) { if (!clean(value)) return null; return <div className='avaluo-pdf-card'><Icon className='avaluo-pdf-card-icon' /><p className='avaluo-pdf-card-label'>{label}</p><p className='avaluo-pdf-card-value'>{value}</p></div>; }
function MiniFact({ label, value }: any) { if (!clean(value)) return null; return <div className='avaluo-pdf-mini-fact'><span>{label}</span><strong>{value}</strong></div>; }
function FeatureGroup({ title, items }: any) { const visible = items.filter(([k, v]: any) => clean(v)); if (!visible.length) return null; return <div className='avaluo-pdf-feature-group'><h3>{title}</h3>{visible.map(([k, v]: any) => <div key={k} className='avaluo-pdf-feature-row'><span>{labelize(k)}</span><strong>{text(v)}</strong></div>)}</div>; }
function RangeBar({ label, value, max }: any) { if (!clean(value)) return null; const width = Math.max(8, Math.min(100, (Number(value || 0) / Math.max(Number(max || value || 1), 1)) * 100)); return <div className='avaluo-pdf-range-row'><div><span>{label}</span><strong>{money(value)}</strong></div><div className='avaluo-pdf-range-track'><i style={{ width: `${width}%` }} /></div></div>; }

const subtotalCoef = (items: any[]) => items.reduce((acc, item) => acc * Number(item?.coeficiente || 1), 1);
const matchesAny = (coef: any, words: string[]) => words.some((word) => String(coef?.factor || coef?.nombre || '').toLowerCase().includes(word));
const terrainAnalysis = (avaluo: any, base: string[]) => {
  const c = avaluo?.caracteristicas || {};
  const area = num(avaluo?.areaM2Convertida || c.areaM2Convertida || c.areaTerreno);
  const ciudad = avaluo?.ciudad || 'la ciudad indicada';
  const zona = avaluo?.zona || 'la zona registrada';
  const clasificacion = avaluo?.zonaSnapshot?.clasificacion || c.tipoTerritorio || avaluo?.clasificacionZona || 'clasificación territorial referencial';
  const entorno = avaluo?.zonaSnapshot?.tipoEntorno || c.entorno || c.tipoEntorno || 'entorno inmobiliario mixto';
  const topo = c.topografia || 'topografía no declarada';
  const suelo = c.tipoSuelo || 'suelo no especificado';
  const forma = c.formaTerreno || 'forma no especificada';
  const acceso = c.tipoVia || c.accesoGeneral || c.acceso || 'acceso por validar';
  const servicios = text(c.serviciosBasicos || 'servicios por confirmar');
  const seguridad = c.seguridadZona || 'seguridad media de referencia';
  const uso = c.usoPotencial || 'uso compatible con la zona';
  const liquidez = avaluo?.indiceLiquidez ? `${avaluo.indiceLiquidez}/100` : (c.liquidez || 'media');
  const plusvalia = avaluo?.nivelPlusvalia || c.desarrolloUrbano || 'media';
  const confianza = avaluo?.nivelConfianza || 'media';
  const generated = [
    `El terreno objeto de valoración se localiza en ${zona}, ${ciudad}, dentro de una ${clasificacion} y con un ${entorno}. La posición territorial, la relación con el entorno inmediato y la lectura de plusvalía ${plusvalia} inciden directamente en la demanda esperada, en la profundidad del mercado comprador y en el margen de negociación razonable para una operación comercial.` ,
    `Desde el punto de vista físico, el inmueble presenta un área equivalente de ${area} m², con ${forma}, ${topo} y ${suelo}. Estos componentes permiten valorar el grado de aprovechamiento, los posibles costos de adecuación, la eficiencia geométrica del lote y la capacidad de adaptación a usos residenciales, comerciales, agroproductivos o mixtos según corresponda.` ,
    `La accesibilidad registrada como ${acceso}, la disponibilidad de servicios (${servicios}) y la percepción de seguridad ${seguridad} determinan el nivel de funcionalidad operativa del terreno. Cuando estos elementos son favorables, reducen tiempos de desarrollo y fortalecen la liquidez; cuando son limitados, deben considerarse como puntos de verificación antes de formalizar negociación.` ,
    `El potencial de uso recomendado se orienta a ${uso}, considerando entorno, clasificación, recursos naturales, pendiente, cobertura vegetal y restricciones declaradas. La liquidez estimada (${liquidez}) sugiere una estrategia comercial proporcional al tamaño, al precio unitario y a la capacidad del mercado local para absorber activos similares.` ,
    `Con nivel de confianza ${confianza}, el valor estimado de ${money(avaluo?.valorFinal)} debe interpretarse como una referencia técnica profesional para publicación, negociación y toma de decisiones preliminares. Se recomienda complementar este informe con revisión documental, inspección de campo, confirmación de linderos, validación de servicios y análisis de comparables activos o cierres recientes.`
  ];
  return generated.length >= 3 ? generated : base;
};
function ValueTile({ label, value, dark = false }: any) { if (!clean(value)) return null; return <div className={`terrain-value-tile ${dark ? 'terrain-value-tile--dark' : ''}`}><span>{label}</span><strong>{value}</strong></div>; }
function TerrainMeter({ label, value }: any) { const n = Math.max(8, Math.min(100, Number(value || 0))); return <div className='terrain-meter'><div><span>{label}</span><strong>{clean(value) ? `${value}/100` : 'N/D'}</strong></div><i><b style={{ width: `${n}%` }} /></i></div>; }
function TerrainInfoSection({ title, icon: Icon = FileText, items }: any) { const visible = items.filter(([_, v]: any) => clean(v)); if (!visible.length) return null; return <div className='terrain-info-section'><h3><Icon />{title}</h3>{visible.map(([k, v]: any) => <div key={k} className='terrain-info-row'><span>{k}</span><strong>{text(v)}</strong></div>)}</div>; }
function CoefGroup({ title, items, icon: Icon = BarChart3 }: any) { if (!items.length) return null; const sub = subtotalCoef(items); return <div className='terrain-coef-group'><h3><Icon />{title}<b>Subtotal {impact(sub)}</b></h3>{items.map((coef: any, i: number) => <div className='terrain-coef-row' key={`${title}-${i}`}><span>{labelize(coef.factor || coef.nombre)}</span><em>{coef.valorAplicado || '—'}</em><strong>{coef.impacto || impact(coef.coeficiente)}</strong></div>)}</div>; }

const sectionTextWeight = (value: any) => Math.ceil(text(value).length / 90);
const sectionWeight = (items: any[] = [], baseWeight = 2) => {
  const visible = items.filter(([, v]: any) => clean(v));
  return baseWeight + visible.length + visible.reduce((acc, [, v]: any) => acc + sectionTextWeight(v), 0);
};
const groupWeight = (items: any[] = [], baseWeight = 2) => baseWeight + items.length + items.reduce((acc, item: any) => acc + sectionTextWeight(item?.valorAplicado || item?.justificacion || item?.interpretacion || item?.factor || item?.nombre), 0);
const paginateBlocks = (blocks: any[], capacity: number) => {
  const pages: any[][] = [];
  let current: any[] = [];
  let weight = 0;
  blocks.filter((block) => block && (!Array.isArray(block.items) || block.items.length)).forEach((block) => {
    const blockWeight = Number(block.weight || 1);
    if (current.length && weight + blockWeight > capacity) {
      pages.push(current);
      current = [];
      weight = 0;
    }
    current.push(block);
    weight += blockWeight;
  });
  if (current.length) pages.push(current);
  return pages.length ? pages : [[]];
};

function TerrainCharts({ avaluo, groups }: any) { const liquidez = Number(avaluo?.indiceLiquidez || 0); const confianza = String(avaluo?.nivelConfianza || '').toLowerCase().includes('muy') ? 94 : String(avaluo?.nivelConfianza || '').toLowerCase().includes('alt') ? 84 : String(avaluo?.nivelConfianza || '').toLowerCase().includes('med') ? 66 : 42; const potencial = avaluo?.potencialCrecimiento === 'Alto' ? 86 : avaluo?.potencialCrecimiento === 'Medio' ? 64 : 42; return <div className='terrain-chart-grid'><div className='terrain-chart-card'><h3><PieChart />Distribución de coeficientes</h3>{groups.slice(0,5).map((g: any) => <TerrainMeter key={g.title} label={g.title} value={Math.round(Math.abs((subtotalCoef(g.items)-1)*100)*4 + 35)} />)}</div><div className='terrain-chart-card'><h3><TrendingUp />Indicadores comerciales</h3><TerrainMeter label='Índice de liquidez' value={liquidez}/><TerrainMeter label='Nivel de confianza' value={confianza}/><TerrainMeter label='Potencial comercial' value={potencial}/></div></div>; }


export default function AvaluoPdfTemplate({ avaluo }: { avaluo: any }) {
  const agente = avaluo?.agenteEvaluador || 'Agente evaluador no especificado';
  const c = avaluo?.caracteristicas || {};
  const coefs = (Array.isArray(avaluo?.coeficientesAplicados) ? avaluo.coeficientesAplicados : Object.entries(avaluo?.coeficientesAplicados || {}).map(([factor, coeficiente]) => ({ factor: labelize(factor), coeficiente, impacto: impact(coeficiente) }))).filter((coef: any) => clean(coef.factor || coef.nombre));
  const analisis = splitAnalysisIntoParagraphs(avaluo?.analisisProfesional || generateAvaluoAnalysis(avaluo));
  const galeria = (avaluo?.imagenesAdicionalesBase64 || []).filter(Boolean).slice(0, 5);
  const maxRange = Math.max(Number(avaluo?.rangoMercado?.maximo || 0), Number(avaluo?.valorFinal || 0), 1);
  const isTerreno = avaluo?.tipoPropiedad === 'terreno';
  const favorables = coefs.filter((x: any) => Number(x.coeficiente) > 1.01).map((x: any) => x.factor).slice(0, 8);
  const limitantes = coefs.filter((x: any) => Number(x.coeficiente) < 0.99).map((x: any) => x.factor).slice(0, 8);

  if (isTerreno) {
    const analysis = terrainAnalysis(avaluo, analisis);
    const usedManzanas = String(avaluo?.unidadArea || c.unidadArea || '').toLowerCase().includes('manzana');
    const valorFinalTerreno = Number(avaluo?.valorFinal ?? avaluo?.estimatedValue ?? avaluo?.valorFinalEstimado ?? 0);
    const valorM2Terreno = Number(avaluo?.adjustedPriceM2 ?? avaluo?.valorM2 ?? 0);
    const manzanas = Number(avaluo?.areaOriginal || c.areaOriginal || avaluo?.areaManzanas || 0);
    const pricePerManzana = usedManzanas ? (manzanas > 0 ? valorFinalTerreno / manzanas : Number(avaluo?.pricePerManzana || 0)) : 0;
    const coefGroups = [
      { title: 'Ubicación', icon: MapPin, items: coefs.filter((x: any) => matchesAny(x, ['zona', 'barrio', 'seguridad', 'plusval', 'ubic', 'cercanía', 'proximidad', 'desarrollo', 'entorno'])) },
      { title: 'Terreno', icon: Ruler, items: coefs.filter((x: any) => matchesAny(x, ['topografía', 'forma', 'suelo', 'frente', 'fondo', 'acceso', 'servicios', 'liquidez', 'demanda', 'oferta'])) },
      { title: 'Ambiental', icon: Leaf, items: coefs.filter((x: any) => matchesAny(x, ['recursos', 'deforest', 'agua', 'hidrolog', 'pendiente', 'vegetación', 'riesgo', 'ambiental'])) },
      { title: 'Legal', icon: Gavel, items: coefs.filter((x: any) => matchesAny(x, ['legal', 'jurídica', 'document', 'restricc', 'uso'])) },
      { title: 'Escala', icon: BarChart3, items: coefs.filter((x: any) => matchesAny(x, ['escala', 'normalización', 'tamaño', 'precio base'])) },
    ];
    const assignedCoeficients = new Set(coefGroups.flatMap((group) => group.items));
    const visibleCoefGroups = [...coefGroups, { title: 'Otros ajustes', icon: BarChart3, items: coefs.filter((x: any) => !assignedCoeficients.has(x)) }].map((g) => ({ ...g, items: g.items.length ? g.items : [] }));
    const factorTotal = avaluo?.factorGlobal || subtotalCoef(coefs);
    const telefono = avaluo?.telefonoAgente || avaluo?.agenteTelefono || avaluo?.telefono || '';
    const barrio = avaluo?.barrio || avaluo?.zona || c.barrio || c.zona;
    const nombreAgente = avaluo?.agenteEvaluador || avaluo?.nombreAgente || avaluo?.agente?.nombre || '';
    const telefonoAgente = avaluo?.telefonoAgente || avaluo?.telefono || avaluo?.agente?.telefono || avaluo?.agenteTelefono || '';
    const fechaEmision = date(avaluo?.fechaEmision || avaluo?.createdAtServer || avaluo?.createdAt);
    const technicalSections = [
      { title: 'General', icon: FileText, items: [[ 'Área', `${num(avaluo?.areaM2Convertida || c.areaTerreno)} m²` ],[ 'Frente', c.frenteTerreno && `${c.frenteTerreno} m` ],[ 'Fondo', c.fondoTerreno && `${c.fondoTerreno} m` ],[ 'Forma', c.formaTerreno ],[ 'Ciudad', avaluo?.ciudad ],[ 'Barrio', barrio ],[ 'Clasificación', avaluo?.zonaSnapshot?.clasificacion || c.tipoTerritorio ]] },
      { title: 'Físico', icon: Ruler, items: [[ 'Topografía', c.topografia ],[ 'Tipo de suelo', c.tipoSuelo ],[ 'Cobertura vegetal', c.vegetacion ],[ 'Deforestación', c.nivelDeforestacion ],[ 'Recursos naturales', c.recursosNaturales ],[ 'Pendiente', c.pendiente ],[ 'Ambiental', c.restriccionesAmbientales ? 'Con restricciones declaradas' : 'Sin restricciones declaradas' ]] },
      { title: 'Servicios', icon: Droplets, items: [[ 'Agua', c.serviciosBasicos?.agua ? 'Disponible' : 'No disponible' ],[ 'Luz', c.serviciosBasicos?.energia ? 'Disponible' : 'No disponible' ],[ 'Internet', c.serviciosBasicos?.internet ? 'Disponible' : 'No disponible' ],[ 'Telefonía', c.serviciosBasicos?.senalTelefonica ? 'Disponible' : 'No disponible' ],[ 'Drenaje', c.serviciosBasicos?.drenaje ? 'Disponible' : 'No disponible' ]] },
      { title: 'Accesibilidad', icon: MapPin, items: [[ 'Tipo de calle', c.tipoVia ],[ 'Acceso', c.accesoGeneral || c.acceso ],[ 'Tráfico', c.nivelTrafico ],[ 'Cercanía urbana', c.proximity ],[ 'Seguridad', c.seguridadZona ]] },
      { title: 'Legal', icon: Gavel, items: [[ 'Tipo de documentación', c.tipoDocumentacion || c.legalStatus || 'Documentación completa' ],[ 'Documentación completa', c.documentacionCompleta || 'Sí / por confirmar físicamente' ],[ 'Escritura pública', c.escrituraPublica || 'Declarada / requerida' ],[ 'Inscripción registral', c.inscripcionRegistral || 'Declarada / requerida' ],[ 'Plano catastral', c.planoCatastral || 'Declarado / requerido' ],[ 'Libre de gravamen', c.libreGravamen || 'Sin gravamen declarado' ],[ 'Restricciones legales', c.restriccionesLegales || 'Sin restricciones declaradas' ],[ 'Uso permitido', c.usoPermitido || c.usoPotencial ],[ 'Observaciones legales', c.observacionesLegales || 'Validar con escritura, registro público y catastro antes de cierre.' ]] },
    ].map((block) => ({ ...block, weight: sectionWeight(block.items) }));
    const technicalPages = paginateBlocks(technicalSections, 26);
    const coefPageGroups = paginateBlocks(visibleCoefGroups.map((g) => ({ ...g, weight: groupWeight(g.items, 3) })), 22);
    const totalPages = 4 + technicalPages.length + coefPageGroups.length;
    let pageNumber = 0;
    const nextPage = () => ++pageNumber;
    return <div className='avaluo-pdf-template terrain-pdf-template'>
      <Page premium pageNumber={nextPage()} totalPages={totalPages}><div className='terrain-cover-top'><img src='/logo.png' className='terrain-logo' /><div><p>DIAMANTES REALTY GROUP</p><h1>INFORME TÉCNICO DE AVALÚO DE TERRENO</h1><h2>Informe profesional de valoración inmobiliaria</h2></div></div><div className='terrain-cover-photo'><Img src={avaluo?.imagenPrincipalBase64} /></div><div className='terrain-cover-bottom'><div><h3>{avaluo?.titulo || 'Terreno evaluado'}</h3><p>DIAMANTES REALTY GROUP desarrolla análisis inmobiliarios con enfoque técnico, lectura comercial y presentación corporativa para orientar decisiones patrimoniales, venta, compra y negociación de activos.</p></div><div className='terrain-cover-facts'><MiniFact label='Ciudad' value={avaluo?.ciudad}/><MiniFact label='Barrio / Zona' value={barrio}/><MiniFact label='Fecha' value={fechaEmision}/><MiniFact label='Agente' value={nombreAgente}/><MiniFact label='Teléfono' value={telefonoAgente}/></div></div></Page>
      <Page premium pageNumber={nextPage()} totalPages={totalPages} title='Resumen ejecutivo'><div className='terrain-summary-hero'><span>Valor estimado</span><strong>{money(avaluo?.valorFinal)}</strong><p>Resultado técnico preliminar para orientar estrategia comercial, publicación y negociación.</p></div><div className='terrain-value-grid'><ValueTile label='Valor mínimo sugerido' value={money(avaluo?.rangoMercado?.minimo || avaluo?.lowValue)}/><ValueTile label='Valor recomendado de negociación' value={money(avaluo?.precioObjetivoCierre)}/><ValueTile label='Valor recomendado de publicación' value={money(avaluo?.precioRecomendadoPublicacion)}/><ValueTile label='Nivel de confianza' value={avaluo?.nivelConfianza}/><ValueTile label='Clasificación' value={avaluo?.zonaSnapshot?.clasificacion || avaluo?.clasificacionZona}/><ValueTile label='Liquidez' value={avaluo?.indiceLiquidez ? `${avaluo.indiceLiquidez}/100` : c.liquidez}/><ValueTile label='Tiempo estimado de venta' value={avaluo?.tiempoEstimadoVenta}/><ValueTile label='Potencial de crecimiento' value={avaluo?.potencialCrecimiento}/><ValueTile label='Uso recomendado' value={c.usoPotencial}/></div></Page>
      {technicalPages.map((sections: any[], index: number) => <Page key={`technical-page-${index}`} premium pageNumber={nextPage()} totalPages={totalPages} title={index === 0 ? 'Ficha técnica del terreno' : 'Ficha técnica del terreno (continuación)'}><div className='terrain-info-grid'>{sections.map((section: any) => <TerrainInfoSection key={section.title} title={section.title} icon={section.icon} items={section.items} />)}</div></Page>)}
      <Page premium pageNumber={nextPage()} totalPages={totalPages} title='Análisis profesional'><div className='terrain-analysis'>{analysis.map((p: string, i: number) => <p key={i}>{p}</p>)}</div><TerrainCharts avaluo={avaluo} groups={visibleCoefGroups}/></Page>
      {coefPageGroups.map((groupSet: any[], index: number) => <Page key={`coef-page-${index}`} premium pageNumber={nextPage()} totalPages={totalPages} title={index === 0 ? 'Análisis de coeficientes' : 'Análisis de coeficientes técnicos'}><div className='terrain-coef-grid'>{groupSet.map((g: any) => <CoefGroup key={g.title} {...g} />)}</div>{index === coefPageGroups.length - 1 && <div className='terrain-total-box'><span>TOTAL</span><strong>Factor acumulado {impact(factorTotal)}</strong><p>Precio base: {money(avaluo?.valorBase || (Number(avaluo?.areaM2Convertida || 0) * Number(avaluo?.basePriceM2 || 0)))} · Precio final: {money(avaluo?.valorFinal)}</p></div>}</Page>)}
      <Page premium pageNumber={nextPage()} totalPages={totalPages} title='Valores comerciales'><div className='terrain-value-grid terrain-value-grid--large'><ValueTile dark label='Precio total' value={money(valorFinalTerreno)}/><ValueTile label='Precio por m²' value={money(valorM2Terreno)}/>{usedManzanas && <ValueTile label='Precio por manzana' value={money(pricePerManzana)}/>}<ValueTile label='Valor mínimo' value={money(avaluo?.rangoMercado?.minimo || avaluo?.lowValue)}/><ValueTile label='Valor medio' value={money(avaluo?.valorFinal || avaluo?.estimatedValue)}/><ValueTile label='Valor máximo' value={money(avaluo?.rangoMercado?.maximo || avaluo?.highValue)}/><ValueTile label='Precio recomendado de publicación' value={money(avaluo?.precioRecomendadoPublicacion)}/><ValueTile label='Precio recomendado de cierre' value={money(avaluo?.precioObjetivoCierre)}/><ValueTile label='Precio mínimo negociable' value={money(avaluo?.precioMinimoNegociacion)}/></div><p className='terrain-note'>Cuando el avalúo se registra en manzanas se presentan precio por manzana, precio por m² y precio total. Cuando se registra en metros cuadrados se omite el precio por manzana para mantener consistencia comercial.</p></Page>
      <Page premium pageNumber={nextPage()} totalPages={totalPages} title='Metodología y cierre'><p className='terrain-method'>El modelo combina precio base territorial, normalización por tamaño, coeficientes de ubicación, condiciones físicas, accesibilidad, servicios, mercado, entorno ambiental y situación legal. La matriz completa de coeficientes permanece visible para trazabilidad técnica y control de consistencia.</p><div className='terrain-info-grid terrain-info-grid--two'><div className='terrain-info-section'><h3><ShieldCheck />Factores favorables</h3><p>{favorables.length ? favorables.join(', ') : 'No se identifican impulsos superiores al mercado base.'}</p></div><div className='terrain-info-section'><h3><Waves />Factores limitantes</h3><p>{limitantes.length ? limitantes.join(', ') : 'No se identifican castigos técnicos relevantes.'}</p></div></div><div className='avaluo-pdf-closing terrain-closing'><img src='/logo.png' className='logo-pdf logo-pdf--closing' /><h2>DIAMANTES REALTY GROUP</h2><p>Informe técnico preliminar elaborado para apoyar decisiones comerciales y patrimoniales. No sustituye avalúo certificado por perito autorizado cuando sea requerido por ley o institución financiera.</p><div className='avaluo-pdf-signature'>{nombreAgente && <strong>{nombreAgente}</strong>}<span>Agente evaluador</span>{telefonoAgente && <span>Tel. {telefonoAgente}</span>}<span>{fechaEmision}</span></div></div></Page>
    </div>;
  }

  return <div className='avaluo-pdf-template'>
    <Page><div className='avaluo-pdf-logo-row avaluo-pdf-logo-row--cover'><img src='/logo.png' className='logo-pdf logo-pdf--round' /><div><p className='avaluo-pdf-kicker'>DIAMANTES REALTY GROUP</p><h1 className='avaluo-pdf-heading'>INFORME TÉCNICO DE AVALÚO INMOBILIARIO</h1><p className='avaluo-pdf-subheading'>Estimación preliminar de valor comercial</p></div></div><div className='avaluo-pdf-red-band'><span>Análisis inmobiliario profesional</span><strong>{money(avaluo?.valorFinal)}</strong></div><div className='avaluo-pdf-cover-layout'><Img src={avaluo?.imagenPrincipalBase64} alt='Imagen principal de la propiedad' wrapperClassName='avaluo-pdf-cover-image' /><div className='avaluo-pdf-cover-card'><h2>{avaluo?.titulo || 'Avalúo inmobiliario'}</h2><MiniFact label='Tipo de propiedad' value={avaluo?.tipoPropiedad}/><MiniFact label='Ubicación' value={avaluo?.ciudad}/><MiniFact label='Zona' value={avaluo?.zona}/><MiniFact label='Agente evaluador' value={agente}/><MiniFact label='Fecha' value={date(avaluo?.createdAtServer || avaluo?.createdAt)}/><MiniFact label='Valor estimado' value={money(avaluo?.valorFinal)}/></div></div></Page>
    <Page title='Datos generales'><div className='avaluo-pdf-executive'><FileText/><div><h3>Resumen ejecutivo</h3><p>El presente informe resume los principales factores territoriales, físicos y comerciales considerados para estimar el valor preliminar de la propiedad evaluada.</p></div></div><div className='avaluo-pdf-grid-3 avaluo-pdf-tight-grid'><Card icon={Home} label='Tipo' value={avaluo?.tipoPropiedad}/><Card icon={MapPin} label='Ciudad' value={avaluo?.ciudad}/><Card icon={MapPin} label='Zona' value={avaluo?.zona}/><Card icon={Building2} label='Clasificación territorial' value={avaluo?.zonaSnapshot?.clasificacion}/><Card icon={ShieldCheck} label='Tipo de entorno' value={avaluo?.zonaSnapshot?.tipoEntorno || c.entorno || c.tipoEntorno}/><Card label='Factor plusvalía' value={String(avaluo?.zonaSnapshot?.factorPlusvalia || '')}/><Card label='Valor base terreno m²' value={money(avaluo?.zonaSnapshot?.valorTerrenoM2)}/><Card label='Observación técnica' value={avaluo?.zonaSnapshot?.observacionTecnica}/><Card icon={Ruler} label='Área' value={num(avaluo?.areaM2Convertida || c.areaTerreno || c.areaM2Convertida) + ' m²'}/><Card label='Unidad de área' value={avaluo?.unidadArea || c.unidadArea}/><Card icon={BadgeDollarSign} label='Valor por m²' value={money(avaluo?.valorM2)}/><Card icon={Award} label='Nivel de confianza' value={avaluo?.nivelConfianza}/>{isTerreno && <Card label='Precio por manzana' value={money(avaluo?.pricePerManzana)}/>} {isTerreno && <Card label='Índice de liquidez' value={avaluo?.indiceLiquidez ? `${avaluo.indiceLiquidez} / 100` : ''}/>} {isTerreno && <Card label='Tiempo estimado de venta' value={avaluo?.tiempoEstimadoVenta}/>}</div>{!!galeria.length && <div className='avaluo-pdf-mt-24'><h3 className='avaluo-pdf-section-subtitle'>Galería de referencia</h3><div className='avaluo-pdf-grid-3'>{galeria.map((src: string, i: number) => <Img key={src || i} src={src} alt={`Imagen adicional ${i + 1} de la propiedad`} wrapperClassName='avaluo-pdf-gallery-img' />)}</div></div>}</Page>
    <Page title='Características evaluadas'><div className='avaluo-pdf-feature-grid'><FeatureGroup title='Ubicación y entorno' items={Object.entries(c).filter(([k]) => ['proximity','entorno','tipoEntorno','tipoTerritorio','tipoVia','accesoGeneral','desarrolloUrbano','zona','ubicacion'].includes(k))}/><FeatureGroup title='Condiciones físicas' items={Object.entries(c).filter(([k]) => ['areaOriginal','areaM2Convertida','areaTerreno','areaConstruccion','unidadArea','topografia','tipoSuelo','estadoConservacion','antiguedad','riesgos','nivelDeforestacion','frenteTerreno','fondoTerreno','orientacion'].includes(k))}/><FeatureGroup title='Servicios e infraestructura' items={Object.entries(c).filter(([k]) => ['serviciosBasicos','recursosNaturales','hidrologia','vegetacion','seguridad','parqueos','habitaciones','banos'].includes(k))}/><FeatureGroup title='Potencial comercial' items={Object.entries(c).filter(([k]) => ['usoPotencial','liquidez','demanda','oferta','exposicionComercial','flujoVehicular','flujoPeatonal','actividadComercial','vocacion'].includes(k))}/></div></Page>
    <Page title='Análisis profesional'><div className='avaluo-pdf-analysis'>{analisis.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div><div className='avaluo-pdf-commercial-interpretation'><h3>Interpretación comercial</h3><p>{confidenceText(avaluo?.nivelConfianza)}</p></div></Page>
    <Page title='Resultado financiero'><div className='avaluo-pdf-value-box'><p className='avaluo-pdf-value-label'>Valor final estimado</p><p className='avaluo-pdf-value'>{money(avaluo?.valorFinal)}</p></div><div className='avaluo-pdf-financial-grid'><div className='avaluo-pdf-range-card'><h3>Rango de mercado</h3><RangeBar label='Rango mínimo' value={avaluo?.rangoMercado?.minimo} max={maxRange}/><RangeBar label='Valor estimado' value={avaluo?.valorFinal} max={maxRange}/><RangeBar label='Rango máximo' value={avaluo?.rangoMercado?.maximo} max={maxRange}/></div><div className='avaluo-pdf-meter-card'><TrendingUp/><span>Valor por m²</span><strong>{money(avaluo?.valorM2)}</strong><small>Indicador unitario de referencia comercial.</small></div></div>{isTerreno && <div className='avaluo-pdf-grid-3 avaluo-pdf-mt-24'><Card label='Publicación recomendada' value={money(avaluo?.precioRecomendadoPublicacion)}/><Card label='Mínimo negociación' value={money(avaluo?.precioMinimoNegociacion)}/><Card label='Objetivo de cierre' value={money(avaluo?.precioObjetivoCierre)}/></div>}<p className='avaluo-pdf-note'>El rango comercial se calcula según el nivel de confianza: ±2% muy alta, ±4% alta, ±7% media y ±10% baja.</p></Page>
    {isTerreno && <Page title='Análisis territorial y comercial'><div className='avaluo-pdf-feature-grid'><div className='avaluo-pdf-feature-group'><h3>Factores favorables</h3><p>{favorables.length ? favorables.join(', ') : 'No se identifican impulsos superiores al mercado base.'}</p></div><div className='avaluo-pdf-feature-group'><h3>Factores limitantes</h3><p>{limitantes.length ? limitantes.join(', ') : 'No se identifican castigos técnicos relevantes.'}</p></div><div className='avaluo-pdf-feature-group'><h3>Recomendaciones</h3><p>Publicar cerca del precio recomendado, validar documentación, confirmar accesos y respaldar el precio con comparables activos antes de negociación.</p></div><div className='avaluo-pdf-feature-group'><h3>Conclusión profesional</h3><p>El valor resulta de la interacción entre zona, escala, servicios, accesibilidad, uso potencial, mercado y riesgos; el objetivo de cierre prioriza liquidez sin sacrificar consistencia técnica.</p></div></div></Page>}<Page title='Coeficientes y metodología'><p className='avaluo-pdf-method-text'>Los coeficientes aplicados responden a un modelo multicriterio que pondera ubicación, área, acceso, servicios, entorno, uso potencial y condiciones físicas de la propiedad.</p><div className='avaluo-pdf-coef-table'>{coefs.map((coef: any, i: number) => <div key={i} className='avaluo-pdf-coef'><span>{labelize(coef.factor || coef.nombre)} · {coef.valorAplicado || ''}</span><strong>{coef.impacto || impact(coef.coeficiente)}</strong><p>{coef.justificacion || coef.interpretacion || coefInterpretation(coef.factor || coef.nombre, coef.coeficiente)}</p></div>)}</div><p className='avaluo-pdf-note'>Este informe corresponde a una estimación técnica preliminar generada mediante un modelo multicriterio de ponderación inmobiliaria. No sustituye un avalúo certificado emitido por perito valuador autorizado cuando la ley o una institución financiera lo requiera.</p></Page>
    <Page><div className='avaluo-pdf-closing'><img src='/logo.png' className='logo-pdf logo-pdf--closing' /><h2>DIAMANTES REALTY GROUP</h2><p>Este informe ha sido generado como una herramienta de apoyo técnico y comercial para orientar procesos de compra, venta, negociación o análisis patrimonial.</p><div className='avaluo-pdf-closing-card'><MiniFact label='Agente evaluador' value={agente}/>{avaluo?.telefonoAgente && <MiniFact label='Teléfono' value={avaluo.telefonoAgente}/>}<MiniFact label='Fecha' value={date(new Date())}/><MiniFact label='Web' value='www.diamantesrealtygroup.com'/></div><div className='avaluo-pdf-signature'>Firma del agente evaluador</div></div></Page>
  </div>;
}
