import { safeDivide, toSafeNumber } from './shared/formulas';
import type { CoeficienteAplicado, TerrenoInput, ZonaData, ResultadoAvaluo } from '../types/avaluo.types';

export const M2_POR_MANZANA = 7042.25;
const FACTOR_MINIMO = 0.35;
const FACTOR_MAXIMO = 1.45;

type FactorMap = Record<string, number>;

export const FACTORES_TERRENO = {
  tipoTerritorio: { Urbano: 1.05, Semiurbano: 1, Semirural: 0.92, 'Rural cercano': 0.9, 'Rural productivo': 0.86, 'Rural aislado': 0.78 },
  tipoSuelo: { 'Suelo firme': 1.04, 'Suelo arcilloso': 0.96, 'Suelo rocoso': 0.94, 'Suelo arenoso': 0.93, 'Suelo húmedo': 0.9, 'Suelo agrícola fértil': 1.06, 'Suelo mixto': 1 },
  topografia: { Plano: 1.1, 'Semi plano': 1, Ondulado: 0.9, Inclinado: 0.82, 'Muy inclinado': 0.82, Quebrado: 0.82 },
  acceso: { 'Carretera pavimentada': 1.18, 'Calle adoquinada': 1.1, 'Calle de concreto': 1.12, Macadán: 1.04, 'Tierra transitable': 1, 'Camino rural': 0.8, Vereda: 0.65, Excelente: 1.18, Bueno: 1.08, Regular: 1, Difícil: 0.8, 'Muy difícil': 0.65, Pavimentado: 1.18, Adoquinado: 1.1, Tierra: 1 },
  nivelTrafico: { Alto: 1.05, Medio: 1, Bajo: 0.97, 'Muy bajo': 0.94 },
  seguridadZona: { Alta: 1.08, 'Media alta': 1.04, Media: 1, Baja: 0.9, Alto: 1.08, Medio: 1, Bajo: 0.9 },
  formaTerreno: { Regular: 1.02, 'Irregular leve': 0.98, Irregular: 0.9, 'Irregular compleja': 0.9, Esquinero: 1.06, 'Fondo amplio': 1.01, 'Frente amplio': 1.04 },
  entorno: { 'Residencial premium': 1.12, 'Residencial medio': 1.03, Comercial: 1.1, Mixto: 1.04, Popular: 0.94, 'Rural productivo': 0.98, 'Natural/turístico': 1.08, 'Residencial alta': 1.08, 'Residencial media': 1.03 },
  usoPotencial: { Residencial: 1.1, Comercial: 1.18, Mixto: 1.12, Lotificación: 1.1, Agrícola: 1, Ganadero: 0.95, Turístico: 1.18, 'Industrial liviano': 1.06, 'Reserva natural': 0.9 },
  desarrolloUrbano: { Consolidado: 1.08, 'En crecimiento': 1.04, Crecimiento: 1.04, Emergente: 1, 'Bajo desarrollo': 0.94, 'Sin desarrollo urbano': 0.88 },
  nivelDeforestacion: { 'Sin deforestación': 1.02, Baja: 1, Media: 0.97, Alta: 0.92, 'Muy alta': 0.86 },
  proximidad: { 'Cerca de ciudad principal': 1.15, 'Cerca de comunidad': 1.05, Remoto: 0.85 },
  legalStatus: { 'Documentación completa': 1.08, 'Documentación revisable': 0.9, 'Problemas legales': 0.65 },
} as const;

const ZONAS_BASE_M2: Record<string, { precio: number; tipo: 'urbana' | 'semiurbana' | 'rural' }> = {
  'Zona urbana': { precio: 40, tipo: 'urbana' },
  'Zona semiurbana': { precio: 20, tipo: 'semiurbana' },
  'Zona rural norte': { precio: 7, tipo: 'rural' },
  'Zona rural sur': { precio: 5, tipo: 'rural' },
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const normalizeArea = (data: TerrenoInput) => {
  const areaOriginal = toSafeNumber(data.areaOriginal ?? data.areaTerreno);
  const unidadArea = data.unidadArea || 'm2';
  const areaM2Convertida = unidadArea === 'manzana' ? areaOriginal * M2_POR_MANZANA : areaOriginal;
  return { areaOriginal, unidadArea, areaM2Convertida, areaManzanas: safeDivide(areaM2Convertida, M2_POR_MANZANA, 0) };
};
const lookup = (map: FactorMap, value: unknown, fallback = 1) => toSafeNumber(map[String(value)], fallback);
const impactText = (coeficiente: number) => {
  const pct = (coeficiente - 1) * 100;
  if (Math.abs(pct) < 0.1) return '0%';
  return `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`;
};
const coefRow = (factor: string, valorAplicado: string, coeficiente: number): CoeficienteAplicado => ({ factor, valorAplicado, coeficiente: toSafeNumber(coeficiente, 1), impacto: impactText(coeficiente) });
const reductionCoef = (valorDespuesTope: number, valorAntesTope: number) => {
  const before = toSafeNumber(valorAntesTope, 0);
  if (before <= 0) return 1;
  return Math.min(1, safeDivide(valorDespuesTope, before, 1));
};

export function getFactorEscala(areaM2Convertida: number): number {
  const areaM2 = Math.max(0, toSafeNumber(areaM2Convertida, 0));
  if (areaM2 <= 500) return 1.00;
  if (areaM2 <= 1000) return 0.96;
  if (areaM2 <= 2500) return 0.92;
  if (areaM2 <= 5000) return 0.86;
  if (areaM2 <= M2_POR_MANZANA) return 0.78;
  if (areaM2 <= M2_POR_MANZANA * 5) return 0.62;
  if (areaM2 <= M2_POR_MANZANA * 10) return 0.50;
  if (areaM2 <= M2_POR_MANZANA * 50) return 0.36;
  return 0.25;
}

export const getScaleMultiplier = getFactorEscala;

const getScaleExplanation = (areaM2Convertida: number, areaManzanas: number, factorEscala: number) => {
  if (factorEscala >= 1) return 'Solar pequeño urbano: se mantiene el valor por m² de referencia de la zona.';
  const areaLabel = areaManzanas >= 1
    ? `${areaManzanas.toFixed(2)} manzanas equivalentes`
    : `${areaM2Convertida.toFixed(0)} m²`;
  if (areaM2Convertida <= 2500) return `Terreno mediano (${areaLabel}): se aplica reducción moderada al valor por m² por economía de escala.`;
  if (areaM2Convertida <= M2_POR_MANZANA * 10) return `Área grande (${areaLabel}): se aplica reducción al valor por m² por economía de escala.`;
  return `Gran extensión rural (${areaLabel}): se aplica reducción fuerte al valor por m² por economía de escala.`;
};

const inferZoneType = (zona: ZonaData, data: TerrenoInput): 'urbana' | 'semiurbana' | 'rural' => {
  const byName = ZONAS_BASE_M2[zona.zona]?.tipo;
  if (byName) return byName;
  if (String(data.tipoTerritorio).toLowerCase().includes('rural')) return 'rural';
  if (String(data.tipoTerritorio).toLowerCase().includes('semi')) return 'semiurbana';
  return 'urbana';
};

const getBasePriceM2 = (zona: ZonaData, data: TerrenoInput, areaManzanas: number) => {
  const zoneType = inferZoneType(zona, data);
  const listedBase = ZONAS_BASE_M2[zona.zona]?.precio ?? toSafeNumber(zona.valorTerrenoM2);
  if (data.unidadArea === 'manzana' && zoneType === 'urbana') return 20;
  if (data.unidadArea === 'manzana' && zoneType === 'semiurbana') return clamp(listedBase, 12, 22);
  if (zoneType === 'rural') return zona.zona === 'Zona rural sur' ? clamp(listedBase, 2, 10) : clamp(listedBase, 3, 12);
  if (zoneType === 'semiurbana') return clamp(listedBase, 12, 28);
  if (areaManzanas > 1) return clamp(listedBase, 12, 28);
  return clamp(listedBase, 25, 55);
};

const getServiceFactor = (servicios: unknown[] | undefined) => {
  const selected = Array.isArray(servicios) ? servicios.map(String) : [];
  const none = selected.length === 0 || selected.includes('Ninguno') || selected.includes('ninguno');
  if (none) return 0.85;
  const hasWater = selected.includes('Agua potable') || selected.includes('agua');
  const hasPower = selected.includes('Energía eléctrica') || selected.includes('energia');
  if (hasWater && hasPower) return 1.15;
  if (hasWater || hasPower) return 1.07;
  return 1;
};

const getNaturalResourcesFactor = (recursos: unknown[] | undefined, riesgos: unknown[] | undefined) => {
  const selected = Array.isArray(recursos) ? recursos.map(String) : [];
  const selectedRisks = Array.isArray(riesgos) ? riesgos.map(String) : [];
  if (selectedRisks.includes('Riesgo de inundación')) return 0.8;
  if (selected.includes('Río o quebrada')) return 1.1;
  if (selected.includes('Fuente de agua') || selected.includes('Pozo')) return 1.08;
  if (selected.length === 0 || selected.includes('Ninguno')) return 1;
  return clamp(1 + selected.length * 0.02, 1, 1.08);
};

const getProximityFactor = (data: TerrenoInput) => {
  if (data.proximity) return lookup(FACTORES_TERRENO.proximidad, data.proximity);
  if (data.cercaniaPrincipal || data.desarrolloUrbano === 'Consolidado') return 1.15;
  if (['En crecimiento', 'Crecimiento', 'Emergente'].includes(String(data.desarrolloUrbano))) return 1.05;
  if (data.desarrolloUrbano === 'Sin desarrollo urbano') return 0.85;
  return 1;
};

const getAccessFactor = (data: TerrenoInput) => {
  if (data.tipoVia) return lookup(FACTORES_TERRENO.acceso, data.tipoVia);
  if (data.accesoGeneral) return lookup(FACTORES_TERRENO.acceso, data.accesoGeneral);
  return lookup(FACTORES_TERRENO.acceso, data.acceso);
};

const isHighValueException = (data: TerrenoInput) => ['Turístico', 'Comercial'].includes(String(data.usoPotencial)) || ['Comercial', 'Natural/turístico'].includes(String(data.entorno || data.tipoEntorno));

const confianza = (data: TerrenoInput, areaM2Convertida: number, zona?: ZonaData): ResultadoAvaluo['nivelConfianza'] => {
  const requeridos = Boolean(zona?.zona) && areaM2Convertida > 0 && Boolean(data.usoPotencial) && Array.isArray(data.servicios) && data.servicios.length > 0;
  const ruralVariable = ['Rural productivo', 'Rural aislado'].includes(String(data.tipoTerritorio)) || ['Alta', 'Muy alta'].includes(String(data.nivelDeforestacion));
  const faltantesSecundarios = [data.tipoSuelo, data.topografia, data.tipoVia || data.accesoGeneral, data.seguridadZona, data.formaTerreno, data.entorno, data.desarrolloUrbano, data.nivelDeforestacion].filter((v) => !v).length;
  if (!requeridos || ruralVariable) return 'Baja';
  if (faltantesSecundarios > 2) return 'Medio';
  return 'Alto';
};

export const calculateLandValuation = (data: TerrenoInput, zona: ZonaData): ResultadoAvaluo => {
  const { areaOriginal, unidadArea, areaM2Convertida, areaManzanas } = normalizeArea(data);
  const basePriceM2 = getBasePriceM2(zona, data, areaManzanas);
  const factorEscala = getFactorEscala(areaM2Convertida);
  const scaleMultiplier = factorEscala;
  const riesgos = data.riesgos || (data.riesgoInundacion ? ['Riesgo de inundación'] : ['Ninguno']);
  const entorno = data.entorno || data.tipoEntorno;
  const zoneType = inferZoneType(zona, data);

  const coefNumericos = {
    factorZona: toSafeNumber(zona.factorPlusvalia, 1),
    factorTipoTerritorio: lookup(FACTORES_TERRENO.tipoTerritorio, data.tipoTerritorio),
    factorTipoSuelo: lookup(FACTORES_TERRENO.tipoSuelo, data.tipoSuelo),
    factorTopografia: lookup(FACTORES_TERRENO.topografia, data.topografia),
    factorAcceso: getAccessFactor(data),
    factorTrafico: lookup(FACTORES_TERRENO.nivelTrafico, data.nivelTrafico),
    factorSeguridadZona: lookup(FACTORES_TERRENO.seguridadZona, data.seguridadZona),
    factorForma: lookup(FACTORES_TERRENO.formaTerreno, data.formaTerreno),
    factorEntorno: lookup(FACTORES_TERRENO.entorno, entorno),
    factorUsoPotencial: lookup(FACTORES_TERRENO.usoPotencial, data.usoPotencial),
    factorDesarrolloUrbano: lookup(FACTORES_TERRENO.desarrolloUrbano, data.desarrolloUrbano),
    factorProximidad: getProximityFactor(data),
    factorRecursosNaturales: getNaturalResourcesFactor(data.recursosNaturales, riesgos),
    factorDeforestacion: lookup(FACTORES_TERRENO.nivelDeforestacion, data.nivelDeforestacion),
    factorServicios: getServiceFactor(data.servicios),
    factorLegal: lookup(FACTORES_TERRENO.legalStatus, data.legalStatus || 'Documentación completa'),
  };

  const factorSinLimite = Object.values(coefNumericos).reduce((a, v) => a * v, 1);
  const factorGlobal = clamp(factorSinLimite, FACTOR_MINIMO, FACTOR_MAXIMO);
  const valorBase = areaM2Convertida * basePriceM2;
  let adjustedPriceM2 = basePriceM2 * factorGlobal * factorEscala;
  const priceM2BeforeTechnicalCaps = adjustedPriceM2;
  let normalizacionAplicada = factorEscala < 1;
  let topeTecnicoAplicado = false;

  const limiteRuralM2 = zoneType === 'rural' && !isHighValueException(data)
    ? areaManzanas > 10
      ? 10
      : areaManzanas > 1
        ? 15
        : undefined
    : undefined;

  if (limiteRuralM2 !== undefined && adjustedPriceM2 > limiteRuralM2) {
    adjustedPriceM2 = limiteRuralM2;
    normalizacionAplicada = true;
    topeTecnicoAplicado = true;
  }

  const valorFinal = areaM2Convertida * adjustedPriceM2;
  const nivelConfianza = confianza(data, areaM2Convertida, zona);
  const rangoAmplio = zoneType === 'rural' && areaManzanas >= 1;
  const rangoMercado = rangoAmplio
    ? { minimo: valorFinal * 0.75, maximo: valorFinal * 1.25 }
    : { minimo: valorFinal * 0.85, maximo: valorFinal * 1.15 };

  const coeficientesAplicados: CoeficienteAplicado[] = [
    coefRow('Zona / plusvalía', zona.zona, coefNumericos.factorZona),
    coefRow('Precio base por m²', `${basePriceM2.toFixed(2)} USD/m²`, 1),
    coefRow('Normalización por escala', `Factor ${factorEscala.toFixed(2)} — ${getScaleExplanation(areaM2Convertida, areaManzanas, factorEscala)}`, factorEscala),
    coefRow('Categoría territorial', data.tipoTerritorio || 'No definido', coefNumericos.factorTipoTerritorio),
    coefRow('Tipo de suelo', data.tipoSuelo || 'No definido', coefNumericos.factorTipoSuelo),
    coefRow('Topografía', data.topografia || 'No definido', coefNumericos.factorTopografia),
    coefRow('Acceso', data.tipoVia || data.accesoGeneral || data.acceso || 'No definido', coefNumericos.factorAcceso),
    coefRow('Nivel de tráfico', String(data.nivelTrafico || 'No definido'), coefNumericos.factorTrafico),
    coefRow('Seguridad de la zona', String(data.seguridadZona || 'No definido'), coefNumericos.factorSeguridadZona),
    coefRow('Forma del terreno', data.formaTerreno || 'No definido', coefNumericos.factorForma),
    coefRow('Entorno', String(entorno || 'No definido'), coefNumericos.factorEntorno),
    coefRow('Uso potencial', data.usoPotencial || 'No definido', coefNumericos.factorUsoPotencial),
    coefRow('Cercanía', data.proximity || (data.cercaniaPrincipal ? 'Cerca de ciudad principal' : 'Según desarrollo urbano'), coefNumericos.factorProximidad),
    coefRow('Recursos naturales', (data.recursosNaturales || ['Ninguno']).join(', '), coefNumericos.factorRecursosNaturales),
    coefRow('Servicios disponibles', (data.servicios || ['Ninguno']).join(', '), coefNumericos.factorServicios),
    coefRow('Seguridad jurídica', data.legalStatus || 'Documentación completa', coefNumericos.factorLegal),
    coefRow('Factor global limitado', factorSinLimite === factorGlobal ? 'Dentro de rango técnico' : `Limitado de ${factorSinLimite.toFixed(3)} a ${factorGlobal.toFixed(3)}`, factorGlobal),
  ];

  if (topeTecnicoAplicado) {
    coeficientesAplicados.push(coefRow('Tope técnico rural', 'Se redujo el valor efectivo por m² para evitar sobrevaloración en grandes extensiones.', reductionCoef(adjustedPriceM2, priceM2BeforeTechnicalCaps)));
  }

  return {
    valorTerreno: toSafeNumber(valorFinal),
    valorConstruccion: 0,
    valorM2: safeDivide(valorFinal, areaM2Convertida, 0),
    clasificacionZona: zona.clasificacion,
    plusvaliaAplicada: coefNumericos.factorZona,
    coeficientesAplicados,
    rangoMercado,
    nivelConfianza,
    valorFinalEstimado: toSafeNumber(valorFinal),
    valorBase: toSafeNumber(valorBase),
    factorGlobal: toSafeNumber(factorGlobal, 1),
    areaOriginal,
    unidadArea,
    areaM2Convertida: toSafeNumber(areaM2Convertida),
    areaM2: toSafeNumber(areaM2Convertida),
    areaManzanas: toSafeNumber(areaManzanas),
    valorTerrenoM2: basePriceM2,
    basePriceM2,
    scaleMultiplier,
    adjustedPriceM2: toSafeNumber(adjustedPriceM2),
    lowValue: toSafeNumber(rangoMercado.minimo),
    estimatedValue: toSafeNumber(valorFinal),
    highValue: toSafeNumber(rangoMercado.maximo),
    appliedFactors: coeficientesAplicados,
    normalizacionAplicada,
    notaNormalizacion: normalizacionAplicada ? getScaleExplanation(areaM2Convertida, areaManzanas, factorEscala) : undefined,
  };
};

export const calcularTerreno = calculateLandValuation;
