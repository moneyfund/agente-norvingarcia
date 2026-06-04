import { safeDivide, toSafeFactor, toSafeNumber } from './shared/formulas';
import type { CoeficienteAplicado, TerrenoInput, ZonaData, ResultadoAvaluo } from '../types/avaluo.types';

export const M2_POR_MANZANA = 7042.25;
const FACTOR_MINIMO = 0.45;
const FACTOR_MAXIMO = 1.85;

export const FACTORES_TERRENO = {
  tipoTerritorio: { Urbano: 1.18, Semiurbano: 1.05, Semirural: 0.95, 'Rural cercano': 0.88, 'Rural productivo': 0.82, 'Rural aislado': 0.68 },
  tipoSuelo: { 'Suelo firme': 1.05, 'Suelo arcilloso': 0.94, 'Suelo rocoso': 0.92, 'Suelo arenoso': 0.9, 'Suelo húmedo': 0.86, 'Suelo agrícola fértil': 1.08, 'Suelo mixto': 1 },
  topografia: { Plano: 1.05, 'Semi plano': 1.02, Ondulado: 0.97, Inclinado: 0.9, 'Muy inclinado': 0.78, Quebrado: 0.7 },
  accesoGeneral: { Excelente: 1.1, Bueno: 1.03, Regular: 0.96, Difícil: 0.84, 'Muy difícil': 0.72 },
  tipoVia: { 'Carretera pavimentada': 1.1, 'Calle adoquinada': 1.05, 'Calle de concreto': 1.06, Macadán: 0.98, 'Tierra transitable': 0.9, 'Camino rural': 0.82, Vereda: 0.68 },
  nivelTrafico: { Alto: 1.05, Medio: 1, Bajo: 0.96, 'Muy bajo': 0.91 },
  seguridadZona: { Alta: 1.06, 'Media alta': 1.03, Media: 1, Baja: 0.9, Alto: 1.06, Medio: 1, Bajo: 0.9 },
  formaTerreno: { Regular: 1.03, 'Irregular leve': 0.96, Irregular: 0.94, 'Irregular compleja': 0.86, Esquinero: 1.08, 'Fondo amplio': 1.02, 'Frente amplio': 1.06 },
  entorno: { 'Residencial premium': 1.12, 'Residencial medio': 1.03, Comercial: 1.1, Mixto: 1.05, Popular: 0.93, 'Rural productivo': 0.96, 'Natural/turístico': 1.06, 'Residencial alta': 1.08, 'Residencial media': 1.03 },
  usoPotencial: { Residencial: 1.03, Comercial: 1.12, Mixto: 1.08, Lotificación: 1.1, Agrícola: 0.96, Ganadero: 0.92, Turístico: 1.08, 'Industrial liviano': 1.04, 'Reserva natural': 0.88 },
  desarrolloUrbano: { Consolidado: 1.08, 'En crecimiento': 1.04, Crecimiento: 1.04, Emergente: 0.99, 'Bajo desarrollo': 0.9, 'Sin desarrollo urbano': 0.78 },
  nivelDeforestacion: { 'Sin deforestación': 1.04, Baja: 1.01, Media: 0.96, Alta: 0.88, 'Muy alta': 0.78 },
} as const;

const IMPACTOS_RECURSOS: Record<string, number> = { 'Fuente de agua': 0.06, 'Río o quebrada': 0.04, Pozo: 0.04, 'Árboles maderables': 0.03, 'Vista panorámica': 0.05, 'Área cultivable': 0.04, Ninguno: -0.02 };
const IMPACTOS_SERVICIOS: Record<string, number> = { 'Agua potable': 0.04, agua: 0.04, 'Energía eléctrica': 0.04, energia: 0.04, Internet: 0.025, internet: 0.025, Drenaje: 0.025, drenaje: 0.025, 'Alumbrado público': 0.02, alumbradoPublico: 0.02, 'Transporte cercano': 0.025, transporteCercano: 0.025, Ninguno: -0.08, ninguno: -0.08 };
const IMPACTOS_RIESGOS: Record<string, number> = { 'Riesgo de inundación': -0.12, 'Riesgo de deslizamiento': -0.15, 'Zona de difícil acceso': -0.1, 'Conflicto de servidumbre': -0.09, Ninguno: 0 };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const normalizeArea = (data: TerrenoInput) => {
  const areaOriginal = toSafeNumber(data.areaOriginal ?? data.areaTerreno);
  const unidadArea = data.unidadArea || 'm2';
  return { areaOriginal, unidadArea, areaM2Convertida: unidadArea === 'manzana' ? areaOriginal * M2_POR_MANZANA : areaOriginal };
};
const lookup = (map: Record<string, number>, value: unknown) => toSafeFactor(map[String(value)]);
const arrayFactor = (values: unknown[] | undefined, impacts: Record<string, number>, min: number, max: number) => {
  const selected = Array.isArray(values) && values.length ? values : ['Ninguno'];
  const effective = selected.includes('Ninguno') ? ['Ninguno'] : selected;
  return clamp(1 + effective.reduce((sum, value) => sum + (impacts[String(value)] ?? 0), 0), min, max);
};
const impactText = (coeficiente: number) => {
  const pct = (coeficiente - 1) * 100;
  if (Math.abs(pct) < 0.1) return '0%';
  return `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`;
};
const coefRow = (factor: string, valorAplicado: string, coeficiente: number): CoeficienteAplicado => ({ factor, valorAplicado, coeficiente: toSafeNumber(coeficiente, 1), impacto: impactText(coeficiente) });
const confianza = (data: TerrenoInput, areaM2Convertida: number, zona?: ZonaData): ResultadoAvaluo['nivelConfianza'] => {
  const requeridos = Boolean(zona?.zona) && areaM2Convertida > 0 && Boolean(data.accesoGeneral) && Boolean(data.usoPotencial) && Array.isArray(data.servicios) && data.servicios.length > 0;
  const ruralVariable = ['Rural productivo', 'Rural aislado'].includes(String(data.tipoTerritorio)) || ['Alta', 'Muy alta'].includes(String(data.nivelDeforestacion));
  const faltantesSecundarios = [data.tipoSuelo, data.topografia, data.tipoVia, data.seguridadZona, data.formaTerreno, data.entorno, data.desarrolloUrbano, data.nivelDeforestacion].filter((v) => !v).length;
  if (!requeridos || ruralVariable) return 'Baja';
  if (faltantesSecundarios > 2) return 'Medio';
  return 'Alto';
};
const rangoMercado = (valorFinal: number, nivelConfianza: ResultadoAvaluo['nivelConfianza']) => nivelConfianza === 'Baja'
  ? { minimo: valorFinal * 0.85, maximo: valorFinal * 1.18 }
  : { minimo: valorFinal * 0.9, maximo: valorFinal * 1.12 };

export const calcularTerreno = (data: TerrenoInput, zona: ZonaData): ResultadoAvaluo => {
  const { areaOriginal, unidadArea, areaM2Convertida } = normalizeArea(data);
  const valorTerrenoM2 = toSafeNumber(zona.valorTerrenoM2);
  const factorRecursosNaturales = arrayFactor(data.recursosNaturales, IMPACTOS_RECURSOS, 0.9, 1.2);
  const factorServicios = arrayFactor(data.servicios, IMPACTOS_SERVICIOS, 0.82, 1.18);
  const riesgos = data.riesgos || (data.riesgoInundacion ? ['Riesgo de inundación'] : ['Ninguno']);
  const factorRiesgos = arrayFactor(riesgos, IMPACTOS_RIESGOS, 0.6, 1);
  const entorno = data.entorno || data.tipoEntorno;

  const coefNumericos = {
    factorZona: toSafeFactor(zona.factorPlusvalia),
    factorTipoTerritorio: lookup(FACTORES_TERRENO.tipoTerritorio, data.tipoTerritorio),
    factorTipoSuelo: lookup(FACTORES_TERRENO.tipoSuelo, data.tipoSuelo),
    factorTopografia: lookup(FACTORES_TERRENO.topografia, data.topografia),
    factorAccesoGeneral: data.accesoGeneral ? lookup(FACTORES_TERRENO.accesoGeneral, data.accesoGeneral) : lookup({ Pavimentado: 1.08, Adoquinado: 1.04, Macadán: 0.95, Tierra: 0.86 }, data.acceso),
    factorTipoVia: lookup(FACTORES_TERRENO.tipoVia, data.tipoVia),
    factorTrafico: lookup(FACTORES_TERRENO.nivelTrafico, data.nivelTrafico),
    factorSeguridad: lookup(FACTORES_TERRENO.seguridadZona, data.seguridadZona),
    factorForma: lookup(FACTORES_TERRENO.formaTerreno, data.formaTerreno),
    factorEntorno: lookup(FACTORES_TERRENO.entorno, entorno),
    factorUsoPotencial: lookup(FACTORES_TERRENO.usoPotencial, data.usoPotencial),
    factorDesarrolloUrbano: lookup(FACTORES_TERRENO.desarrolloUrbano, data.desarrolloUrbano),
    factorRecursosNaturales,
    factorDeforestacion: lookup(FACTORES_TERRENO.nivelDeforestacion, data.nivelDeforestacion),
    factorServicios,
    factorRiesgos,
  };

  const factorSinLimite = Object.values(coefNumericos).reduce((a, v) => a * v, 1);
  const factorGlobal = clamp(factorSinLimite, FACTOR_MINIMO, FACTOR_MAXIMO);
  const valorBase = areaM2Convertida * valorTerrenoM2;
  const valorFinal = valorBase * factorGlobal;
  const nivelConfianza = confianza(data, areaM2Convertida, zona);
  const coeficientesAplicados: CoeficienteAplicado[] = [
    coefRow('Zona / plusvalía', zona.zona, coefNumericos.factorZona),
    coefRow('Categoría territorial', data.tipoTerritorio || 'No definido', coefNumericos.factorTipoTerritorio),
    coefRow('Tipo de suelo', data.tipoSuelo || 'No definido', coefNumericos.factorTipoSuelo),
    coefRow('Topografía', data.topografia || 'No definido', coefNumericos.factorTopografia),
    coefRow('Acceso general', data.accesoGeneral || data.acceso || 'No definido', coefNumericos.factorAccesoGeneral),
    coefRow('Tipo de calle / vía', data.tipoVia || 'No definido', coefNumericos.factorTipoVia),
    coefRow('Nivel de tráfico', String(data.nivelTrafico || 'No definido'), coefNumericos.factorTrafico),
    coefRow('Seguridad de la zona', String(data.seguridadZona || 'No definido'), coefNumericos.factorSeguridad),
    coefRow('Forma del terreno', data.formaTerreno || 'No definido', coefNumericos.factorForma),
    coefRow('Entorno', String(entorno || 'No definido'), coefNumericos.factorEntorno),
    coefRow('Uso potencial', data.usoPotencial || 'No definido', coefNumericos.factorUsoPotencial),
    coefRow('Desarrollo urbano', data.desarrolloUrbano || 'No definido', coefNumericos.factorDesarrolloUrbano),
    coefRow('Recursos naturales', (data.recursosNaturales || ['Ninguno']).join(', '), coefNumericos.factorRecursosNaturales),
    coefRow('Nivel de deforestación', data.nivelDeforestacion || 'No definido', coefNumericos.factorDeforestacion),
    coefRow('Servicios disponibles', (data.servicios || ['Ninguno']).join(', '), coefNumericos.factorServicios),
    coefRow('Riesgos', riesgos.join(', '), coefNumericos.factorRiesgos),
    coefRow('Factor global limitado', factorSinLimite === factorGlobal ? 'Dentro de rango técnico' : `Limitado de ${factorSinLimite.toFixed(3)} a ${factorGlobal.toFixed(3)}`, factorGlobal),
  ];

  return {
    valorTerreno: toSafeNumber(valorFinal),
    valorConstruccion: 0,
    valorM2: safeDivide(valorFinal, areaM2Convertida, 0),
    clasificacionZona: zona.clasificacion,
    plusvaliaAplicada: coefNumericos.factorZona,
    coeficientesAplicados,
    rangoMercado: rangoMercado(toSafeNumber(valorFinal), nivelConfianza),
    nivelConfianza,
    valorFinalEstimado: toSafeNumber(valorFinal),
    valorBase: toSafeNumber(valorBase),
    factorGlobal: toSafeNumber(factorGlobal, 1),
    areaOriginal,
    unidadArea,
    areaM2Convertida: toSafeNumber(areaM2Convertida),
    valorTerrenoM2,
  };
};
