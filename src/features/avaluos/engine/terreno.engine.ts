import { getTerrenoCoeficientes } from './shared/coefficients';
import { calcRango } from './shared/formulas';
import { roundCurrency } from './shared/rounding';
import { assertTerrenoInput, assertZonaData } from './shared/validators';
import type { CaracteristicasTerreno, ResultadoAvaluo, ZonaData } from '../types/avaluo.types';

export const calcularTerreno = (caracteristicas: CaracteristicasTerreno, zonaData: ZonaData | null): ResultadoAvaluo => {
  assertTerrenoInput(caracteristicas);
  const zona = assertZonaData(zonaData);
  const coeficientesAplicados = getTerrenoCoeficientes(caracteristicas, zona);

  const valorTerreno = roundCurrency(caracteristicas.areaTerreno * zona.valorTerrenoM2 * coeficientesAplicados.factorGlobal);
  const valorConstruccion = 0;
  const valorFinal = roundCurrency(valorTerreno + valorConstruccion);

  return {
    valorTerreno,
    valorConstruccion,
    valorFinal,
    rangoEstimado: calcRango(valorFinal),
    clasificacionUrbana: zona.clasificacion,
    nivelPlusvalia: zona.factorPlusvalia,
    coeficientesAplicados,
    observacionesTecnicas: [
      `Zona ${zona.zona} clasificada como ${zona.clasificacion}.`,
      'Motor fase inicial centrado en terreno sin construcción.',
    ],
  };
};
