export type PropertyType = 'terreno' | 'casa';
export type CiudadObjetivo = 'Matagalpa';

export type UnidadArea = 'm2' | 'manzana';
export type TipoTerritorio = 'Urbano' | 'Semiurbano' | 'Semirural' | 'Rural cercano' | 'Rural productivo' | 'Rural aislado';
export type Topografia = 'Plano' | 'Semi plano' | 'Ondulado' | 'Inclinado' | 'Muy inclinado' | 'Quebrado';
export type Acceso = 'Pavimentado' | 'Adoquinado' | 'Macadán' | 'Tierra';
export type AccesoGeneral = 'Excelente' | 'Bueno' | 'Regular' | 'Difícil' | 'Muy difícil';
export type TipoVia = 'Carretera pavimentada' | 'Calle adoquinada' | 'Calle de concreto' | 'Macadán' | 'Tierra transitable' | 'Camino rural' | 'Vereda';
export type NivelTrafico = 'Alto' | 'Medio' | 'Bajo' | 'Muy bajo';
export type SeguridadZona = 'Alta' | 'Media alta' | 'Media' | 'Baja';
export type ServicioBasico = 'agua' | 'energia' | 'internet' | 'drenaje' | 'callePavimentada' | 'alumbradoPublico' | 'transporteCercano' | 'ninguno';
export type ServicioTerreno = 'Agua potable' | 'Energía eléctrica' | 'Internet' | 'Drenaje' | 'Alumbrado público' | 'Transporte cercano' | 'Ninguno';
export type UsoPotencial = 'Residencial' | 'Comercial' | 'Mixto' | 'Lotificación' | 'Agrícola' | 'Ganadero' | 'Turístico' | 'Industrial liviano' | 'Reserva natural';
export type FormaTerreno = 'Regular' | 'Irregular' | 'Irregular leve' | 'Irregular compleja' | 'Esquinero' | 'Fondo amplio' | 'Frente amplio';
export type NivelComercial = 'Alto' | 'Medio' | 'Bajo';
export type EntornoTerreno = 'Residencial premium' | 'Residencial medio' | 'Comercial' | 'Mixto' | 'Popular' | 'Rural productivo' | 'Natural/turístico';
export type DesarrolloUrbano = 'Consolidado' | 'En crecimiento' | 'Crecimiento' | 'Emergente' | 'Bajo desarrollo' | 'Sin desarrollo urbano';
export type TipoSuelo = 'Suelo firme' | 'Suelo arcilloso' | 'Suelo rocoso' | 'Suelo arenoso' | 'Suelo húmedo' | 'Suelo agrícola fértil' | 'Suelo mixto';
export type RecursoNatural = 'Fuente de agua' | 'Río o quebrada' | 'Pozo' | 'Árboles maderables' | 'Vista panorámica' | 'Área cultivable' | 'Ninguno';
export type Proximity = 'Cerca de ciudad principal' | 'Cerca de comunidad' | 'Remoto';
export type LegalStatus = 'Documentación completa' | 'Documentación revisable' | 'Problemas legales';
export type NivelDeforestacion = 'Sin deforestación' | 'Baja' | 'Media' | 'Alta' | 'Muy alta';
export type RiesgoTerreno = 'Riesgo de inundación' | 'Riesgo de deslizamiento' | 'Zona de difícil acceso' | 'Conflicto de servidumbre' | 'Ninguno';

export interface CoeficienteAplicado { factor: string; valorAplicado: string; coeficiente: number; impacto: string; }

export interface TerrenoInput {
  titulo: string;
  ciudad: CiudadObjetivo;
  zona: string;
  unidadArea?: UnidadArea;
  areaOriginal?: number;
  areaM2Convertida?: number;
  areaTerreno: number;
  tipoTerritorio?: TipoTerritorio;
  tipoSuelo?: TipoSuelo;
  topografia: Topografia;
  acceso?: Acceso;
  accesoGeneral?: AccesoGeneral;
  tipoVia?: TipoVia;
  nivelTrafico?: NivelTrafico | NivelComercial;
  seguridadZona?: SeguridadZona | NivelComercial;
  servicios: (ServicioBasico | ServicioTerreno)[];
  usoPotencial: UsoPotencial;
  formaTerreno: FormaTerreno;
  entorno?: EntornoTerreno;
  tipoEntorno?: 'Residencial premium'|'Residencial alta'|'Residencial media'|'Comercial'|'Mixto'|'Popular' | EntornoTerreno;
  desarrolloUrbano?: DesarrolloUrbano;
  recursosNaturales?: RecursoNatural[];
  nivelDeforestacion?: NivelDeforestacion;
  riesgos?: RiesgoTerreno[];
  proximity?: Proximity;
  legalStatus?: LegalStatus;
  nivelComercial: NivelComercial;
  esquina: boolean;
  cercaniaPrincipal: boolean;
  frenteTerreno?: number;
  fondoTerreno?: number;
  pendiente?: boolean;
  cercaniaComercial?: boolean;
  exposicionComercial?: 'Alta'|'Media'|'Baja';
  riesgoInundacion?: boolean;
  densidadUrbana?: NivelComercial;
  potencialSubdivision?: boolean;
}
export interface CasaInput extends TerrenoInput { areaConstruccion: number; habitaciones: '1'|'2'|'3'|'4'|'5'|'6+'; banos: '1'|'2'|'3'|'4'|'5+'; niveles: '1'|'2'|'3'|'4+'; garaje: boolean; patio: boolean; jardin: boolean; estadoConstruccion: 'Excelente'|'Bueno'|'Regular'|'Malo'; acabados: 'Premium'|'Alto'|'Medio'|'Básico'; antiguedad: '0-5'|'6-10'|'11-20'|'20+'; tipoConstruccion: 'Lujo moderno'|'Residencial alta'|'Residencial media'|'Económica'; }

export interface ZonaData { ciudad: CiudadObjetivo; zona: string; nombre: string; clasificacion: 'A+'|'A'|'B+'|'B'|'C'|'D'; tipoEntorno: 'Residencial premium'|'Residencial alta'|'Residencial media'|'Comercial'|'Mixto'|'Popular'|'Rural productivo'|'Natural/turístico'; valorTerrenoM2: number; factorPlusvalia: number; }
export interface ResultadoAvaluo { valorTerreno: number; valorConstruccion: number; valorM2: number; clasificacionZona: string; plusvaliaAplicada: number; coeficientesAplicados: Record<string, number> | CoeficienteAplicado[]; rangoMercado: { minimo: number; maximo: number }; nivelConfianza: 'Alto'|'Medio'|'Baja'|'Base'; valorFinalEstimado: number; valorBase?: number; factorGlobal?: number; areaOriginal?: number; unidadArea?: UnidadArea; areaM2Convertida?: number; areaM2?: number; areaManzanas?: number; valorTerrenoM2?: number; basePriceM2?: number; scaleMultiplier?: number; adjustedPriceM2?: number; lowValue?: number; estimatedValue?: number; highValue?: number; appliedFactors?: CoeficienteAplicado[]; normalizacionAplicada?: boolean; notaNormalizacion?: string; }

export interface AvaluoRecord { id?: string; titulo: string; tipoPropiedad: PropertyType; ciudad: CiudadObjetivo; zona: string; unidadArea?: UnidadArea; areaOriginal?: number; areaM2Convertida?: number; createdAt: string; usuarioId: string; caracteristicas: TerrenoInput | CasaInput; coeficientesAplicados: Record<string, number> | CoeficienteAplicado[]; valorBase?: number; valorTerreno: number; valorConstruccion: number; valorFinal: number; valorM2?: number; rangoMercado: { minimo: number; maximo: number }; nivelConfianza: ResultadoAvaluo['nivelConfianza']; zonaSnapshot: ZonaData; }
