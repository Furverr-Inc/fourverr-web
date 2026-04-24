import React from 'react';
import { Box } from '@mui/material';
import { useLocation } from 'react-router-dom';

/**
 * Envuelve el contenido de cada ruta para producir una transición fade + translateY
 * al cambiar de ubicación. Respeta prefers-reduced-motion (theme → 0.01ms).
 */
const PageTransition = ({ children }) => {
  const location = useLocation();
  return (
    <Box
      key={location.pathname}
      sx={{
        animation: 'zento-fade-in 280ms cubic-bezier(.2,.8,.2,1)',
      }}
    >
      {children}
    </Box>
  );
};

export default PageTransition;
