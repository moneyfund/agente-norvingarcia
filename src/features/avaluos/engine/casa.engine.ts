import { FACTOR_ACABADOS, FACTOR_ACCESO, FACTOR_ESTADO, FACTOR_NIVEL_COMERCIAL, FACTOR_TOPOGRAFIA } from './shared/coefficients';
import { confidence, formatServiciosBasicos, getServiciosBasicosFactor, range, safeDivide, toSafeFactor, toSafeNumber } from './shared/formulas';
import { COSTO_CONSTRUCCION_M2 } from './shared/ranges';
import type { CasaInput, CoeficienteAplicado, ZonaData, ResultadoAvaluo } from '../types/avaluo.types';

const impactText = (coeficiente: number) => {
  const pct = (coeficiente - 1) * 100;
  if (Math.abs(pct) < 0.1) return '0%';
  return `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`;
};
const coefRow = (factor: string, valorAplicado: string, coeficiente: number): CoeficienteAplicado => ({ factor, valorAplicado, coeficiente: toSafeNumber(coeficiente, 1), impacto: impactText(coeficiente) });

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
    serviciosBasicos: toSafeFactor(getServiciosBasicosFactor(data.serviciosBasicos)),
    nivelComercial: toSafeFactor(FACTOR_NIVEL_COMERCIAL[data.nivelComercial]),
    estado: toSafeFactor(FACTOR_ESTADO[data.estadoConstruccion]),
    acabados: toSafeFactor(FACTOR_ACABADOS[data.acabados]),
    antiguedad: toSafeFactor(antiguedadFactor[data.antiguedad]),
    funcionalidad: (data.garaje ? 1.03 : 0.99) * (data.patio ? 1.02 : 0.99) * (data.jardin ? 1.02 : 0.99)
  };
  const factorGlobal = Object.values(coef).reduce((a, v) => a * v, 1);
  const valorTerreno = terrenoBase * coef.plusvalia * coef.topografia * coef.acceso;
  const valorConstruccion = construccionBase * coef.estado * coef.acabados * coef.antiguedad * coef.funcionalidad * coef.serviciosBasicos * coef.nivelComercial;
  const final = (valorTerreno + valorConstruccion) * (coef.plusvalia + 0.02);
  const valorFinal = toSafeNumber(final);
  const coeficientesAplicados: CoeficienteAplicado[] = [
    coefRow('Zona / plusvalía', zona.zona, coef.plusvalia),
    coefRow('Topografía', data.topografia || 'No definido', coef.topografia),
    coefRow('Acceso', data.acceso || data.accesoGeneral || data.tipoVia || 'No definido', coef.acceso),
    coefRow('Servicios básicos', formatServiciosBasicos(data.serviciosBasicos), coef.serviciosBasicos),
    coefRow('Nivel comercial', data.nivelComercial || 'No definido', coef.nivelComercial),
    coefRow('Estado construcción', data.estadoConstruccion || 'No definido', coef.estado),
    coefRow('Acabados', data.acabados || 'No definido', coef.acabados),
    coefRow('Antigüedad', data.antiguedad || 'No definido', coef.antiguedad),
    coefRow('Funcionalidad', `Garaje: ${data.garaje ? 'Sí' : 'No'}, Patio: ${data.patio ? 'Sí' : 'No'}, Jardín: ${data.jardin ? 'Sí' : 'No'}`, coef.funcionalidad),
    coefRow('Factor global', 'Producto de coeficientes técnicos', factorGlobal),
  ];
  return { valorTerreno: toSafeNumber(valorTerreno), valorConstruccion: toSafeNumber(valorConstruccion), valorM2: safeDivide(valorFinal, areaConstruccion || areaTerreno, 0), clasificacionZona: zona.clasificacion, plusvaliaAplicada: coef.plusvalia, coeficientesAplicados, rangoMercado: range(valorFinal), nivelConfianza: confidence(coeficientesAplicados.length), valorFinalEstimado: valorFinal };
};
