import { useState } from 'react';
import { createAvaluo } from '../../../services/avaluos.service';
import { calcularAvaluo } from '../engine/avaluo.engine';
import { ZONAS_POR_CIUDAD } from '../constants/locations';
import { validateTerreno } from '../validators/terreno.validator';
import type { PropertyType, ResultadoAvaluo, TerrenoInput, ZonaData } from '../types/avaluo.types';

export const useAvaluoSubmission = (usuarioId?: string) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultadoAvaluo | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = async (data: Record<string, unknown>, tipoPropiedad: PropertyType) => {
    setLoading(true); setErrors({});
    try {
      const ciudad = data.ciudad as TerrenoInput['ciudad'];
      if (!ciudad || !ZONAS_POR_CIUDAD[ciudad]) return setErrors({ ciudad: 'Selecciona una ciudad válida.' });
      const zona = ZONAS_POR_CIUDAD[ciudad].find((z) => z.zona === String(data.zona ?? '')) as ZonaData | undefined;
      if (!zona) return setErrors({ zona: 'Zona no disponible para la ciudad seleccionada.' });

      if (tipoPropiedad === 'terreno') {
        const foundErrors = validateTerreno(data as Partial<TerrenoInput>);
        if (Object.keys(foundErrors).length > 0) return setErrors(foundErrors as Record<string, string>);
      }

      const resultCalc = calcularAvaluo(tipoPropiedad, data, zona);
      setResult(resultCalc);

      if (usuarioId) {
        await createAvaluo({ tipoPropiedad, ciudad: String(data.ciudad ?? ''), zona: String(data.zona ?? data.zonaComunidad ?? ''), createdAt: new Date().toISOString(), usuarioId, caracteristicas: data, coeficientesAplicados: resultCalc.coeficientesAplicados, valorTerreno: resultCalc.valorTerreno, valorFinal: resultCalc.valorFinalEstimado, rangoMercado: resultCalc.rangoMercado, nivelConfianza: resultCalc.nivelConfianza, zonaSnapshot: null });
      }
    } finally { setLoading(false); }
  };
  return { loading, result, errors, submit };
};
