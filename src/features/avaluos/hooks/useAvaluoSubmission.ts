import { useState } from 'react';
import { calcularAvaluo } from '../engine/avaluo.engine';
import { getZonaByCiudadAndNombre } from '../constants/locations';
import { createAvaluo, updateAvaluo } from '../../../services/avaluos.service';
import { uploadAvaluoGalleryImages, uploadAvaluoMainImage, validateAvaluoGallery } from '../../../services/avaluosStorage.service';
import { generateAvaluoAnalysis } from '../../../utils/generateAvaluoAnalysis';
import { buildReferenciaBase, buildSuggestedBaseReference, isOutOfRecommendedRange, toFinitePositive } from '../basePrice/basePriceReference';

export const useAvaluoSubmission = (usuarioId?: string) => {
  const [loading, setLoading] = useState(false); const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [snapshot, setSnapshot] = useState<any>(null);
  const submit = async (data: any, tipoPropiedad: any) => {
    setLoading(true);
    setError('');
    try {
      if (!String(data.agenteEvaluador || '').trim()) throw new Error('Ingresa el nombre del agente evaluador.');
      console.log('FILE SELECCIONADO', data.imagenPrincipalFile || null);
      if (data.imagenPrincipalFile) validateAvaluoGallery([data.imagenPrincipalFile]);
      validateAvaluoGallery(data.imagenesAdicionalesFiles || []);
      const zona = data.zonaData || getZonaByCiudadAndNombre(data.ciudad || 'Matagalpa', data.zona);
      if (!zona) throw new Error('Selecciona una zona válida.');
      if (tipoPropiedad === 'terreno') {
        const referencia = buildReferenciaBase(data, zona);
        if (!toFinitePositive(referencia.precioBaseAplicado)) throw new Error('Ingresa un precio base aplicado válido mayor que cero.');
        if (referencia.precioBaseFueEditado && !referencia.motivoAjuste) throw new Error('Selecciona el motivo del ajuste manual del precio base.');
        if (referencia.precioBaseFueEditado && (data.motivoAjustePrecioBase === 'otro_ajuste_tecnico') && !String(data.detalleAjustePrecioBase || '').trim()) throw new Error('Describe brevemente el ajuste técnico aplicado.');
        if (isOutOfRecommendedRange(referencia.precioBaseSugerido, referencia.precioBaseAplicado) && (!String(data.detalleAjustePrecioBase || '').trim() || !data.confirmacionValorExtraordinario)) throw new Error('Confirma y detalla la condición extraordinaria para usar un precio fuera del rango recomendado.');
      }
      const calc = calcularAvaluo(tipoPropiedad, data, zona);
      const resultWithReference = tipoPropiedad === 'terreno' ? { ...calc, referenciaBase: buildReferenciaBase(data, zona) } : calc;
      setResult(resultWithReference);
      setSnapshot({ data, tipoPropiedad, zona });
      return resultWithReference;
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
      const referenciaBase = snapshot.tipoPropiedad === 'terreno' ? buildReferenciaBase(snapshot.data, snapshot.zona) : undefined;
      const suggested = snapshot.tipoPropiedad === 'terreno' ? buildSuggestedBaseReference(snapshot.data, snapshot.zona) : null;
      const zonaSnapshot = snapshot.tipoPropiedad === 'terreno' ? { ...snapshot.zona, valorTerrenoM2Original: snapshot.zona?.valorTerrenoM2 ?? null, curvaAplicada: suggested?.curvaAplicada ?? null, precioSugeridoCalculado: referenciaBase?.precioBaseSugerido ?? null } : snapshot.zona;
      const datosGuardar = { titulo: snapshot.data.titulo || `Avalúo de ${snapshot.tipoPropiedad}`, tipoPropiedad: snapshot.tipoPropiedad, agenteEvaluador: snapshot.data.agenteEvaluador, telefonoAgente: snapshot.data.telefonoAgente || '', ciudad: snapshot.data.ciudad || 'Matagalpa', zona: snapshot.data.zona, unidadArea: result.unidadArea ?? snapshot.data.unidadArea, areaOriginal: result.areaOriginal ?? snapshot.data.areaOriginal, areaM2Convertida: result.areaM2Convertida ?? snapshot.data.areaM2Convertida, createdAt: new Date().toISOString(), usuarioId, imagenPrincipalUrl: '', imagenPrincipal: '', imagenesAdicionales: [], imagenes: [], caracteristicas, zonaSnapshot, coeficientesAplicados: result.coeficientesAplicados, valorBase: result.valorBase, valorTerreno: result.valorTerreno, ...(snapshot.tipoPropiedad === 'terreno' ? {} : { valorConstruccion: result.valorConstruccion }), valorFinal: result.valorFinalEstimado, valorM2: result.valorM2, rangoMercado: result.rangoMercado, nivelConfianza: result.nivelConfianza, pricePerManzana: result.pricePerManzana, basePricePerManzana: result.basePricePerManzana, baseValueTotal: result.baseValueTotal, technicalAdjustmentFactor: result.technicalAdjustmentFactor, ruralSurScaleApplied: result.ruralSurScaleApplied, adjustedPriceM2: result.adjustedPriceM2, indiceLiquidez: result.indiceLiquidez, tiempoEstimadoVenta: result.tiempoEstimadoVenta, precioRecomendadoPublicacion: result.precioRecomendadoPublicacion, precioMinimoNegociacion: result.precioMinimoNegociacion, precioObjetivoCierre: result.precioObjetivoCierre, factorGlobal: result.factorGlobal, ...(referenciaBase ? { referenciaBase } : {}) };
      console.log(datosGuardar);
      const analisisProfesional = generateAvaluoAnalysis(datosGuardar);
      const id = await createAvaluo({ ...datosGuardar, analisisProfesional });
      console.log('docRef.id', id);
      console.log('mainImageFile', imagenPrincipalFile || null);

      let imagenPrincipalUrl = '';
      let imagenesAdicionales: string[] = [];

      if (imagenPrincipalFile) {
        imagenPrincipalUrl = await uploadAvaluoMainImage(imagenPrincipalFile, id);
      }

      if (imagenesAdicionalesFiles?.length) {
        imagenesAdicionales = await uploadAvaluoGalleryImages(imagenesAdicionalesFiles, id);
      }

      console.log('imagenPrincipalUrl', imagenPrincipalUrl);
      console.log('imagenesAdicionales', imagenesAdicionales);

      await updateAvaluo(id, { imagenPrincipalUrl, imagenPrincipal: imagenPrincipalUrl, imagenesAdicionales, imagenes: imagenesAdicionales });
      console.log('AVALUO ACTUALIZADO CON URLS DE IMAGENES');
      return id;
    } catch (err: any) {
      setError(err?.message || 'No se pudo guardar el avalúo.');
      return null;
    }
  };
  return { loading, result, error, submit, save };
};
