import { calcularBodega } from './bodega.engine';
import { calcularCasa } from './casa.engine';
import { calcularComercial } from './comercial.engine';
import { calcularFinca } from './finca.engine';
import { calcularQuinta } from './quinta.engine';
import { calcularTerreno } from './terreno.engine';
import type { PropertyType, ResultadoAvaluo, TerrenoInput, ZonaData } from '../types/avaluo.types';

export const calcularAvaluo = (tipo: PropertyType, data: Record<string, unknown>, zona: ZonaData): ResultadoAvaluo => {
  switch (tipo) {
    case 'terreno':
      return calcularTerreno(data as TerrenoInput, zona);
    case 'casa':
      return calcularCasa(data, zona);
    case 'finca':
      return calcularFinca(data, zona);
    case 'quinta':
      return calcularQuinta(data, zona);
    case 'bodega':
      return calcularBodega(data, zona);
    case 'comercial':
      return calcularComercial(data, zona);
    default:
      return calcularTerreno(data as TerrenoInput, zona);
  }
};
