import { Link } from 'react-router-dom';

export function Monogram() {
  return <img className="ng-monogram" src="/brand/ng-chrome.svg" alt="" width="92" height="54" aria-hidden="true" />;
}

export default function BrandMark() {
  return (
    <Link to="/" className="ng-brand" aria-label="Norvin García, inicio">
      <Monogram />
      <span className="ng-wordmark">Norvin García<small>Real Estate</small></span>
    </Link>
  );
}
