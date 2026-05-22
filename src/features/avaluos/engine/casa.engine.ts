import { FACTOR_ACABADOS, FACTOR_ACCESO, FACTOR_ESTADO, FACTOR_NIVEL_COMERCIAL, FACTOR_TOPOGRAFIA } from './shared/coefficients';
import { confidence, range, sumServicios } from './shared/formulas';
import { COSTO_CONSTRUCCION_M2 } from './shared/ranges';
import type { CasaInput, ZonaData, ResultadoAvaluo } from '../types/avaluo.types';

const antiguedadFactor = { '0-5': 1.08, '6-10': 1, '11-20': 0.9, '20+': 0.78 };

export const calcularCasa = (data: CasaInput, zona: ZonaData): ResultadoAvaluo => {
  const terrenoBase = data.areaTerreno * zona.valorTerrenoM2;
  const construccionBase = data.areaConstruccion * COSTO_CONSTRUCCION_M2[data.tipoConstruccion];
  const coef = {
    plusvalia: zona.plusvalia,
    topografia: FACTOR_TOPOGRAFIA[data.topografia],
    acceso: FACTOR_ACCESO[data.acceso],
    servicios: sumServicios(data.servicios),
    nivelComercial: FACTOR_NIVEL_COMERCIAL[data.nivelComercial],
    estado: FACTOR_ESTADO[data.estadoConstruccion],
    acabados: FACTOR_ACABADOS[data.acabados],
    antiguedad: antiguedadFactor[data.antiguedad],
    funcionalidad: (data.garaje ? 1.03 : 0.99) * (data.patio ? 1.02 : 0.99) * (data.jardin ? 1.02 : 0.99)
  };
  const factorGlobal = Object.values(coef).reduce((a, v) => a * v, 1);
  const valorTerreno = terrenoBase * coef.plusvalia * coef.topografia * coef.acceso;
  const valorConstruccion = construccionBase * coef.estado * coef.acabados * coef.antiguedad * coef.funcionalidad * coef.servicios * coef.nivelComercial;
  const final = (valorTerreno + valorConstruccion) * (coef.plusvalia + 0.02);
  return { valorTerreno, valorConstruccion, valorM2: final / data.areaConstruccion, clasificacionZona: zona.clasificacion, plusvaliaAplicada: zona.plusvalia, coeficientesAplicados: { ...coef, factorGlobal }, rangoMercado: range(final), nivelConfianza: confidence(Object.keys(coef).length), valorFinalEstimado: final };
};
