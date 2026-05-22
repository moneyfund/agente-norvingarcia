export type PropertyType = 'terreno' | 'casa';
export type CiudadObjetivo = 'Matagalpa';

export type Topografia = 'Plano' | 'Semi plano' | 'Inclinado' | 'Quebrado';
export type Acceso = 'Pavimentado' | 'Adoquinado' | 'Macadán' | 'Tierra';
export type ServicioBasico = 'agua' | 'energia' | 'internet' | 'drenaje' | 'callePavimentada';
export type UsoPotencial = 'Residencial' | 'Comercial' | 'Mixto' | 'Turístico';
export type FormaTerreno = 'Regular' | 'Irregular' | 'Esquinero' | 'Fondo amplio';
export type NivelComercial = 'Alto' | 'Medio' | 'Bajo';

export interface TerrenoInput { titulo: string; ciudad: CiudadObjetivo; zona: string; areaTerreno: number; topografia: Topografia; acceso: Acceso; servicios: ServicioBasico[]; usoPotencial: UsoPotencial; formaTerreno: FormaTerreno; nivelComercial: NivelComercial; esquina: boolean; cercaniaPrincipal: boolean; frenteTerreno?: number; fondoTerreno?: number; pendiente?: boolean; cercaniaComercial?: boolean; exposicionComercial?: 'Alta'|'Media'|'Baja'; tipoEntorno?: 'Residencial premium'|'Residencial media'|'Comercial'|'Mixto'|'Popular'; riesgoInundacion?: boolean; seguridadZona?: NivelComercial; desarrolloUrbano?: 'Consolidado'|'Crecimiento'|'Emergente'|'Bajo desarrollo'; densidadUrbana?: NivelComercial; potencialSubdivision?: boolean; nivelTrafico?: NivelComercial; }
export interface CasaInput extends TerrenoInput { areaConstruccion: number; habitaciones: '1'|'2'|'3'|'4'|'5'|'6+'; banos: '1'|'2'|'3'|'4'|'5+'; niveles: '1'|'2'|'3'|'4+'; garaje: boolean; patio: boolean; jardin: boolean; estadoConstruccion: 'Excelente'|'Bueno'|'Regular'|'Malo'; acabados: 'Premium'|'Alto'|'Medio'|'Básico'; antiguedad: '0-5'|'6-10'|'11-20'|'20+'; tipoConstruccion: 'Lujo moderno'|'Residencial alta'|'Residencial media'|'Económica'; }

export interface ZonaData { ciudad: CiudadObjetivo; zona: string; clasificacion: 'Prime'|'Alta'|'Media'|'Emergente'; valorTerrenoM2: number; plusvalia: number; }
export interface ResultadoAvaluo { valorTerreno: number; valorConstruccion: number; valorM2: number; clasificacionZona: string; plusvaliaAplicada: number; coeficientesAplicados: Record<string, number>; rangoMercado: { minimo: number; maximo: number }; nivelConfianza: 'Alto'|'Medio'|'Base'; valorFinalEstimado: number; }

export interface AvaluoRecord { id?: string; titulo: string; tipoPropiedad: PropertyType; ciudad: CiudadObjetivo; zona: string; createdAt: string; usuarioId: string; caracteristicas: TerrenoInput | CasaInput; coeficientesAplicados: Record<string, number>; valorTerreno: number; valorConstruccion: number; valorFinal: number; rangoMercado: { minimo: number; maximo: number }; nivelConfianza: ResultadoAvaluo['nivelConfianza']; zonaSnapshot: ZonaData; }
