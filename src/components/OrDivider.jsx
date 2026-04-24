import React from 'react';
import { Box, Typography } from '@mui/material';

/**
 * Divisor con etiqueta (ej. "OR" / "O") para separar bloques de UI.
 * Hereda colores del theme activo; acepta override via sx/color.
 */
const OrDivider = ({ label = 'OR', sx, color }) => (
  <Box
    sx={[
      {
        my: 3,
        display: 'flex',
        alignItems: 'center',
        '&::before, &::after': {
          content: '""',
          flex: 1,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        },
      },
      ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
    ]}
  >
    <Typography
      variant="caption"
      sx={{
        color: color || 'text.secondary',
        px: 2,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
      }}
    >
      {label}
    </Typography>
  </Box>
);

export default OrDivider;
