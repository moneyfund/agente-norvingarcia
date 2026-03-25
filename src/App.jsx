import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';

const HomePage = lazy(() => import('./pages/HomePage'));
const PropertiesPage = lazy(() => import('./pages/PropertiesPage'));
const PropertyDetailPage = lazy(() => import('./pages/PropertyDetailPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const MapPage = lazy(() => import('./pages/MapPage'));
const SellPage = lazy(() => import('./pages/SellPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));

function App() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-lg">Cargando...</div>}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/propiedades" element={<PropertiesPage />} />
          <Route path="/propiedad/:id" element={<PropertyDetailPage />} />
          <Route path="/sobre-mi" element={<AboutPage />} />
          <Route path="/mapa" element={<MapPage />} />
          <Route path="/quieres-vender" element={<SellPage />} />
          <Route path="/contacto" element={<ContactPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
