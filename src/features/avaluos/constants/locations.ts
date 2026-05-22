import { MATAGALPA_ZONES } from './matagalpaZones';

export const CIUDAD_UNICA = 'Matagalpa' as const;

export const ZONAS_MATAGALPA = MATAGALPA_ZONES;

export const ZONAS_POR_CIUDAD = {
  Matagalpa: MATAGALPA_ZONES,
} as const;
