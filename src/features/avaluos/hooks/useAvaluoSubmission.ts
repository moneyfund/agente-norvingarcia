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
      let payload: Record<string, unknown> = data;
      let resultCalc: ResultadoAvaluo | null = null;
      if (tipoPropiedad === 'terreno') {
        const foundErrors = validateTerreno(data as Partial<TerrenoInput>);
        if (Object.keys(foundErrors).length > 0) return setErrors(foundErrors as Record<string, string>);
        const safeData = data as TerrenoInput;
        const zona = ZONAS_POR_CIUDAD[safeData.ciudad].find((z) => z.zona === safeData.zona) as ZonaData | undefined;
        if (!zona) return setErrors({ zona: 'Zona no disponible para la ciudad seleccionada.' });
        resultCalc = calcularAvaluo(tipoPropiedad, safeData, zona); setResult(resultCalc); payload = safeData;
      } else {
        setResult(null);
      }
      if (usuarioId) {
        await createAvaluo({ tipoPropiedad, ciudad: String(payload.ciudad ?? ''), zona: String(payload.zona ?? payload.zonaComunidad ?? ''), createdAt: new Date().toISOString(), usuarioId, caracteristicas: payload, coeficientesAplicados: resultCalc?.coeficientesAplicados ?? null, valorTerreno: resultCalc?.valorTerreno ?? null, valorFinal: resultCalc?.valorFinalEstimado ?? null, rangoMercado: resultCalc?.rangoMercado ?? null, nivelConfianza: resultCalc?.nivelConfianza ?? 'Base', zonaSnapshot: null });
      }
    } finally { setLoading(false); }
  };
  return { loading, result, errors, submit };
};
