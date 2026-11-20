import { Link } from 'react-router-dom';

export function Monogram() {
  return <span className="ng-monogram" aria-hidden="true"><i>N</i><i>G</i></span>;
}

export default function BrandMark() {
  return (
    <Link to="/" className="ng-brand" aria-label="Norvin García, inicio">
      <Monogram />
      <span className="ng-wordmark">Norvin García<small>Bienes raíces</small></span>
    </Link>
  );
}
