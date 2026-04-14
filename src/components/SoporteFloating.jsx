import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import ChatSoporte from './ChatSoporte';
import ContactoWidget from './ContactoWidget';

/**
 * Burbuja flotante única: formulario de contacto para visitantes sin sesión,
 * chat en vivo con administración para USER/SELLER autenticados.
 * Los ADMIN usan el panel de soporte; aquí se muestra el formulario de contacto.
 */
const SoporteFloating = () => {
  const location = useLocation();
  const [modo, setModo] = useState('contacto'); // 'contacto' | 'chat'

  const sync = useCallback(() => {
    const token = !!localStorage.getItem('token');
    const rol = localStorage.getItem('usuarioRol') || '';
    const esAdmin = rol === 'ADMIN';
    setModo(token && !esAdmin ? 'chat' : 'contacto');
  }, []);

  useEffect(() => {
    sync();
  }, [location.pathname, sync]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'token' || e.key === 'usuarioRol' || e.key === null) sync();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [sync]);

  return modo === 'chat' ? <ChatSoporte /> : <ContactoWidget />;
};

export default SoporteFloating;
