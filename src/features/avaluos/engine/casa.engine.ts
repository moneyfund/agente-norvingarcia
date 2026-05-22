import { FACTOR_ACABADOS, FACTOR_ACCESO, FACTOR_ESTADO, FACTOR_NIVEL_COMERCIAL, FACTOR_TOPOGRAFIA } from './shared/coefficients';
import { confidence, range, safeDivide, sumServicios, toSafeFactor, toSafeNumber } from './shared/formulas';
import { COSTO_CONSTRUCCION_M2 } from './shared/ranges';
import type { CasaInput, ZonaData, ResultadoAvaluo } from '../types/avaluo.types';

const antiguedadFactor = { '0-5': 1.08, '6-10': 1, '11-20': 0.9, '20+': 0.78 };

export const calcularCasa = (data: CasaInput, zona: ZonaData): ResultadoAvaluo => {
  const areaTerreno = toSafeNumber(data.areaTerreno);
  const areaConstruccion = toSafeNumber(data.areaConstruccion);
  const valorTerrenoM2 = toSafeNumber(zona.valorTerrenoM2);
  const costoConstruccionM2 = toSafeNumber(COSTO_CONSTRUCCION_M2[data.tipoConstruccion], 0);
  const terrenoBase = areaTerreno * valorTerrenoM2;
  const construccionBase = areaConstruccion * costoConstruccionM2;
  const coef = {
    plusvalia: toSafeFactor(zona.factorPlusvalia),
    topografia: toSafeFactor(FACTOR_TOPOGRAFIA[data.topografia]),
    acceso: toSafeFactor(FACTOR_ACCESO[data.acceso]),
    servicios: toSafeFactor(sumServicios(data.servicios || [])),
    nivelComercial: toSafeFactor(FACTOR_NIVEL_COMERCIAL[data.nivelComercial]),
    estado: toSafeFactor(FACTOR_ESTADO[data.estadoConstruccion]),
    acabados: toSafeFactor(FACTOR_ACABADOS[data.acabados]),
    antiguedad: toSafeFactor(antiguedadFactor[data.antiguedad]),
    funcionalidad: (data.garaje ? 1.03 : 0.99) * (data.patio ? 1.02 : 0.99) * (data.jardin ? 1.02 : 0.99)
  };
  const factorGlobal = Object.values(coef).reduce((a, v) => a * v, 1);
  const valorTerreno = terrenoBase * coef.plusvalia * coef.topografia * coef.acceso;
  const valorConstruccion = construccionBase * coef.estado * coef.acabados * coef.antiguedad * coef.funcionalidad * coef.servicios * coef.nivelComercial;
  const final = (valorTerreno + valorConstruccion) * (coef.plusvalia + 0.02);
  const valorFinal = toSafeNumber(final);
  return { valorTerreno: toSafeNumber(valorTerreno), valorConstruccion: toSafeNumber(valorConstruccion), valorM2: safeDivide(valorFinal, areaConstruccion || areaTerreno, 0), clasificacionZona: zona.clasificacion, plusvaliaAplicada: coef.plusvalia, coeficientesAplicados: { ...coef, factorGlobal: toSafeNumber(factorGlobal, 1) }, rangoMercado: range(valorFinal), nivelConfianza: confidence(Object.keys(coef).length), valorFinalEstimado: valorFinal };
};
