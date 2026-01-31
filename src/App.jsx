import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Registro from './pages/Registro'; // Si no tienes este archivo, borra esta línea
import Home from './pages/Home';
import CrearProducto from './pages/CrearProducto'; 
import ProtectedRoute from './components/ProtectedRoute'; 

function App() {
  return (
    <Router>
      <Routes>
        {/* === RUTAS PÚBLICAS (Sin Navbar) === */}
        <Route path="/" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        {/* === RUTAS PRIVADAS (Con Navbar automática) === */}
        <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<Home />} />
            <Route path="/nuevo" element={<CrearProducto />} />
        </Route>

        {/* Redirección por defecto */}
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;