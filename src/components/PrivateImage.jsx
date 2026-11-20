import { useEffect, useState } from 'react';
import { readPrivateImage } from '../services/privateMedia';

export default function PrivateImage({ src, alt, className }) {
  const [image, setImage] = useState(null);
  useEffect(() => {
    let current = true;
    if (src) {
      readPrivateImage(src)
        .then((data) => { if (current) setImage({ src, data }); })
        .catch(() => { if (current) setImage({ src, data: '' }); });
    }
    return () => { current = false; };
  }, [src]);

  if (image?.src === src && image?.data) return <img src={image.data} alt={alt} className={className} />;
  return <div className={`${className} grid place-items-center bg-slate-100 text-sm text-slate-600`}>{src && image?.src !== src ? 'Cargando imagen…' : 'Imagen no disponible'}</div>;
}
