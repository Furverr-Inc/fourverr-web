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
import DetalleCompra  from './pages/DetalleCompra';
import LanguageSwitcher from './components/LanguageSwitcher'; // ← nuevo

function App() {
  return (
    <Router>
      {/* El switcher aparece en TODAS las páginas, siempre en la esquina */}
      <LanguageSwitcher />

      <Routes>
        <Route path="/"        element={<Landing />} />
        <Route path="/login"   element={<Login />} />
        <Route path="/registro"element={<Registro />} />
        <Route path="/admin"   element={<AdminDashboard />} />
        <Route path="/perfil/:username" element={<PerfilPublico />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/home"              element={<Home />} />
          <Route path="/nuevo"             element={<CrearProducto />} />
          <Route path="/perfil"            element={<Perfil />} />
          <Route path="/editar-perfil"     element={<EditarPerfil />} />
          <Route path="/mis-publicaciones" element={<MisPublicaciones />} />
          <Route path="/detalle-compra"    element={<DetalleCompra />} />
        </Route>

        <Route path="*" element={<Landing />} />
      </Routes>
    </Router>
  );
}

export default App;