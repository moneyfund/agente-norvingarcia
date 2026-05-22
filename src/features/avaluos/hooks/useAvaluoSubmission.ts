import { useState } from 'react';
import { calcularAvaluo } from '../engine/avaluo.engine';
import { ZONAS_POR_CIUDAD } from '../constants/locations';
import { createAvaluo } from '../../../services/avaluos.service';

export const useAvaluoSubmission = (usuarioId?: string) => {
  const [loading, setLoading] = useState(false); const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [snapshot, setSnapshot] = useState<any>(null);
  const submit = async (data: any, tipoPropiedad: any) => {
    setLoading(true);
    setError('');
    try {
      const zonasCiudad = ZONAS_POR_CIUDAD[data.ciudad || 'Matagalpa'] || [];
      const zona = data.zonaData || zonasCiudad.find((z) => z.zona === data.zona);
      if (!zona) throw new Error('Selecciona una zona válida.');
      const calc = calcularAvaluo(tipoPropiedad, data, zona);
      setResult(calc);
      setSnapshot({ data, tipoPropiedad, zona });
      return calc;
    } catch (err: any) {
      setResult(null);
      setSnapshot(null);
      setError(err?.message || 'No se pudo calcular el avalúo.');
      return null;
    } finally { setLoading(false); }
  };
  const save = async () => {
    if (!usuarioId || !result || !snapshot) return null;
    setError('');
    try {
      return await createAvaluo({ titulo: snapshot.data.titulo, tipoPropiedad: snapshot.tipoPropiedad, ciudad: snapshot.data.ciudad || 'Matagalpa', zona: snapshot.data.zona, createdAt: new Date().toISOString(), usuarioId, caracteristicas: snapshot.data, coeficientesAplicados: result.coeficientesAplicados, valorTerreno: result.valorTerreno, valorConstruccion: result.valorConstruccion, valorFinal: result.valorFinalEstimado, rangoMercado: result.rangoMercado, nivelConfianza: result.nivelConfianza, zonaSnapshot: snapshot.zona });
    } catch (err: any) {
      setError(err?.message || 'No se pudo guardar el avalúo.');
      return null;
    }
  };
  return { loading, result, error, submit, save };
};
