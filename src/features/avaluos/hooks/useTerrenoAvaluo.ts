import { useState } from 'react';
import { createAvaluo } from '../../../services/avaluos.service';
import { calcularAvaluo } from '../engine/avaluo.engine';
import { getZonaByCiudadAndNombre } from '../constants/locations';
import { validateTerreno } from '../validators/terreno.validator';
import type { PropertyType, ResultadoAvaluo, TerrenoInput, ZonaData } from '../types/avaluo.types';

export const useTerrenoAvaluo = (usuarioId?: string) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultadoAvaluo | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submitTerreno = async (data: Partial<TerrenoInput>, tipoPropiedad: PropertyType) => {
    const foundErrors = validateTerreno(data);
    if (Object.keys(foundErrors).length > 0) return setErrors(foundErrors as Record<string, string>);
    const zona = getZonaByCiudadAndNombre(data.ciudad, data.zona) as ZonaData | undefined;
    if (!zona) return setErrors({ zona: 'Zona no disponible para la ciudad seleccionada.' });

    setLoading(true);
    setErrors({});
    try {
      const safeData = data as TerrenoInput;
      const resultCalc = calcularAvaluo(tipoPropiedad, safeData, zona);
      setResult(resultCalc);

      if (usuarioId) {
        await createAvaluo({
          tipoPropiedad,
          ciudad: safeData.ciudad,
          zona: safeData.zona,
          createdAt: new Date().toISOString(),
          usuarioId,
          titulo: safeData.titulo || `Avalúo de ${tipoPropiedad}`,
          unidadArea: resultCalc.unidadArea,
          areaOriginal: resultCalc.areaOriginal,
          areaM2Convertida: resultCalc.areaM2Convertida,
          caracteristicas: safeData,
          coeficientesAplicados: resultCalc.coeficientesAplicados,
          valorBase: resultCalc.valorBase,
          valorTerreno: resultCalc.valorTerreno,
          valorConstruccion: resultCalc.valorConstruccion,
          valorFinal: resultCalc.valorFinalEstimado,
          valorM2: resultCalc.valorM2,
          rangoMercado: resultCalc.rangoMercado,
          nivelConfianza: resultCalc.nivelConfianza,
          zonaSnapshot: zona,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return { loading, result, errors, submitTerreno };
};
