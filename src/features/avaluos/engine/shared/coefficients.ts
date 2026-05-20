import { ACCESO, PLUSVALIA, SERVICIOS, TOPOGRAFIA } from '../../constants/coefficients';
import type { CaracteristicasTerreno, Coeficientes, ZonaData } from '../../types/avaluo.types';

const resolvePlusvalia = (zona: ZonaData): number => {
  if (zona.factorPlusvalia >= 1.8) return PLUSVALIA.alta;
  if (zona.factorPlusvalia >= 1.3) return PLUSVALIA.media;
  return PLUSVALIA.emergente;
};

export const getTerrenoCoeficientes = (data: CaracteristicasTerreno, zona: ZonaData): Coeficientes => {
  const serviciosFactor = data.servicios.reduce((acc, item) => acc * (SERVICIOS[item] ?? 1), 1);
  const plusvaliaFactor = resolvePlusvalia(zona);
  const factorGlobal = TOPOGRAFIA[data.topografia] * ACCESO[data.acceso] * serviciosFactor * plusvaliaFactor;

  return {
    topografia: TOPOGRAFIA[data.topografia],
    acceso: ACCESO[data.acceso],
    servicios: serviciosFactor,
    plusvalia: plusvaliaFactor,
    factorGlobal,
  };
};
