import type { CiudadObjetivo, ZonaData } from '../types/avaluo.types';

export const ZONAS_POR_CIUDAD: Record<CiudadObjetivo, ZonaData[]> = {
  Matagalpa: [
    { ciudad: 'Matagalpa', zona: 'Molino Norte', clasificacion: 'Prime', valorTerrenoM2: 240, factorPlusvalia: 1.18 },
    { ciudad: 'Matagalpa', zona: 'Molino Sur', clasificacion: 'Alta', valorTerrenoM2: 210, factorPlusvalia: 1.14 },
    { ciudad: 'Matagalpa', zona: 'Guanuca', clasificacion: 'Alta', valorTerrenoM2: 190, factorPlusvalia: 1.11 },
    { ciudad: 'Matagalpa', zona: 'Las Tejas', clasificacion: 'Media', valorTerrenoM2: 165, factorPlusvalia: 1.07 },
    { ciudad: 'Matagalpa', zona: 'Apante', clasificacion: 'Media', valorTerrenoM2: 145, factorPlusvalia: 1.04 },
    { ciudad: 'Matagalpa', zona: 'Walter Mendoza', clasificacion: 'Emergente', valorTerrenoM2: 130, factorPlusvalia: 1.02 },
  ],
  Estelí: [
    { ciudad: 'Estelí', zona: 'Las Colinas', clasificacion: 'Prime', valorTerrenoM2: 260, factorPlusvalia: 1.22 },
    { ciudad: 'Estelí', zona: 'Boris Vega', clasificacion: 'Alta', valorTerrenoM2: 220, factorPlusvalia: 1.16 },
    { ciudad: 'Estelí', zona: 'Bella Vista', clasificacion: 'Alta', valorTerrenoM2: 205, factorPlusvalia: 1.13 },
    { ciudad: 'Estelí', zona: 'Alfredo Lazo', clasificacion: 'Media', valorTerrenoM2: 175, factorPlusvalia: 1.08 },
  ],
};
