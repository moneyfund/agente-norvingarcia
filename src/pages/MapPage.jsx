import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query } from 'firebase/firestore';
import Seo from '../components/Seo';
import { db } from '../firebase/config';

const DEFAULT_CENTER_NICARAGUA = { lat: 12.8654, lng: -85.2072 };
const MAP_ID = 'norvin-map-style';

const hasValidCoordinates = (property) => {
  const lat = Number(property?.lat);
  const lng = Number(property?.lng);

  return Number.isFinite(lat)
    && Number.isFinite(lng)
    && lat >= -90
    && lat <= 90
    && lng >= -180
    && lng <= 180;
};

const formatPrice = (price) => {
  if (!Number.isFinite(Number(price))) return 'Consultar';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
    .format(Number(price));
};

const loadGoogleMapsApi = async () => {
  if (window.google?.maps) return;

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error('Falta VITE_GOOGLE_MAPS_API_KEY para cargar Google Maps.');
  }

  await new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[data-google-maps="true"]');

    if (existingScript) {
      existingScript.addEventListener('load', resolve, { once: true });
      existingScript.addEventListener('error', reject, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly`;
    script.async = true;
    script.defer = true;
    script.dataset.googleMaps = 'true';
    script.onload = resolve;
    script.onerror = () => reject(new Error('No fue posible cargar Google Maps API.'));
    document.head.appendChild(script);
  });
};

function MapPage() {
  const mapNodeRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef(new Map());
  const clusterRef = useRef(null);
  const activePreviewRef = useRef(null);
  const clusterCtorRef = useRef(null);

  const [propiedades, setPropiedades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const propertiesWithCoordinates = useMemo(
    () => propiedades.filter(hasValidCoordinates),
    [propiedades],
  );

  useEffect(() => {
    let unsubscribe = () => {};

    const startRealtimeSync = async () => {
      try {
        setLoading(true);
        await loadGoogleMapsApi();

        if (!mapRef.current && mapNodeRef.current) {
          mapRef.current = new window.google.maps.Map(mapNodeRef.current, {
            center: DEFAULT_CENTER_NICARAGUA,
            zoom: 7,
            mapId: MAP_ID,
            gestureHandling: 'greedy',
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
          });
        }

        const { AdvancedMarkerElement } = await window.google.maps.importLibrary('marker');
        if (!window.markerClusterer) {
          await new Promise((resolve, reject) => {
            const existingScript = document.querySelector('script[data-marker-clusterer="true"]');
            if (existingScript) {
              existingScript.addEventListener('load', resolve, { once: true });
              existingScript.addEventListener('error', reject, { once: true });
              return;
            }

            const script = document.createElement('script');
            script.src = 'https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js';
            script.async = true;
            script.defer = true;
            script.dataset.markerClusterer = 'true';
            script.onload = resolve;
            script.onerror = () => reject(new Error('No se pudo cargar MarkerClusterer.'));
            document.head.appendChild(script);
          });
        }

        clusterCtorRef.current = window.markerClusterer?.MarkerClusterer || null;

        const collectionRef = query(collection(db, 'propiedades'));
        unsubscribe = onSnapshot(collectionRef, (snapshot) => {
          const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setPropiedades(docs);

          const map = mapRef.current;
          if (!map) return;

          markersRef.current.forEach((marker) => {
            marker.map = null;
          });
          markersRef.current.clear();

          if (clusterRef.current) {
            clusterRef.current.clearMarkers();
            clusterRef.current = null;
          }

          if (activePreviewRef.current) {
            activePreviewRef.current.classList.remove('is-visible');
            activePreviewRef.current = null;
          }

          const nextMarkers = [];
          const bounds = new window.google.maps.LatLngBounds();

          docs.filter(hasValidCoordinates).forEach((property) => {
            const position = { lat: Number(property.lat), lng: Number(property.lng) };
            bounds.extend(position);

            const markerElement = document.createElement('button');
            markerElement.type = 'button';
            markerElement.className = 'property-map-marker';
            markerElement.textContent = formatPrice(property.price ?? property.precio);

            const previewElement = document.createElement('article');
            previewElement.className = 'property-map-preview';
            previewElement.innerHTML = `
              <img src="${property.image || property.imagenes?.[0] || '/logo.png'}" alt="${property.title || property.titulo || 'Propiedad'}" class="property-map-preview__image" />
              <div class="property-map-preview__body">
                <h4 class="property-map-preview__title">${property.title || property.titulo || 'Propiedad disponible'}</h4>
                <p class="property-map-preview__price">${formatPrice(property.price ?? property.precio)}</p>
                <p class="property-map-preview__area">Área: ${property.area || 'N/D'}</p>
              </div>
            `;

            markerElement.appendChild(previewElement);

            const marker = new AdvancedMarkerElement({
              map,
              position,
              content: markerElement,
              title: property.title || property.titulo || 'Propiedad',
            });

            let mobileTapCount = 0;

            const openPreview = () => {
              if (activePreviewRef.current && activePreviewRef.current !== previewElement) {
                activePreviewRef.current.classList.remove('is-visible');
              }
              previewElement.classList.add('is-visible');
              activePreviewRef.current = previewElement;
            };

            const closePreview = () => {
              previewElement.classList.remove('is-visible');
              if (activePreviewRef.current === previewElement) activePreviewRef.current = null;
            };

            markerElement.addEventListener('mouseenter', openPreview);
            markerElement.addEventListener('mouseleave', closePreview);
            markerElement.addEventListener('click', () => {
              const isMobile = window.matchMedia('(hover: none)').matches;
              if (!isMobile) {
                navigate(`/propiedad/${property.id}`);
                return;
              }

              mobileTapCount += 1;
              if (mobileTapCount === 1) {
                openPreview();
                setTimeout(() => {
                  mobileTapCount = 0;
                }, 1400);
              } else {
                navigate(`/propiedad/${property.id}`);
              }
            });

            markersRef.current.set(property.id, marker);
            nextMarkers.push(marker);
          });

          if (nextMarkers.length > 100 && clusterCtorRef.current) {
            clusterRef.current = new clusterCtorRef.current({ map, markers: nextMarkers });
          }

          if (nextMarkers.length === 1) {
            map.setCenter(nextMarkers[0].position);
            map.setZoom(13);
          } else if (nextMarkers.length > 1) {
            map.fitBounds(bounds, 80);
          } else {
            map.setCenter(DEFAULT_CENTER_NICARAGUA);
            map.setZoom(7);
          }

          setLoading(false);
          setError('');
        });
      } catch (err) {
        setError(err.message || 'No se pudo inicializar el mapa interactivo.');
        setLoading(false);
      }
    };

    startRealtimeSync();

    return () => {
      unsubscribe();
      markersRef.current.forEach((marker) => {
        marker.map = null;
      });
      markersRef.current.clear();
      if (clusterRef.current) clusterRef.current.clearMarkers();
    };
  }, [navigate]);

  return (
    <section className="section-container">
      <Seo title="Mapa de propiedades | Norvin García" description="Explora en un mapa interactivo las propiedades disponibles con Norvin García." />
      <h1 className="font-display text-4xl font-semibold">Mapa de propiedades</h1>
      {loading && <p className="mt-4 text-slate-500">Cargando mapa...</p>}
      {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-red-600">{error}</p>}
      {!loading && !error && !propertiesWithCoordinates.length && (
        <p className="mt-4 rounded-xl bg-amber-50 p-3 text-amber-700">No hay propiedades con coordenadas válidas para mostrar en el mapa.</p>
      )}
      <div className="mt-6 overflow-hidden rounded-2xl shadow-premium">
        <div ref={mapNodeRef} style={{ height: '600px', width: '100%' }} />
      </div>
    </section>
  );
}

export default MapPage;
