import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing        from './pages/Landing';
import Login          from './pages/Login';
import Registro       from './pages/Registro';
import Home           from './pages/Home';
import CrearProducto  from './pages/CrearProducto';
import Perfil         from './pages/Perfil';
import PerfilPublico  from './pages/PerfilPublico';
import EditarPerfil   from './pages/EditarPerfil';
import MisPublicaciones from './pages/MisPublicaciones';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import DetalleCompra        from './pages/DetalleCompra';
import ConfirmacionCompra  from './pages/ConfirmacionCompra';

function App() {
  return (
    <Router>
      <Routes>
        {/* Públicas sin Navbar */}
        <Route path="/"        element={<Landing />} />
        <Route path="/login"   element={<Login />} />
        <Route path="/registro"element={<Registro />} />
        <Route path="/admin"   element={<AdminDashboard />} />

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
    </Router>
  );
}

export default App;
