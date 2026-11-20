import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { collection, onSnapshot, query } from 'firebase/firestore';
import PageMasthead from '../components/PageMasthead';
import Seo from '../components/Seo';
import { db } from '../firebase/config';
import { contact, nicaraguaCenter } from '../config/brand';
import { applyImageFallback, formatUSD, propertyCover } from '../utils/propertyPresentation';

const hasCoordinates = ({ lat, lng }) => {
  const latitude = Number(lat);
  const longitude = Number(lng);
  return Number.isFinite(latitude) && Number.isFinite(longitude)
    && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180
    && (latitude !== 0 || longitude !== 0);
};

function createPopup(property, navigate) {
  const title = property.title || property.titulo || 'Propiedad disponible';
  const address = property.address || property.ubicacion || '';
  const path = `/propiedad/${encodeURIComponent(property.id)}`;
  const card = document.createElement('article');
  card.className = 'property-map-preview-card';

  const image = document.createElement('img');
  image.src = propertyCover(property);
  image.alt = '';
  image.loading = 'lazy';
  image.decoding = 'async';
  image.className = 'property-map-preview__image';
  image.addEventListener('error', applyImageFallback);

  const body = document.createElement('div');
  body.className = 'property-map-preview__body';
  const heading = document.createElement('h3');
  heading.className = 'property-map-preview__title';
  heading.textContent = title;
  const location = document.createElement('p');
  location.className = 'property-map-preview__address';
  location.textContent = address;
  const actions = document.createElement('div');
  actions.className = 'property-map-preview__actions';
  const details = document.createElement('a');
  details.href = path;
  details.textContent = 'Ver propiedad';
  details.onclick = (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    event.preventDefault();
    navigate(path, { state: { property } });
  };
  const whatsapp = document.createElement('a');
  whatsapp.href = `${contact.whatsapp}?text=${encodeURIComponent(`Hola Norvin, quiero información sobre ${title} (ID: ${property.id}).`)}`;
  whatsapp.target = '_blank';
  whatsapp.rel = 'noopener noreferrer';
  whatsapp.textContent = 'WhatsApp';
  actions.append(details, whatsapp);
  body.append(heading, location, actions);
  card.append(image, body);
  return card;
}

function MapPage() {
  const mapNode = useRef(null);
  const map = useRef(null);
  const markers = useRef(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const locations = useMemo(() => properties.filter(hasCoordinates), [properties]);

  useEffect(() => {
    const instance = L.map(mapNode.current, {
      center: nicaraguaCenter,
      zoom: 7,
      preferCanvas: true,
      scrollWheelZoom: false,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(instance);
    map.current = instance;
    markers.current = L.layerGroup().addTo(instance);

    return () => {
      instance.remove();
      map.current = null;
      markers.current = null;
    };
  }, []);

  useEffect(() => {
    return onSnapshot(query(collection(db, 'propiedades')), (snapshot) => {
      setProperties(snapshot.docs.map((item) => ({ ...item.data(), id: item.id })));
      setLoading(false);
      setError(false);
    }, () => {
      setError(true);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const instance = map.current;
    const layer = markers.current;
    if (!instance || !layer) return;

    layer.clearLayers();
    const bounds = L.latLngBounds([]);
    for (const property of locations) {
      const coordinates = [Number(property.lat), Number(property.lng)];
      const label = document.createElement('span');
      label.className = 'price-marker';
      label.textContent = formatUSD(property.price ?? property.precio);
      const marker = L.marker(coordinates, {
        icon: L.divIcon({ html: label, className: 'property-map-marker-wrapper', iconSize: [110, 32], iconAnchor: [55, 30] }),
        title: property.title || property.titulo || 'Propiedad',
        keyboard: true,
      });

      marker.bindPopup(() => createPopup(property, navigate), { className: 'property-map-preview-popup', offset: [0, -28] });
      marker.addTo(layer);
      bounds.extend(coordinates);
    }
    if (locations.length > 1) instance.fitBounds(bounds, { padding: [45, 45], maxZoom: 14 });
    else if (locations.length === 1) instance.setView(bounds.getCenter(), 13);
  }, [locations, navigate]);

  return (
    <>
      <Seo title="Mapa de propiedades | Norvin García" description="Explora en el mapa las propiedades disponibles en Nicaragua." />
      <PageMasthead label="Portafolio inmobiliario · Nicaragua" title="Mapa de propiedades">
        Selecciona un marcador para ver el precio y consultar su ficha.
      </PageMasthead>
      <section className="ng-wrap ng-map-page" aria-label="Mapa inmobiliario interactivo">
        <div className="ng-map-toolbar">
          <p className="ng-meta" role={error ? 'alert' : 'status'}>
            {loading ? 'Cargando ubicaciones…' : error ? 'No se pudieron cargar las ubicaciones.' : locations.length ? `${locations.length} ${locations.length === 1 ? 'propiedad con ubicación' : 'propiedades con ubicación'}` : 'Aún no hay propiedades con ubicación disponible.'}
          </p>
          <Link to="/propiedades" className="ng-button ng-button--line">Ver catálogo</Link>
        </div>
        <div className="ng-map-frame"><div className="ng-map-canvas" ref={mapNode} /></div>
      </section>
    </>
  );
}

export default MapPage;
