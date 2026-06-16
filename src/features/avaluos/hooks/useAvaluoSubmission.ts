import { useState } from 'react';
import { calcularAvaluo } from '../engine/avaluo.engine';
import { ZONAS_POR_CIUDAD } from '../constants/locations';
import { createAvaluo, updateAvaluo } from '../../../services/avaluos.service';
import { uploadAvaluoGallery, uploadAvaluoImage, validateAvaluoGallery } from '../../../services/avaluosStorage.service';
import { generateAvaluoAnalysis } from '../../../utils/generateAvaluoAnalysis';

export const useAvaluoSubmission = (usuarioId?: string) => {
  const [loading, setLoading] = useState(false); const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [snapshot, setSnapshot] = useState<any>(null);
  const submit = async (data: any, tipoPropiedad: any) => {
    setLoading(true);
    setError('');
    try {
      if (!String(data.agenteEvaluador || '').trim()) throw new Error('Ingresa el nombre del agente evaluador.');
      if (data.imagenPrincipalFile) validateAvaluoGallery([data.imagenPrincipalFile]);
      validateAvaluoGallery(data.imagenesAdicionalesFiles || []);
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
      const { imagenPrincipalFile, imagenesAdicionalesFiles, ...caracteristicas } = snapshot.data;
      const basePayload = { titulo: snapshot.data.titulo || `Avalúo de ${snapshot.tipoPropiedad}`, tipoPropiedad: snapshot.tipoPropiedad, agenteEvaluador: snapshot.data.agenteEvaluador, telefonoAgente: snapshot.data.telefonoAgente || '', ciudad: snapshot.data.ciudad || 'Matagalpa', zona: snapshot.data.zona, unidadArea: result.unidadArea ?? snapshot.data.unidadArea, areaOriginal: result.areaOriginal ?? snapshot.data.areaOriginal, areaM2Convertida: result.areaM2Convertida ?? snapshot.data.areaM2Convertida, createdAt: new Date().toISOString(), usuarioId, imagenPrincipalUrl: '', imagenesAdicionales: [], caracteristicas, zonaSnapshot: snapshot.zona, coeficientesAplicados: result.coeficientesAplicados, valorBase: result.valorBase, valorTerreno: result.valorTerreno, valorConstruccion: result.valorConstruccion, valorFinal: result.valorFinalEstimado, valorM2: result.valorM2, rangoMercado: result.rangoMercado, nivelConfianza: result.nivelConfianza };
      const analisisProfesional = generateAvaluoAnalysis(basePayload);
      const id = await createAvaluo({ ...basePayload, analisisProfesional });
      try {
        const [imagenPrincipalUrl, imagenesAdicionales] = await Promise.all([
          imagenPrincipalFile ? uploadAvaluoImage(imagenPrincipalFile, id).catch(() => '') : Promise.resolve(''),
          imagenesAdicionalesFiles?.length ? uploadAvaluoGallery(imagenesAdicionalesFiles, id) : Promise.resolve([]),
        ]);
        await updateAvaluo(id, { imagenPrincipalUrl, imagenesAdicionales });
      } catch {
        setError('El avalúo fue guardado, pero una o más imágenes no pudieron subirse.');
      }
      return id;
    } catch (err: any) {
      setError(err?.message || 'No se pudo guardar el avalúo.');
      return null;
    }
  };
  return { loading, result, error, submit, save };
};
