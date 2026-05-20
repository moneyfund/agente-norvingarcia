import { calcularTerreno } from './terreno.engine';
import type { PropertyType, ResultadoAvaluo, TerrenoInput, ZonaData } from '../types/avaluo.types';

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const mapToTerrenoInput = (tipo: PropertyType, data: Record<string, unknown>): TerrenoInput => ({
  ciudad: data.ciudad as TerrenoInput['ciudad'],
  zona: String(data.zona ?? ''),
  areaTerreno: toNumber(data.areaTerreno ?? data.areaTotal ?? data.areaConstruccion ?? data.extensionManzanas, 1),
  topografia: tipo === 'finca' ? (({ Plano: 'plano', 'Semi plano': 'semiPlano', Inclinado: 'inclinado', Quebrado: 'quebrado' }[String(data.topografia)] ?? 'semiPlano') as TerrenoInput['topografia']) : 'plano',
  acceso: 'pavimentado',
  servicios: ['agua', 'energia', 'internet'],
  usoPotencial: tipo === 'comercial' ? 'comercial' : tipo === 'finca' ? 'agricola' : 'residencial',
});

export const calcularAvaluo = (tipo: PropertyType, data: Record<string, unknown>, zona: ZonaData): ResultadoAvaluo => {
  const mapped = tipo === 'terreno' ? (data as TerrenoInput) : mapToTerrenoInput(tipo, data);
  return calcularTerreno(mapped, zona);
};
