import { FACTOR_ACCESO, FACTOR_FORMA, FACTOR_NIVEL_COMERCIAL, FACTOR_TOPOGRAFIA, FACTOR_USO } from './shared/coefficients';
import { confidence, range, sumServicios } from './shared/formulas';
import type { TerrenoInput, ZonaData, ResultadoAvaluo } from '../types/avaluo.types';

export const calcularTerreno = (data: TerrenoInput, zona: ZonaData): ResultadoAvaluo => {
  const coef = {
    plusvalia: zona.plusvalia,
    topografia: FACTOR_TOPOGRAFIA[data.topografia],
    acceso: FACTOR_ACCESO[data.acceso],
    servicios: sumServicios(data.servicios),
    usoPotencial: FACTOR_USO[data.usoPotencial],
    formaTerreno: FACTOR_FORMA[data.formaTerreno],
    nivelComercial: FACTOR_NIVEL_COMERCIAL[data.nivelComercial],
    esquina: data.esquina ? 1.06 : 1,
    cercaniaPrincipal: data.cercaniaPrincipal ? 1.05 : 0.96
  };
  const factorGlobal = Object.values(coef).reduce((a, v) => a * v, 1);
  const valorBase = data.areaTerreno * zona.valorTerrenoM2;
  const valorFinal = valorBase * factorGlobal;
  return { valorTerreno: valorFinal, valorConstruccion: 0, valorM2: valorFinal / data.areaTerreno, clasificacionZona: zona.clasificacion, plusvaliaAplicada: zona.plusvalia, coeficientesAplicados: { ...coef, factorGlobal }, rangoMercado: range(valorFinal), nivelConfianza: confidence(Object.keys(coef).length), valorFinalEstimado: valorFinal };
};
