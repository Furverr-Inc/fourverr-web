import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import ChatSoporte from './ChatSoporte';

const ProtectedRoute = () => {
    const token = localStorage.getItem('token');

    if (!token) {
        return <Navigate to="/" replace />;
    }

    return (
        <>
            <Navbar />
            <Outlet />
            <ChatSoporte />
        </>
    );
};

export default ProtectedRoute;