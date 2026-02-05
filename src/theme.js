import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1dbf73', // El verde oficial de Fourverr
      contrastText: '#fff', // Texto blanco sobre verde
    },
    secondary: {
      main: '#404145', // Gris oscuro profesional
    },
    background: {
      default: '#f7f7f7', // Fondo gris muy suave para que resalten las cards
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    button: {
      fontWeight: 'bold', // Botones siempre en negritas
      textTransform: 'none' // Evita que todo sea MAYÚSCULAS
    }
  },
  shape: {
    borderRadius: 8, // Bordes redondeados modernos
  }
});

export default theme;