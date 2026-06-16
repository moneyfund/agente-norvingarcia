import type { TerrenoInput } from '../types/avaluo.types';

export type TerrenoFormErrors = Partial<Record<keyof TerrenoInput, string>>;

export const validateTerreno = (data: Partial<TerrenoInput>): TerrenoFormErrors => {
  const errors: TerrenoFormErrors = {};
  if (data.ciudad !== 'Matagalpa') errors.ciudad = 'Seleccione Matagalpa';
  if (!data.zona) errors.zona = 'Seleccione zona';
  if (!data.unidadArea) errors.unidadArea = 'Seleccione unidad de área';
  if (!data.areaOriginal || data.areaOriginal <= 0) errors.areaOriginal = 'Área inválida';
  if (!data.tipoTerritorio) errors.tipoTerritorio = 'Seleccione categoría territorial';
  if (!data.tipoSuelo) errors.tipoSuelo = 'Seleccione tipo de suelo';
  if (!data.topografia) errors.topografia = 'Seleccione topografía';
  if (!data.accesoGeneral) errors.accesoGeneral = 'Seleccione acceso general';
  if (!data.tipoVia) errors.tipoVia = 'Seleccione tipo de vía';
  if (!data.usoPotencial) errors.usoPotencial = 'Seleccione uso potencial';
  if (!data.riesgos || data.riesgos.length === 0) errors.riesgos = 'Seleccione riesgos o Ninguno';
  return errors;
};
