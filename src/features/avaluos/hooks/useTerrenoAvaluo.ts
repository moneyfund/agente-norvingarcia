import { useState } from 'react';
import { createAvaluo } from '../../../services/avaluos.service';
import { calcularAvaluo } from '../engine/avaluo.engine';
import { ZONAS_POR_CIUDAD } from '../constants/locations';
import { validateTerreno } from '../validators/terreno.validator';
import type { PropertyType, ResultadoAvaluo, TerrenoInput, ZonaData } from '../types/avaluo.types';

export const useTerrenoAvaluo = (usuarioId?: string) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultadoAvaluo | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submitTerreno = async (data: Partial<TerrenoInput>, tipoPropiedad: PropertyType) => {
    const foundErrors = validateTerreno(data);
    if (Object.keys(foundErrors).length > 0) return setErrors(foundErrors as Record<string, string>);
    const zona = ZONAS_POR_CIUDAD[data.ciudad!].find((z) => z.zona === data.zona) as ZonaData | undefined;
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
          caracteristicas: safeData,
          coeficientesAplicados: resultCalc.coeficientesAplicados,
          valorTerreno: resultCalc.valorTerreno,
          valorFinal: resultCalc.valorFinalEstimado,
          rangoMercado: resultCalc.rangoMercado,
          nivelConfianza: resultCalc.nivelConfianza,
          zonaSnapshot: { clasificacion: zona.clasificacion, valorTerrenoM2: zona.valorTerrenoM2, factorPlusvalia: zona.factorPlusvalia },
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return { loading, result, errors, submitTerreno };
};
