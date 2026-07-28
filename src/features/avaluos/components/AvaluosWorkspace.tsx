import { useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import TerrenoForm from '../forms/TerrenoForm';
import CasaForm from '../forms/CasaForm';
import AvaluoTerrenoResultCard from './AvaluoTerreoResultCard';
import { useAvaluoSubmission } from '../hooks/useAvaluoSubmission';
import { PropertyTypeCards } from './PropertyTypeCards';
import { AvaluoHistoryPanel } from './AvaluoHistoryPanel';
import { useAvaluosHistory } from '../hooks/useAvaluosHistory';
import { AvaluoHeader, AvaluoSidebar, casaSteps, TechnicalSummary, terrenoSteps } from './AvaluoShell';

const createInitialForm = () => ({ ciudad: 'Matagalpa', zona: '', zonaData: null, unidadArea: 'm2', areaOriginal: 0, areaM2Convertida: 0, areaTerreno: 0, serviciosBasicos: { agua: false, energia: false, drenaje: false, senalTelefonica: false, internet: false }, recursosNaturales: [], riesgos: [] });

export default function AvaluosWorkspace() {
  const { user } = useAuth();
  const [propertyType, setPropertyType] = useState<any>(null);
  const [form, setForm] = useState<any>(createInitialForm);
  const [activeStep, setActiveStep] = useState(0);
  const formRef = useRef<HTMLDivElement>(null);
  const { loading, result, error, submit, save } = useAvaluoSubmission(user?.uid);
  const { items, refresh, removeLocal } = useAvaluosHistory(user?.uid);
  const steps = propertyType === 'casa' ? casaSteps : terrenoSteps;
  const completed = useMemo(() => Object.entries(form).filter(([, value]) => value !== '' && value !== null && value !== false && value !== 0 && (!Array.isArray(value) || value.length)).length, [form]);
  const progress = propertyType ? Math.min(result ? 100 : 94, Math.round((completed / (propertyType === 'casa' ? 42 : 31)) * 100)) : 0;

  const handleCalculate = async () => { if (propertyType) await submit(form, propertyType); };
  const handleSave = async () => { const saved = await save(); if (saved) await refresh(); };
  const clear = () => { if (!window.confirm('¿Deseas limpiar los datos del avalúo actual?')) return; setForm(createInitialForm()); setActiveStep(0); };
  const goToStep = (index: number) => {
    const next = Math.max(0, Math.min(index, steps.length - 1)); setActiveStep(next);
    const sections = formRef.current?.querySelectorAll('section');
    const target = sections?.[Math.min(next, Math.max(0, sections.length - 1))] || formRef.current;
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return <main className="avaluo-workspace">
    <div className="avaluo-container">
      <AvaluoHeader type={propertyType} city={form.ciudad} onClear={clear} />
      <PropertyTypeCards value={propertyType} onChange={(type) => { setPropertyType(type); setForm(createInitialForm()); setActiveStep(0); }} />
      {propertyType ? <div className="avaluo-layout">
        <AvaluoSidebar steps={steps} active={activeStep} onStep={goToStep} progress={progress} completed={completed} />
        <div className="avaluo-main-column">
          <div ref={formRef} className="avaluo-form-surface">{propertyType === 'terreno' && <TerrenoForm value={form} onChange={(key, value) => setForm((previous) => ({ ...previous, [key]: value }))} onSubmit={handleCalculate} loading={loading} />}{propertyType === 'casa' && <CasaForm value={form} onChange={(key, value) => setForm((previous) => ({ ...previous, [key]: value }))} onSubmit={handleCalculate} loading={loading} />}</div>
          <div className="avaluo-action-bar"><button type="button" disabled={activeStep === 0} onClick={() => goToStep(activeStep - 1)} className="avaluo-btn avaluo-btn--secondary"><ChevronLeft /> Anterior</button><span>Etapa {activeStep + 1} de {steps.length}</span><button type="button" onClick={() => activeStep === steps.length - 1 ? handleCalculate() : goToStep(activeStep + 1)} className="avaluo-btn avaluo-btn--primary">{activeStep === steps.length - 1 ? (loading ? 'Calculando…' : 'Calcular avalúo') : 'Siguiente'} <ChevronRight /></button></div>
        </div>
        <TechnicalSummary type={propertyType} form={form} result={result} progress={progress} />
      </div> : <div className="avaluo-welcome"><strong>Comienza seleccionando un tipo de propiedad</strong><p>La ficha técnica se organizará según la matriz de terreno o casa.</p></div>}
      {!!error && <p role="alert" className="avaluo-error">{error}</p>}
      <AvaluoTerrenoResultCard result={result} canSave={!!user} onSave={handleSave} />
      <AvaluoHistoryPanel items={items} onDeleted={removeLocal} />
    </div>
  </main>;
}
