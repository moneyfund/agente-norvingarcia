import { FACTOR_ACCESO, FACTOR_FORMA, FACTOR_NIVEL_COMERCIAL, FACTOR_TOPOGRAFIA, FACTOR_USO } from './shared/coefficients';
import { confidence, range, sumServicios } from './shared/formulas';
import type { TerrenoInput, ZonaData, ResultadoAvaluo } from '../types/avaluo.types';

export const calcularTerreno = (data: TerrenoInput, zona: ZonaData): ResultadoAvaluo => {
  const coef = {
    plusvalia: zona.factorPlusvalia,
    topografia: FACTOR_TOPOGRAFIA[data.topografia],
    acceso: FACTOR_ACCESO[data.acceso],
    servicios: sumServicios(data.servicios),
    usoPotencial: FACTOR_USO[data.usoPotencial],
    formaTerreno: FACTOR_FORMA[data.formaTerreno],
    nivelComercial: FACTOR_NIVEL_COMERCIAL[data.nivelComercial],
    esquina: data.esquina ? 1.06 : 1,
    cercaniaPrincipal: data.cercaniaPrincipal ? 1.05 : 0.96,
    frenteFondo: data.frenteTerreno && data.fondoTerreno ? (data.frenteTerreno / data.fondoTerreno >= 0.6 ? 1.03 : 0.97) : 1,
    pendiente: data.pendiente ? 0.95 : 1,
    cercaniaComercial: data.cercaniaComercial ? 1.05 : 1,
    exposicionComercial: data.exposicionComercial === 'Alta' ? 1.09 : data.exposicionComercial === 'Media' ? 1.03 : 0.97,
    tipoEntorno: data.tipoEntorno === 'Residencial premium' ? 1.1 : data.tipoEntorno === 'Comercial' ? 1.08 : data.tipoEntorno === 'Mixto' ? 1.04 : data.tipoEntorno === 'Residencial media' ? 1.01 : 0.95,
    riesgoInundacion: data.riesgoInundacion ? 0.88 : 1,
    seguridadZona: data.seguridadZona === 'Alto' ? 1.06 : data.seguridadZona === 'Medio' ? 1 : 0.94,
    desarrolloUrbano: data.desarrolloUrbano === 'Consolidado' ? 1.07 : data.desarrolloUrbano === 'Crecimiento' ? 1.04 : data.desarrolloUrbano === 'Emergente' ? 1 : 0.94,
    densidadUrbana: data.densidadUrbana === 'Alto' ? 1.04 : data.densidadUrbana === 'Medio' ? 1 : 0.96,
    potencialSubdivision: data.potencialSubdivision ? 1.06 : 1,
    nivelTrafico: data.nivelTrafico === 'Alto' ? 1.04 : data.nivelTrafico === 'Medio' ? 1 : 0.97
  };
  const factorGlobal = Object.values(coef).reduce((a, v) => a * v, 1);
  const valorBase = data.areaTerreno * zona.valorTerrenoM2;
  const valorFinal = valorBase * factorGlobal;
  return { valorTerreno: valorFinal, valorConstruccion: 0, valorM2: valorFinal / data.areaTerreno, clasificacionZona: zona.clasificacion, plusvaliaAplicada: zona.factorPlusvalia, coeficientesAplicados: { ...coef, factorGlobal }, rangoMercado: range(valorFinal), nivelConfianza: confidence(Object.keys(coef).length), valorFinalEstimado: valorFinal };
};
