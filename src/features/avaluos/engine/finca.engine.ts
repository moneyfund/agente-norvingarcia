import type { ResultadoAvaluo, ZonaData } from '../types/avaluo.types';
import { calcularTerreno } from './terreno.engine';

export const calcularFinca = (data: Record<string, unknown>, zona: ZonaData): ResultadoAvaluo => {
  const manzanaM2 = 6987;
  return calcularTerreno({
    ciudad: data.ciudad as 'Matagalpa' | 'Estelí',
    zona: String(data.zona ?? ''),
    areaTerreno: Number(data.extensionManzanas ?? 0) * manzanaM2,
    topografia: ({ Plano: 'plano', 'Semi plano': 'semiPlano', Inclinado: 'inclinado', Quebrado: 'quebrado' }[String(data.topografia)] ?? 'semiPlano') as 'plano',
    acceso: String(data.acceso ?? '').toLowerCase() === 'todo tiempo' ? 'macadan' : 'tierra',
    servicios: ['agua', 'energia'],
    usoPotencial: 'agricola',
  }, zona);
};
