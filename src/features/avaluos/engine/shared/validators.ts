import type { CaracteristicasTerreno, ZonaData } from '../../types/avaluo.types';

export const assertZonaData = (zonaData: ZonaData | null): ZonaData => {
  if (!zonaData) throw new Error('Zona inexistente en catálogo de referencia.');
  if (!Number.isFinite(zonaData.valorTerrenoM2) || zonaData.valorTerrenoM2 <= 0) throw new Error('Zona inválida: valor de terreno no válido.');
  return zonaData;
};

export const assertTerrenoInput = (input: CaracteristicasTerreno): void => {
  if (!input.ciudad || !input.zona || !input.municipio) throw new Error('Complete ciudad, municipio y zona.');
  if (!Number.isFinite(input.areaTerreno) || input.areaTerreno <= 0 || input.areaTerreno > 500000) throw new Error('Área de terreno inválida.');
};
