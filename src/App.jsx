import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Home from './pages/Home';
import CrearProducto from './pages/CrearProducto'; 
import Perfil from './pages/Perfil';
import EditarPerfil from './pages/EditarPerfil';
import MisPublicaciones from './pages/MisPublicaciones';
import AdminDashboard from './pages/AdminDashboard'; 
import ProtectedRoute from './components/ProtectedRoute'; 
import DetalleCompra from './pages/DetalleCompra';

function App() {
  return (
    <Router>
      <Routes>
        {/* === RUTA PÚBLICA PRINCIPAL === */}
        <Route path="/" element={<Landing />} />           
        
        {/* === RUTAS PÚBLICAS (Sin Navbar) === */}
        <Route path="/login" element={<Login />} />        
        <Route path="/registro" element={<Registro />} />
        <Route path="/admin" element={<AdminDashboard />} />  {/* Panel admin SIN Navbar */}

        {/* === RUTAS PRIVADAS (Con Navbar automática) === */}
        <Route element={<ProtectedRoute />}>
            <Route path="/detalle-compra" element={<DetalleCompra />} />
            <Route path="/home" element={<Home />} />
            <Route path="/nuevo" element={<CrearProducto />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/editar-perfil" element={<EditarPerfil />} />
            <Route path="/mis-publicaciones" element={<MisPublicaciones />} />
        </Route>

        {/* Redirección por defecto */}
        <Route path="*" element={<Landing />} />           
      </Routes>
    </Router>
  );
}

export default App;