import type { CoeficientesAplicados, ResultadoAvaluo, TerrenoInput, ZonaData } from '../types/avaluo.types';
import { FACTOR_ACCESO, FACTOR_TOPOGRAFIA, FACTOR_USO } from './shared/coefficients';
import { calcRangoMercado, calcValorBaseTerreno } from './shared/formulas';
import { normalizeFactor, round2, weightedScore } from './shared/normalizers';
import { TERRAIN_WEIGHTS } from './shared/weights';

const serviceFactor = (cantidad: number) => normalizeFactor(0.8 + cantidad * 0.08);

export const calcularTerreno = (input: TerrenoInput, zona: ZonaData): ResultadoAvaluo => {
  const coef: CoeficientesAplicados = {
    topografia: FACTOR_TOPOGRAFIA[input.topografia],
    acceso: FACTOR_ACCESO[input.acceso],
    servicios: round2(serviceFactor(input.servicios.length)),
    usoPotencial: FACTOR_USO[input.usoPotencial],
    plusvalia: normalizeFactor(zona.factorPlusvalia),
    factorGlobal: 1,
  };

  const factorPonderado = weightedScore([
    { weight: TERRAIN_WEIGHTS.UBICACION, factor: 1.05 },
    { weight: TERRAIN_WEIGHTS.TOPOGRAFIA, factor: coef.topografia },
    { weight: TERRAIN_WEIGHTS.ACCESO, factor: coef.acceso },
    { weight: TERRAIN_WEIGHTS.SERVICIOS, factor: coef.servicios },
    { weight: TERRAIN_WEIGHTS.USO_POTENCIAL, factor: coef.usoPotencial },
    { weight: TERRAIN_WEIGHTS.PLUSVALIA, factor: coef.plusvalia },
  ]);

  coef.factorGlobal = round2(factorPonderado);
  const valorTerreno = calcValorBaseTerreno(input.areaTerreno, zona.valorTerrenoM2);
  const valorFinalEstimado = round2(valorTerreno * coef.factorGlobal);
  const nivelConfianza = input.servicios.length >= 4 ? 'Alto' : input.servicios.length >= 2 ? 'Medio' : 'Base';

  return {
    valorTerreno,
    valorPorM2Final: round2(valorFinalEstimado / Math.max(input.areaTerreno, 1)),
    clasificacionUrbana: zona.clasificacion,
    factorPlusvalia: zona.factorPlusvalia,
    coeficientesAplicados: coef,
    valorFinalEstimado,
    rangoMercado: calcRangoMercado(valorFinalEstimado, nivelConfianza),
    nivelConfianza,
  };
};
