import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Landing        from './pages/Landing';
import Login          from './pages/Login';
import Registro       from './pages/Registro';
import Home           from './pages/Home';
import CrearProducto  from './pages/CrearProducto';
import Perfil         from './pages/Perfil';
import PerfilPublico  from './pages/PerfilPublico';
import EditarPerfil   from './pages/EditarPerfil';
import MisPublicaciones from './pages/MisPublicaciones';
import AdminLayout from './pages/admin/AdminLayout';
import AdminUsuarios from './pages/admin/AdminUsuarios';
import AdminSoporte from './pages/admin/AdminSoporte';
import AdminReportes from './pages/admin/AdminReportes';
import ProtectedRoute from './components/ProtectedRoute';
import DetalleCompra        from './pages/DetalleCompra';
import ConfirmacionCompra  from './pages/ConfirmacionCompra';
import LanguageSwitcher    from './components/LanguageSwitcher';
import PageTransition      from './components/PageTransition';

/** Coincide con vite.config base (dev: `/`, producción GitHub Pages: `/fourverr-web/`) */
const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined;

// Envolvemos las rutas para que la transición dependa de location.pathname
const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <PageTransition key={location.pathname}>
      <Routes location={location}>
        {/* Públicas sin Navbar */}
        <Route path="/"        element={<Landing />} />
        <Route path="/login"   element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="usuarios" replace />} />
          <Route path="usuarios" element={<AdminUsuarios />} />
          <Route path="soporte" element={<AdminSoporte />} />
          <Route path="reportes" element={<AdminReportes />} />
        </Route>

        {/* Perfil público — accesible sin login */}
        <Route path="/perfil/:username" element={<PerfilPublico />} />

        {/* Privadas con Navbar */}
        <Route element={<ProtectedRoute />}>
          <Route path="/home"              element={<Home />} />
          <Route path="/nuevo"             element={<CrearProducto />} />
          <Route path="/perfil"            element={<Perfil />} />
          <Route path="/editar-perfil"     element={<EditarPerfil />} />
          <Route path="/mis-publicaciones" element={<MisPublicaciones />} />
          <Route path="/detalle-compra"    element={<DetalleCompra />} />
          <Route path="/compra-exitosa"    element={<ConfirmacionCompra />} />
        </Route>

        <Route path="*" element={<Landing />} />
      </Routes>
    </PageTransition>
  );
};

function App() {
  return (
    <Router basename={routerBasename}>
      <AnimatedRoutes />
      <LanguageSwitcher />
    </Router>
  );
}

export default App;
