import { Monogram } from './BrandMark';

function Preloader({ signature = false }) {
  if (!signature) {
    return <div className="ng-route-loading" role="status"><Monogram /><span className="sr-only">Cargando página</span></div>;
  }
  return (
    <div className={`ng-route-loading ng-signature-loading ng-brand-intro${signature === 'revealing' ? ' ng-signature-exit' : ''}`} role="status" aria-label="Cargando sitio de Agente Norvin García">
      <div className="ng-intro-content" aria-hidden="true">
        <div className="ng-intro-role"><span>AGENTE</span></div>
        <div className="ng-intro-name"><span>NORVIN GARCÍA</span></div>
        <div className="ng-intro-rule" />
        <div className="ng-intro-subtitle">REAL ESTATE</div>
      </div>
    </div>
  );
}
export default Preloader;
