import type { TerrenoInput } from '../types/avaluo.types';

export type TerrenoFormErrors = Partial<Record<keyof TerrenoInput, string>>;

export const validateTerreno = (data: Partial<TerrenoInput>): TerrenoFormErrors => {
  const errors: TerrenoFormErrors = {};
  if (!data.ciudad) errors.ciudad = 'Seleccione ciudad';
  if (!data.zona) errors.zona = 'Seleccione zona';
  if (!data.areaTerreno || data.areaTerreno <= 0) errors.areaTerreno = 'Área inválida';
  if (!data.topografia) errors.topografia = 'Seleccione topografía';
  if (!data.acceso) errors.acceso = 'Seleccione acceso';
  if (!data.usoPotencial) errors.usoPotencial = 'Seleccione uso potencial';
  if (!data.servicios || data.servicios.length === 0) errors.servicios = 'Seleccione al menos un servicio';
  return errors;
};
