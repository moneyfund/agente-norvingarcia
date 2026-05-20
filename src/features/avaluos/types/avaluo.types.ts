export type TipoPropiedad = 'terreno' | 'casa' | 'finca' | 'comercial';

export type CiudadObjetivo = 'Matagalpa' | 'Estelí';

export type Topografia = 'plano' | 'semiPlano' | 'inclinado' | 'quebrado';
export type Acceso = 'pavimentado' | 'adoquinado' | 'macadan' | 'tierra';
export type ServicioBasico = 'agua' | 'energia' | 'internet' | 'drenaje';
export type UsoPotencial = 'residencial' | 'comercial' | 'industrial' | 'agricola' | 'turistico';

export interface ZonaData {
  ciudad: string;
  zona: string;
  clasificacion: string;
  valorTerrenoM2: number;
  valorConstruccionM2: number;
  factorPlusvalia: number;
}

export interface ZonaSnapshot {
  clasificacion: string;
  valorTerrenoM2: number;
  valorConstruccionM2: number;
  factorPlusvalia: number;
}

export interface CaracteristicasTerreno {
  ciudad: CiudadObjetivo;
  municipio: string;
  zona: string;
  areaTerreno: number;
  topografia: Topografia;
  acceso: Acceso;
  servicios: ServicioBasico[];
  usoPotencial: UsoPotencial;
  observaciones?: string;
}

export interface CaracteristicasConstruccion {
  areaConstruccion: number;
  estadoConstruccion: 'excelente' | 'bueno' | 'regular' | 'malo';
  acabados: 'premium' | 'alto' | 'medio' | 'basico' | 'obraGris';
}

export interface Coeficientes {
  topografia: number;
  acceso: number;
  servicios: number;
  plusvalia: number;
  factorGlobal: number;
}

export interface ResultadoAvaluo {
  valorTerreno: number;
  valorConstruccion: number;
  valorFinal: number;
  rangoEstimado: { minimo: number; maximo: number };
  clasificacionUrbana: string;
  nivelPlusvalia: number;
  coeficientesAplicados: Coeficientes;
  observacionesTecnicas: string[];
}

export interface AvaluoInput {
  tipoPropiedad: TipoPropiedad;
  usuarioId: string;
  zonaData: ZonaData;
  caracteristicas: CaracteristicasTerreno;
}
