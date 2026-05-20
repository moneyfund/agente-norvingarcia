import type { CaracteristicasTerreno } from '../types/avaluo.types';

export type TerrenoFormErrors = Partial<Record<keyof CaracteristicasTerreno, string>>;

export const validateTerreno = (data: Partial<CaracteristicasTerreno>): TerrenoFormErrors => {
  const errors: TerrenoFormErrors = {};
  if (!data.ciudad) errors.ciudad = 'Seleccione una ciudad válida.';
  if (!data.municipio?.trim()) errors.municipio = 'Municipio requerido.';
  if (!data.zona?.trim()) errors.zona = 'Zona requerida.';
  if (!Number.isFinite(data.areaTerreno) || Number(data.areaTerreno) <= 0) errors.areaTerreno = 'Área debe ser mayor a 0.';
  if ((data.servicios?.length ?? 0) < 1) errors.servicios = 'Seleccione al menos un servicio.';
  return errors;
};
