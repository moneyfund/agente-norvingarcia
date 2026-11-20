import { ChevronDown, MessageCircle } from 'lucide-react';
import PageMasthead from '../components/PageMasthead';
import Seo from '../components/Seo';
import { contact } from '../config/brand';

const buying = [
  ['Documentos esenciales', 'Solicita el título, las solvencias disponibles, el historial registral y la información catastral. Revisa que correspondan al inmueble de la oferta.'],
  ['Inspección técnica', 'Visita la propiedad y revisa su estructura, mantenimiento, accesos, servicios y entorno.'],
  ['Costos de la compra', 'Estima el costo total, incluidos los trámites, el mantenimiento previsto y las condiciones del financiamiento.'],
  ['Revisión legal', 'Consulta con un profesional sobre posibles gravámenes, litigios, servidumbres y el historial de titularidad.'],
];

const selling = [
  ['Preparar el inmueble', 'Prioriza mejoras que faciliten la visita y compara tu propiedad con otras alternativas en el mercado.'],
  ['Fotografía y video', 'Muestra la distribución, la luz y las características del inmueble con material actualizado.'],
  ['Definir el precio', 'Revisa propiedades comparables y acuerda de antemano tu margen de negociación.'],
  ['Difusión comercial', 'Elige los canales adecuados para llegar a compradores e incluye los datos necesarios para que puedan evaluar la oferta.'],
];

const advice = [
  ['Antes de dar un anticipo', 'Confirma el historial registral, los gravámenes y la identidad del propietario con asesoría profesional.'],
  ['Al evaluar un terreno', 'Verifica accesos, topografía, uso de suelo y situación municipal para anticipar costos de desarrollo.'],
  ['Al preparar una compraventa', 'Revisa condiciones, plazos de entrega y documentación antes de firmar.'],
  ['Acceso y servicios básicos', 'Comprueba agua, energía, drenaje, conectividad y vías de ingreso en la propia visita.'],
  ['Cómo distinguir posesión y titularidad', 'Consulta con un profesional qué documentos respaldan cada situación antes de tomar una decisión.'],
  ['Evaluar una zona en desarrollo', 'Compara infraestructura existente, proyectos anunciados y actividad económica local con tus objetivos.'],
];

function EducationPage() {
  return (
    <>
      <Seo title="Educación inmobiliaria | Norvin García" description="Guías para preparar la compra o venta de una propiedad en Nicaragua." />
      <PageMasthead label="Guías para compradores y propietarios" title="Educación inmobiliaria">
        Qué revisar al comprar, cómo preparar una venta y qué preguntas hacer antes de tomar una decisión.
      </PageMasthead>
      <nav className="ng-guide-nav" aria-label="Secciones de las guías">
        <div className="ng-wrap"><a href="#comprar">Antes de comprar</a><a href="#vender">Antes de vender</a><a href="#preguntas">Consultas frecuentes</a></div>
      </nav>
      <div className="ng-wrap ng-guides">
        {[{ id: 'comprar', title: 'Antes de comprar', topics: buying }, { id: 'vender', title: 'Antes de vender', topics: selling }].map(({ id, title, topics }) => (
          <section id={id} key={id} className="ng-guide-section">
            <h2 className="ng-display">{title}</h2>
            <div className="ng-guide-topics">
              {topics.map(([heading, description]) => <article key={heading}><h3>{heading}</h3><p>{description}</p></article>)}
            </div>
          </section>
        ))}
        <section id="preguntas" className="ng-guide-section">
          <h2 className="ng-display">Consultas frecuentes</h2>
          <div className="ng-guide-accordion">
            {advice.map(([heading, description]) => (
              <details key={heading}>
                <summary>{heading}<ChevronDown size={18} aria-hidden="true" /></summary>
                <p>{description}</p>
              </details>
            ))}
          </div>
        </section>
        <div className="ng-guide-cta">
          <h2 className="ng-display">¿Tienes una propiedad en mente?</h2>
          <a href={contact.whatsapp} target="_blank" rel="noreferrer" className="ng-button ng-button--wine"><MessageCircle size={18} aria-hidden="true" /> Consultar por WhatsApp</a>
        </div>
      </div>
    </>
  );
}

export default EducationPage;
