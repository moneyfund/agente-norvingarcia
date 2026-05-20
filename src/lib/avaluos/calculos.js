import {
  factoresAcceso,
  factoresAntiguedad,
  factoresConstructivos,
  factoresEstado,
  factoresServicios,
  factoresTopograficos,
} from './coeficientes';

const getServiciosFactor = (servicios = []) =>
  servicios.reduce((factor, servicio) => factor * (factoresServicios[servicio] ?? 1), 1);

const getAntiguedadBucket = (anioConstruccion) => {
  if (!anioConstruccion) return 'media';
  const edad = new Date().getFullYear() - Number(anioConstruccion);
  if (edad <= 5) return 'nueva';
  if (edad <= 15) return 'reciente';
  if (edad <= 30) return 'media';
  return 'antigua';
};

export const calcularAvaluo = ({ formData, zonaData }) => {
  const areaTerreno = Number(formData.areaTotal || formData.areaTerreno || formData.manzanas * 6988.96 || 0);
  const areaConstruccion = Number(formData.areaConstruccion || 0);

  const topografiaFactor = factoresTopograficos[formData.topografia] ?? 1;
  const accesoFactor = factoresAcceso[formData.acceso || formData.accesoVehicular] ?? 1;
  const serviciosFactor = getServiciosFactor(formData.servicios || []);
  const estadoFactor = factoresEstado[formData.estado] ?? 1;
  const constructivoFactor = factoresConstructivos[formData.tipoConstruccion] ?? 1;
  const antiguedadFactor = factoresAntiguedad[getAntiguedadBucket(formData.anioConstruccion)] ?? 1;

  const factorGlobal = topografiaFactor * accesoFactor * serviciosFactor * estadoFactor * constructivoFactor * antiguedadFactor;

  const valorTerreno = areaTerreno * (zonaData?.valorTerrenoM2 || 0) * factorGlobal;
  const valorConstruccion = areaConstruccion * (zonaData?.valorConstruccionM2 || 0) * factorGlobal;
  const valorFinal = valorTerreno + valorConstruccion;

  return {
    valorTerreno,
    valorConstruccion,
    valorFinal,
    minimo: valorFinal * 0.9,
    promedio: valorFinal,
    maximo: valorFinal * 1.12,
    sugeridoVenta: valorFinal * 1.08,
    clasificacion: zonaData?.clasificacion || 'B',
    plusvalia: zonaData?.factorPlusvalia || 1,
    coeficientesAplicados: {
      topografiaFactor,
      accesoFactor,
      serviciosFactor,
      estadoFactor,
      constructivoFactor,
      antiguedadFactor,
      factorGlobal,
    },
  };
};
