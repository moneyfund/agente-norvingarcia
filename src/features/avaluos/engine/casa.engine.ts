import type { ResultadoAvaluo, ZonaData } from '../types/avaluo.types';
import { FACTOR_ACABADOS, FACTOR_ESTADO, FACTOR_TIPO_CONSTRUCCION } from './shared/coefficients';
import { calcRangoMercado, calcValorBaseTerreno, calcValorConstruccion } from './shared/formulas';
import { normalizeFactor, round2, weightedScore } from './shared/normalizers';
import { HOUSE_WEIGHTS } from './shared/weights';

const parseKey = (value: unknown) => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase().replace(/\s+/g, '_');

const edadFactor = (edad: number) => normalizeFactor(1.12 - Math.min(Math.max(edad, 0), 50) * 0.006);

export const calcularCasa = (data: Record<string, unknown>, zona: ZonaData): ResultadoAvaluo => {
  const areaTerreno = Number(data.areaTerreno ?? 0);
  const areaConstruccion = Number(data.areaConstruccion ?? 0);
  const estado = FACTOR_ESTADO[parseKey(data.estadoConstruccion) as keyof typeof FACTOR_ESTADO] ?? 1;
  const acabados = FACTOR_ACABADOS[parseKey(data.acabados) as keyof typeof FACTOR_ACABADOS] ?? 1;
  const tipoConstruccion = FACTOR_TIPO_CONSTRUCCION[parseKey(data.tipoConstruccion) as keyof typeof FACTOR_TIPO_CONSTRUCCION] ?? 1;
  const antiguedad = edadFactor(Number(data.antiguedad ?? 15));

  const valorTerreno = calcValorBaseTerreno(areaTerreno, zona.valorTerrenoM2);
  const valorConstruccionBase = calcValorConstruccion(areaConstruccion, zona.valorTerrenoM2 * 0.95);
  const factorConstruccion = weightedScore([
    { weight: HOUSE_WEIGHTS.ESTADO, factor: estado },
    { weight: HOUSE_WEIGHTS.ACABADOS, factor: acabados },
    { weight: HOUSE_WEIGHTS.ANTIGUEDAD, factor: antiguedad },
    { weight: HOUSE_WEIGHTS.TIPO_CONSTRUCCION, factor: tipoConstruccion },
  ]);
  const valorConstruccion = round2(valorConstruccionBase * factorConstruccion);

  const ajusteComercial = weightedScore([
    { weight: HOUSE_WEIGHTS.TERRENO, factor: normalizeFactor(zona.factorPlusvalia) },
    { weight: HOUSE_WEIGHTS.CONSTRUCCION, factor: factorConstruccion },
    { weight: HOUSE_WEIGHTS.AJUSTE_COMERCIAL, factor: 1.02 },
  ]);

  const valorFinalEstimado = round2((valorTerreno + valorConstruccion) * ajusteComercial);
  const nivelConfianza = areaTerreno > 0 && areaConstruccion > 0 ? 'Alto' : 'Medio';

  return {
    valorTerreno,
    valorPorM2Final: round2(valorFinalEstimado / Math.max(areaTerreno + areaConstruccion, 1)),
    clasificacionUrbana: zona.clasificacion,
    factorPlusvalia: zona.factorPlusvalia,
    coeficientesAplicados: { topografia: 1, acceso: 1, servicios: round2(factorConstruccion), usoPotencial: 1, plusvalia: round2(ajusteComercial), factorGlobal: round2(ajusteComercial) },
    valorFinalEstimado,
    rangoMercado: calcRangoMercado(valorFinalEstimado, nivelConfianza),
    nivelConfianza,
  };
};
