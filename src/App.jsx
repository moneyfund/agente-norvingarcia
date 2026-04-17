import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './admin/components/ProtectedRoute';
import AdminLayout from './admin/layouts/AdminLayout';

const HomePage = lazy(() => import('./pages/HomePage'));
const PropertiesPage = lazy(() => import('./pages/PropertiesPage'));
const PropertyDetailPage = lazy(() => import('./pages/PropertyDetailPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const MapPage = lazy(() => import('./pages/MapPage'));
const SellPage = lazy(() => import('./pages/SellPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const AIPropertyDesignPage = lazy(() => import('./pages/AIPropertyDesignPage'));

const AdminLoginPage = lazy(() => import('./admin/pages/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('./admin/pages/AdminDashboardPage'));
const AdminPropertiesPage = lazy(() => import('./admin/pages/AdminPropertiesPage'));
const AdminProfilePage = lazy(() => import('./admin/pages/AdminProfilePage'));

function App() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-lg">Cargando...</div>}>
      <Routes>
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="propiedades" element={<AdminPropertiesPage />} />
            <Route path="perfil" element={<AdminProfilePage />} />
          </Route>
        </Route>

        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/propiedades" element={<PropertiesPage />} />
          <Route path="/propiedad/:id" element={<PropertyDetailPage />} />
          <Route path="/sobre-mi" element={<AboutPage />} />
          <Route path="/mapa" element={<MapPage />} />
          <Route path="/quieres-vender" element={<SellPage />} />
          <Route path="/contacto" element={<ContactPage />} />
          <Route path="/edicion-propiedades" element={<AIPropertyDesignPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
