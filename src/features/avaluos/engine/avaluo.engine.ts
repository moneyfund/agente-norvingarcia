import { calcularCasa } from './casa.engine';
import { calcularComercial } from './comercial.engine';
import { calcularFinca } from './finca.engine';
import { calcularTerreno } from './terreno.engine';
import type { AvaluoInput, ResultadoAvaluo } from '../types/avaluo.types';

export const calcularAvaluo = (input: AvaluoInput): ResultadoAvaluo => {
  switch (input.tipoPropiedad) {
    case 'terreno':
      return calcularTerreno(input.caracteristicas, input.zonaData);
    case 'casa':
      return calcularCasa();
    case 'finca':
      return calcularFinca();
    case 'comercial':
      return calcularComercial();
    default:
      throw new Error('Tipo de propiedad no soportado por el motor.');
  }
};
