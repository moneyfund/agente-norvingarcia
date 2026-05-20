import { calcularTerreno } from './terreno.engine';
import type { PropertyType, ResultadoAvaluo, TerrenoInput, ZonaData } from '../types/avaluo.types';

export const calcularAvaluo = (tipo: PropertyType, terreno: TerrenoInput, zona: ZonaData): ResultadoAvaluo => {
  if (tipo !== 'terreno') {
    throw new Error('El motor técnico de cálculo está habilitado por ahora para Terreno.');
  }
  return calcularTerreno(terreno, zona);
};
