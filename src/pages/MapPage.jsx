import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query } from 'firebase/firestore';
import L from 'leaflet';
import Seo from '../components/Seo';
import { db } from '../firebase/config';

const DEFAULT_CENTER_NICARAGUA = [12.8654, -85.2072];
const FALLBACK_IMAGE = '/img/placeholder-property.svg';

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

const getPropertyImageUrl = (property) => property.image || property.imagenes?.[0] || FALLBACK_IMAGE;

const isPotentiallyFragileExternalImage = (url = '') => /(fbcdn|facebook|fbsbx|akamaihd)/i.test(url);

const preloadImage = (url) => new Promise((resolve) => {
  if (!url) {
    resolve(FALLBACK_IMAGE);
    return;
  }

  const img = new Image();
  img.loading = 'eager';
  img.referrerPolicy = 'no-referrer';

  img.onload = () => resolve(url);
  img.onerror = () => resolve(FALLBACK_IMAGE);
  img.src = url;
});

function MapPage() {
  const mapNodeRef = useRef(null);
  const mapRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersLayerRef = useRef(null);
  const markerClusterLayerRef = useRef(null);

  const [propiedades, setPropiedades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const propertiesWithCoordinates = useMemo(
    () => propiedades.filter(hasValidCoordinates),
    [propiedades],
  );

  useEffect(() => {
    if (mapRef.current || !mapNodeRef.current) return;

    const map = L.map(mapNodeRef.current, {
      center: DEFAULT_CENTER_NICARAGUA,
      zoom: 7,
      zoomControl: true,
      preferCanvas: true,
    });

    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    });

    tileLayer.addTo(map);
    mapRef.current = map;
    tileLayerRef.current = tileLayer;
    markersLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
      tileLayerRef.current = null;
      markersLayerRef.current = null;
      markerClusterLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const collectionRef = query(collection(db, 'propiedades'));
    const unsubscribe = onSnapshot(collectionRef, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPropiedades(docs);
      setLoading(false);
      setError('');
    }, (err) => {
      setError(err.message || 'No se pudo cargar el mapa interactivo.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const markerLayer = markersLayerRef.current;
    if (!map || !markerLayer) return;

    markerLayer.clearLayers();

    if (markerClusterLayerRef.current) {
      markerClusterLayerRef.current.clearLayers();
      map.removeLayer(markerClusterLayerRef.current);
      markerClusterLayerRef.current = null;
    }

    const bounds = L.latLngBounds([]);
    const markerInstances = [];

    const renderMarkers = async () => {
      for (const property of propertiesWithCoordinates) {
        const lat = Number(property.lat);
        const lng = Number(property.lng);
        const rawImage = getPropertyImageUrl(property);
        const imageUrl = isPotentiallyFragileExternalImage(rawImage)
          ? await preloadImage(rawImage)
          : rawImage;

        const markerHtml = `<button type="button" class="property-map-marker">${formatPrice(property.price ?? property.precio)}</button>`;
        const markerIcon = L.divIcon({
          html: markerHtml,
          className: 'property-map-marker-wrapper',
          iconSize: [100, 34],
          iconAnchor: [50, 34],
        });

        const marker = L.marker([lat, lng], { icon: markerIcon, keyboard: true });

        const popupHtml = `
          <article class="property-map-preview-card" data-property-id="${property.id}">
            <img src="${imageUrl}" alt="${property.title || property.titulo || 'Propiedad'}" class="property-map-preview__image" />
            <div class="property-map-preview__body">
              <h4 class="property-map-preview__title">${property.title || property.titulo || 'Propiedad disponible'}</h4>
              <p class="property-map-preview__price">${formatPrice(property.price ?? property.precio)}</p>
              <p class="property-map-preview__area">Área: ${property.area || 'N/D'}</p>
            </div>
          </article>
        `;

        marker.bindPopup(popupHtml, {
          closeButton: false,
          autoClose: true,
          className: 'property-map-preview-popup',
          offset: [0, -30],
        });

        marker.on('mouseover', () => {
          if (!window.matchMedia('(hover: hover)').matches) return;
          marker.openPopup();
        });

        marker.on('mouseout', () => {
          if (!window.matchMedia('(hover: hover)').matches) return;
          marker.closePopup();
        });

        marker.on('click', () => {
          if (window.matchMedia('(hover: hover)').matches) {
            navigate(`/propiedad/${property.id}`);
            return;
          }

          if (marker.isPopupOpen()) {
            navigate(`/propiedad/${property.id}`);
          } else {
            marker.openPopup();
          }
        });

        marker.on('popupopen', (event) => {
          const imageElement = event.popup.getElement()?.querySelector('.property-map-preview__image');
          if (!imageElement) return;
          imageElement.onerror = () => {
            imageElement.src = FALLBACK_IMAGE;
          };
        });

        markerLayer.addLayer(marker);
        markerInstances.push(marker);
        bounds.extend([lat, lng]);
      }

      if (markerInstances.length > 1) {
        map.fitBounds(bounds, { padding: [80, 80] });
      } else if (markerInstances.length === 1) {
        map.setView(markerInstances[0].getLatLng(), 13);
      } else {
        map.setView(DEFAULT_CENTER_NICARAGUA, 7);
      }
    };

    renderMarkers();
  }, [navigate, propertiesWithCoordinates]);

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
