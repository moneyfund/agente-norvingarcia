import { useState } from 'react';
import { getZonaReferencia } from '../../../services/zonas.service';
import { calcularAvaluo } from '../engine/avaluo.engine';
import { createAvaluo } from '../../../services/avaluos.service';
import { validateTerreno } from '../validators/terreno.validator';
import type { CaracteristicasTerreno, ResultadoAvaluo, ZonaData } from '../types/avaluo.types';

export const useTerrenoAvaluo = (usuarioId?: string) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultadoAvaluo | null>(null);
  const [errors, setErrors] = useState({});

  const submitTerreno = async (data: Partial<CaracteristicasTerreno>) => {
    const foundErrors = validateTerreno(data);
    if (Object.keys(foundErrors).length > 0) {
      setErrors(foundErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      const zonaData = (await getZonaReferencia({ ciudad: data.ciudad, zona: data.zona })) as ZonaData | null;
      const resultCalc = calcularAvaluo({
        tipoPropiedad: 'terreno',
        usuarioId: usuarioId || '',
        zonaData: zonaData as ZonaData,
        caracteristicas: data as CaracteristicasTerreno,
      });
      setResult(resultCalc);

      await createAvaluo({
        tipoPropiedad: 'terreno', usuarioId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), versionMotor: 'terreno-v1',
        ciudad: data.ciudad, municipio: data.municipio, zona: data.zona,
        zonaSnapshot: zonaData ? { clasificacion: zonaData.clasificacion, valorTerrenoM2: zonaData.valorTerrenoM2, valorConstruccionM2: zonaData.valorConstruccionM2, factorPlusvalia: zonaData.factorPlusvalia } : null,
        caracteristicas: data, coeficientesAplicados: resultCalc.coeficientesAplicados, valorTerreno: resultCalc.valorTerreno, valorConstruccion: resultCalc.valorConstruccion, valorFinal: resultCalc.valorFinal,
        observaciones: data.observaciones || '',
      });
    } finally { setLoading(false); }
  };

  return { loading, result, errors, submitTerreno };
};
