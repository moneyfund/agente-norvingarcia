import { MARKET_RANGE_BY_CONFIDENCE } from './ranges';
import { round2 } from './normalizers';

export const calcValorBaseTerreno = (areaTerreno: number, valorTerrenoM2: number) => round2(areaTerreno * valorTerrenoM2);
export const calcValorConstruccion = (areaConstruccion: number, valorConstruccionM2: number) => round2(areaConstruccion * valorConstruccionM2);

export const calcRangoMercado = (valorFinal: number, nivelConfianza: keyof typeof MARKET_RANGE_BY_CONFIDENCE) => {
  const band = MARKET_RANGE_BY_CONFIDENCE[nivelConfianza];
  return {
    minimo: round2(valorFinal * (1 - band)),
    maximo: round2(valorFinal * (1 + band)),
  };
};
