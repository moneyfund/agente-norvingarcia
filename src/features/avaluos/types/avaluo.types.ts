export type PropertyType = 'terreno' | 'casa' | 'finca' | 'quinta' | 'bodega' | 'comercial';

export type CiudadObjetivo = 'Matagalpa' | 'Estelí';
export type Topografia = 'plano' | 'semiPlano' | 'inclinado' | 'quebrado';
export type Acceso = 'pavimentado' | 'adoquinado' | 'macadan' | 'tierra';
export type ServicioBasico = 'agua' | 'energia' | 'internet' | 'drenaje' | 'callePavimentada';
export type UsoPotencial = 'residencial' | 'comercial' | 'industrial' | 'turistico' | 'agricola';

export interface ZonaData {
  ciudad: CiudadObjetivo;
  zona: string;
  clasificacion: 'Prime' | 'Alta' | 'Media' | 'Emergente';
  valorTerrenoM2: number;
  factorPlusvalia: number;
}

export interface ZonaSnapshot {
  clasificacion: ZonaData['clasificacion'];
  valorTerrenoM2: number;
  factorPlusvalia: number;
}

export interface TerrenoInput {
  ciudad: CiudadObjetivo;
  zona: string;
  areaTerreno: number;
  topografia: Topografia;
  acceso: Acceso;
  servicios: ServicioBasico[];
  usoPotencial: UsoPotencial;
}

export interface CoeficientesAplicados {
  topografia: number;
  acceso: number;
  servicios: number;
  usoPotencial: number;
  plusvalia: number;
  factorGlobal: number;
}

export interface ResultadoAvaluo {
  valorTerreno: number;
  valorPorM2Final: number;
  clasificacionUrbana: string;
  factorPlusvalia: number;
  coeficientesAplicados: CoeficientesAplicados;
  valorFinalEstimado: number;
  rangoMercado: { minimo: number; maximo: number };
  nivelConfianza: 'Alto' | 'Medio' | 'Base';
}

export interface AvaluoRecord {
  id?: string;
  tipoPropiedad: PropertyType;
  ciudad: CiudadObjetivo;
  zona: string;
  usuarioId: string;
  createdAt: string;
  caracteristicas: TerrenoInput;
  coeficientesAplicados: CoeficientesAplicados;
  valorTerreno: number;
  valorFinal: number;
  rangoMercado: { minimo: number; maximo: number };
  nivelConfianza: ResultadoAvaluo['nivelConfianza'];
  zonaSnapshot: ZonaSnapshot;
}
