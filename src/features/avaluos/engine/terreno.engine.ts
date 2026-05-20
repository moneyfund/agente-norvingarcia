import type { CoeficientesAplicados, ResultadoAvaluo, TerrenoInput, ZonaData } from '../types/avaluo.types';

const FACTOR_TOPOGRAFIA = { plano: 1.08, semiPlano: 1.04, inclinado: 0.97, quebrado: 0.9 } as const;
const FACTOR_ACCESO = { pavimentado: 1.08, adoquinado: 1.04, macadan: 0.97, tierra: 0.9 } as const;
const FACTOR_USO = { residencial: 1.03, comercial: 1.1, industrial: 1.06, turistico: 1.08, agricola: 0.95 } as const;

const round2 = (n: number) => Math.round(n * 100) / 100;

export const calcularTerreno = (input: TerrenoInput, zona: ZonaData): ResultadoAvaluo => {
  const factorServicios = 0.92 + input.servicios.length * 0.03;
  const coef: CoeficientesAplicados = {
    topografia: FACTOR_TOPOGRAFIA[input.topografia],
    acceso: FACTOR_ACCESO[input.acceso],
    servicios: round2(factorServicios),
    usoPotencial: FACTOR_USO[input.usoPotencial],
    plusvalia: zona.factorPlusvalia,
    factorGlobal: 1,
  };
  coef.factorGlobal = round2(coef.topografia * coef.acceso * coef.servicios * coef.usoPotencial * coef.plusvalia);

  const valorBase = input.areaTerreno * zona.valorTerrenoM2;
  const valorFinalEstimado = round2(valorBase * coef.factorGlobal);
  const valorPorM2Final = round2(valorFinalEstimado / input.areaTerreno);

  return {
    valorTerreno: round2(valorBase),
    valorPorM2Final,
    clasificacionUrbana: zona.clasificacion,
    factorPlusvalia: zona.factorPlusvalia,
    coeficientesAplicados: coef,
    valorFinalEstimado,
    rangoMercado: { minimo: round2(valorFinalEstimado * 0.93), maximo: round2(valorFinalEstimado * 1.07) },
    nivelConfianza: input.servicios.length >= 4 ? 'Alto' : input.servicios.length >= 2 ? 'Medio' : 'Base',
  };
};
