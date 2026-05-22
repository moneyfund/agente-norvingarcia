import type { ResultadoAvaluo, ZonaData } from '../types/avaluo.types';
import { FACTOR_FLUJO_COMERCIAL, FACTOR_VISIBILIDAD } from './shared/coefficients';
import { calcRangoMercado, calcValorBaseTerreno, calcValorConstruccion } from './shared/formulas';
import { round2, weightedScore } from './shared/normalizers';

const key = (v: unknown) => String(v ?? '').toLowerCase();

export const calcularComercial = (data: Record<string, unknown>, zona: ZonaData): ResultadoAvaluo => {
  const area = Number(data.areaConstruccion ?? 0);
  const terrenoEq = area * 0.55;
  const valorTerreno = calcValorBaseTerreno(terrenoEq, zona.valorTerrenoM2);
  const valorConstruccion = calcValorConstruccion(area, zona.valorTerrenoM2 * 1.25);
  const flujo = FACTOR_FLUJO_COMERCIAL[key(data.flujoComercial) as keyof typeof FACTOR_FLUJO_COMERCIAL] ?? 1;
  const visibilidad = FACTOR_VISIBILIDAD[key(data.visibilidad) as keyof typeof FACTOR_VISIBILIDAD] ?? 1;
  const ajuste = weightedScore([{ weight: 0.5, factor: flujo }, { weight: 0.35, factor: visibilidad }, { weight: 0.15, factor: zona.factorPlusvalia }]);
  const valorFinalEstimado = round2((valorTerreno + valorConstruccion) * ajuste);
  const nivelConfianza = area > 0 ? 'Medio' : 'Base';
  return { valorTerreno, valorPorM2Final: round2(valorFinalEstimado / Math.max(area, 1)), clasificacionUrbana: zona.clasificacion, factorPlusvalia: zona.factorPlusvalia, coeficientesAplicados: { topografia: 1, acceso: round2(visibilidad), servicios: 1, usoPotencial: round2(flujo), plusvalia: round2(ajuste), factorGlobal: round2(ajuste) }, valorFinalEstimado, rangoMercado: calcRangoMercado(valorFinalEstimado, nivelConfianza), nivelConfianza };
};
