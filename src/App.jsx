import { Suspense, lazy, useEffect, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './admin/components/ProtectedRoute';
import Preloader from './components/Preloader';
import { useTheme } from './hooks/useTheme';

const HomePage = lazy(() => import('./pages/HomePage'));
const PropertiesPage = lazy(() => import('./pages/PropertiesPage'));
const PropertyDetailPage = lazy(() => import('./pages/PropertyDetailPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const MapPage = lazy(() => import('./pages/MapPage'));
const SellPage = lazy(() => import('./pages/SellPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const AIPropertyDesignPage = lazy(() => import('./pages/AIPropertyDesignPage'));
const ListadoPage = lazy(() => import('./pages/ListadoPage'));
const EducationPage = lazy(() => import('./pages/EducationPage'));
const AvaluosPage = lazy(() => import('./pages/AvaluosPage'));
const AdminAvaluoDetailPage = lazy(() => import('./admin/pages/AdminAvaluoDetailPage'));

const AdminLayout = lazy(() => import('./admin/layouts/AdminLayout'));
const AdminLoginPage = lazy(() => import('./admin/pages/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('./admin/pages/AdminDashboardPage'));
const AdminPropertiesPage = lazy(() => import('./admin/pages/AdminPropertiesPage'));
const AdminProfilePage = lazy(() => import('./admin/pages/AdminProfilePage'));
const AdminListadosPage = lazy(() => import('./admin/pages/AdminListadosPage'));

function LegacyAvaluoRoute() {
  const { id } = useParams();
  const { search, hash } = useLocation();
  return <Navigate replace to={{ pathname: id ? `/admin/avaluos/${encodeURIComponent(id)}` : '/admin/avaluos', search, hash }} />;
}

function App() {
  const { pathname } = useLocation();
  const theme = useTheme();
  const [showSignature, setShowSignature] = useState(() => {
    const internal = /^\/(admin|avaluos|listado)(\/|$)/.test(pathname);
    return internal ? null : 'loading';
  });

  useEffect(() => {
    if (showSignature !== 'loading') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = setTimeout(() => setShowSignature(reduced ? null : 'revealing'), reduced ? 400 : 2540);
    return () => clearTimeout(timer);
  }, [showSignature]);

  useEffect(() => {
    if (showSignature !== 'revealing') return;
    const timer = setTimeout(() => setShowSignature(null), 460);
    return () => clearTimeout(timer);
  }, [showSignature]);

  return (
    <MotionConfig reducedMotion="user">
      {showSignature && <Preloader signature={showSignature} />}
      <Suspense fallback={<Preloader />}>
        <Routes>
          <Route path="/admin/login" element={<AdminLoginPage {...theme} />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="propiedades" element={<AdminPropertiesPage />} />
              <Route path="perfil" element={<AdminProfilePage />} />
              <Route path="listados" element={<AdminListadosPage />} />
              <Route path="captaciones/nueva" element={<ListadoPage />} />
              <Route path="avaluos" element={<AvaluosPage />} />
              <Route path="avaluos/:id" element={<AdminAvaluoDetailPage />} />
            </Route>
          </Route>

          <Route path="/listado" element={<Navigate to="/admin/captaciones/nueva" replace />} />
          <Route path="/avaluos" element={<LegacyAvaluoRoute />} />
          <Route path="/avaluos/:id" element={<LegacyAvaluoRoute />} />

          <Route element={<MainLayout {...theme} />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/propiedades" element={<PropertiesPage />} />
            <Route path="/propiedad/:id" element={<PropertyDetailPage />} />
            <Route path="/sobre-mi" element={<AboutPage />} />
            <Route path="/mapa" element={<MapPage />} />
            <Route path="/quieres-vender" element={<SellPage />} />
            <Route path="/contacto" element={<ContactPage />} />
            <Route path="/edicion-propiedades" element={<AIPropertyDesignPage />} />
            <Route path="/educacion" element={<EducationPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </MotionConfig>
  );
}

export default App;
