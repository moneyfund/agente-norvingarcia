import { useState } from 'react';
import { calcularAvaluo } from '../engine/avaluo.engine';
import { ZONAS_MATAGALPA } from '../constants/locations';
import { createAvaluo } from '../../../services/avaluos.service';

export const useAvaluoSubmission = (usuarioId?: string) => {
  const [loading, setLoading] = useState(false); const [result, setResult] = useState<any>(null);
  const [snapshot, setSnapshot] = useState<any>(null);
  const submit = async (data: any, tipoPropiedad: any) => { setLoading(true); try { const zona = ZONAS_MATAGALPA.find((z)=>z.zona===data.zona); if(!zona) throw new Error('Zona inválida.'); const calc=calcularAvaluo(tipoPropiedad,data,zona); setResult(calc); setSnapshot({data,tipoPropiedad,zona}); return calc; } finally { setLoading(false);} };
  const save = async () => { if(!usuarioId || !result || !snapshot) return null; return createAvaluo({ titulo: snapshot.data.titulo, tipoPropiedad: snapshot.tipoPropiedad, ciudad: 'Matagalpa', zona: snapshot.data.zona, createdAt: new Date().toISOString(), usuarioId, caracteristicas: snapshot.data, coeficientesAplicados: result.coeficientesAplicados, valorTerreno: result.valorTerreno, valorConstruccion: result.valorConstruccion, valorFinal: result.valorFinalEstimado, rangoMercado: result.rangoMercado, nivelConfianza: result.nivelConfianza, zonaSnapshot: snapshot.zona }); };
  return { loading, result, submit, save };
};
