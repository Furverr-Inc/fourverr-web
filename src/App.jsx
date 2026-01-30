import React from "react";
// Importamos las herramientas de navegación de react-router-dom
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Importación de nuestras páginas (vistas)
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Home from "./pages/Home";
import CrearProducto from "./pages/CrearProducto";

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. Ruta inicial: Si el usuario entra a '/', lo mandamos al Login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* 2. Pantalla de Inicio de Sesión */}
        <Route path="/login" element={<Login />} />

        {/* 3. Pantalla para crear cuentas nuevas */}
        <Route path="/registro" element={<Registro />} />

        {/* 4. Pantalla Principal (Catálogo de productos con opción de eliminar) */}
        <Route path="/home" element={<Home />} />

        {/* 5. Pantalla de Ventas (Formulario para subir archivos a Amazon S3) */}
        <Route path="/nuevo" element={<CrearProducto />} />

        {/* 6. Ruta de seguridad: Si escriben cualquier otra cosa, vuelven al Login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;