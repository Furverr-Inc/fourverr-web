import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Navbar from './Navbar'; // Asegúrate que Navbar.jsx esté en la carpeta components

const ProtectedRoute = () => {
    // Verificamos si existe la llave
    const token = localStorage.getItem('token');

    // Si no hay token, patada al Login
    if (!token) {
        return <Navigate to="/" replace />;
    }

    // Si hay token, mostramos la Navbar y el contenido (Outlet)
    return (
        <>
            <Navbar />
            <Outlet />
        </>
    );
};

export default ProtectedRoute;