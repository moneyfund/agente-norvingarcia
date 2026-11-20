import { Monogram } from './BrandMark';

function Preloader({ signature = false }) {
  return (
    <div className={`ng-route-loading${signature ? ' ng-signature-loading' : ''}${signature === 'revealing' ? ' ng-signature-exit' : ''}`} role="status">
      <Monogram />
      <span className="sr-only">Cargando página</span>
    </div>
  );
}

export default Preloader;
